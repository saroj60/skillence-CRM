<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Lead;
use App\Models\Student;
use App\Models\Document;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use Illuminate\Support\Facades\Auth;

class StudentLifecycleTest extends TestCase
{
    use RefreshDatabase;

    public function test_complete_student_lifecycle_qa()
    {
        // 1. Create an admin user to perform the operations
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        $this->actingAs($admin);

        // 2. Create a Lead
        $lead = Lead::create([
            'name' => 'Test Lead',
            'email' => 'testlead@test.com',
            'phone' => '1234567890',
            'source' => 'Facebook',
            'status' => 'New',
            'added_by' => $admin->id,
        ]);

        $this->assertDatabaseHas('leads', [
            'id' => $lead->id,
            'name' => 'Test Lead',
        ]);

        // 3. Convert the Lead to a Student
        $convertData = [
            'lead_id' => $lead->id,
            'passport_no' => 'PSP12345',
            'dob' => '2000-01-01',
            'academic_summary' => 'High School Graduate',
            'preferred_country' => 'Canada',
            'preferred_course' => 'Computer Science',
        ];

        $response = $this->post(route('students.store'), $convertData);
        $response->assertRedirect();

        // Verify Student was created
        $student = Student::where('lead_id', $lead->id)->first();
        $this->assertNotNull($student);
        $this->assertEquals('Test Lead', $student->name);
        $this->assertEquals('Active', $student->status);

        // Verify Lead status changed to Converted
        $this->assertEquals('Converted', $lead->fresh()->status);

        // Verify Process History is logged
        $this->assertDatabaseHas('process_histories', [
            'student_id' => $student->id,
            'new_status' => 'Active',
        ]);

        // 4. View Student Profile
        $response = $this->get(route('students.show', $student));
        $response->assertStatus(200);
        $response->assertSee('Canada');
        $response->assertSee('Computer Science');

        // 5. Update Student Profile
        $updateData = [
            'passport_no' => 'PSP12345-UPDATED',
            'dob' => '2000-01-01',
            'academic_summary' => 'Bachelors Graduate',
            'preferred_country' => 'Canada',
            'preferred_course' => 'Software Engineering',
            'status' => 'Applied',
        ];

        $response = $this->put(route('students.update', $student), $updateData);
        $response->assertRedirect(route('students.show', $student));

        $student = $student->fresh();
        $this->assertEquals('PSP12345-UPDATED', $student->passport_no);
        $this->assertEquals('Software Engineering', $student->preferred_course);
        $this->assertEquals('Applied', $student->status);

        // Verify process history logged status change
        $this->assertDatabaseHas('process_histories', [
            'student_id' => $student->id,
            'old_status' => 'Active',
            'new_status' => 'Applied',
        ]);

        // 6. Upload a Document
        Storage::fake('public');
        $file = UploadedFile::fake()->create('transcript.pdf', 100);

        $docData = [
            'student_id' => $student->id,
            'type' => 'Academic Transcript',
            'file' => $file,
        ];

        $response = $this->post(route('documents.store'), $docData);
        $response->assertRedirect();

        $document = Document::where('student_id', $student->id)->first();
        $this->assertNotNull($document);
        $this->assertEquals('Academic Transcript', $document->type);

        // Verify the file was stored on disk
        Storage::disk('public')->assertExists($document->file_path);

        // 7. View the Document via Secure Route (our newly added feature)
        $response = $this->get(route('documents.show', $document));
        $response->assertStatus(200);

        // Try viewing with a non-admin / non-authorized user (guest)
        Auth::logout();
        $response = $this->get(route('documents.show', $document));
        $response->assertRedirect(route('login')); // guest is redirected to login

        // Login as another user (e.g. role 'others' who did not add the student)
        $otherUser = User::create([
            'name' => 'Other User',
            'email' => 'other@test.com',
            'password' => bcrypt('password'),
            'role' => 'others',
            'status' => 'active',
        ]);
        $this->actingAs($otherUser);

        $response = $this->get(route('documents.show', $document));
        $response->assertStatus(403); // Forbidden (correct security behavior!)

        // 8. Delete the Student
        // Back to admin
        $this->actingAs($admin);
        $response = $this->delete(route('students.destroy', $student));
        $response->assertRedirect(route('students.index'));

        // Verify student is deleted
        $this->assertDatabaseMissing('students', ['id' => $student->id]);
        
        // Verify document record is deleted
        $this->assertDatabaseMissing('documents', ['id' => $document->id]);
    }
}
