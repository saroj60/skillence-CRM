<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Student;
use App\Models\Course;
use App\Models\ProcessHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class ApplicationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $applications = Application::with(['student.lead', 'course.university'])->latest()->paginate(15);
        return view('applications.index', compact('applications'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $student = $request->has('student_id') ? Student::with('lead')->findOrFail($request->student_id) : null;
        $courses = Course::with('university')->get();
        $students = Student::with('lead')->get();
        return view('applications.create', compact('student', 'courses', 'students'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'course_id' => 'required|exists:courses,id',
            'status' => 'required|string|in:Applied,Offer,Rejected,Accepted',
            'applied_date' => 'required|date',
        ]);

        $application = Application::create($validated);
        
        // Log Application Status
        ProcessHistory::create([
            'student_id' => $application->student_id,
            'application_id' => $application->id,
            'new_status' => $application->status,
            'changed_by' => Auth::id(),
            'notes' => 'New application recorded.',
        ]);

        // Sync Student Status if needed
        $student = $application->student;
        if ($student->status === 'Active') {
            $oldStatus = $student->status;
            $student->update(['status' => 'Applied']);
            
            ProcessHistory::create([
                'student_id' => $student->id,
                'old_status' => $oldStatus,
                'new_status' => 'Applied',
                'changed_by' => Auth::id(),
                'notes' => 'Student status synced with application.',
            ]);
        }

        return redirect()->route('students.show', $request->student_id)->with('success', 'Application recorded successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Application $application)
    {
        Gate::authorize('manage-related', $application->student);
        return view('applications.show', compact('application'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Application $application)
    {
        Gate::authorize('manage-related', $application->student);
        $courses = Course::with('university')->get();
        return view('applications.edit', compact('application', 'courses'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Application $application)
    {
        Gate::authorize('manage-related', $application->student);
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'status' => 'required|string|in:Applied,Offer,Rejected,Accepted',
            'applied_date' => 'required|date',
        ]);

        $oldStatus = $application->status;
        $application->update($validated);

        if ($oldStatus !== $application->status) {
            ProcessHistory::create([
                'student_id' => $application->student_id,
                'application_id' => $application->id,
                'old_status' => $oldStatus,
                'new_status' => $application->status,
                'changed_by' => Auth::id(),
                'notes' => 'Application status updated.',
            ]);

            // Sync Student Status based on application milestones
            $student = $application->student;
            $newStudentStatus = null;

            if ($application->status === 'Offer') {
                $newStudentStatus = 'Offer Holder';
            } elseif ($application->status === 'Accepted') {
                $newStudentStatus = 'Enrolled'; // Or "Accepted", depends on business flow
            }

            if ($newStudentStatus && $student->status !== $newStudentStatus) {
                $oldStudentStatus = $student->status;
                $student->update(['status' => $newStudentStatus]);

                ProcessHistory::create([
                    'student_id' => $student->id,
                    'old_status' => $oldStudentStatus,
                    'new_status' => $newStudentStatus,
                    'changed_by' => Auth::id(),
                    'notes' => 'Student status synced with application update.',
                ]);
            }
        }

        return redirect()->route('students.show', $application->student_id)->with('success', 'Application status updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Application $application)
    {
        Gate::authorize('delete-records');
        $studentId = $application->student_id;
        $application->delete();
        return redirect()->route('students.show', $studentId)->with('success', 'Application removed.');
    }
}
