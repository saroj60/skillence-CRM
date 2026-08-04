<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Lead;
use App\Models\ProcessHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class StudentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = Student::with('lead')->latest();
        if (Auth::user()->role === 'others') {
            $query->where('added_by', Auth::id());
        }
        $students = $query->paginate(10);
        return view('students.index', compact('students'));
    }

    /**
     * Show the form for converting a lead to a student.
     */
    public function convert(Lead $lead)
    {
        return view('students.convert', compact('lead'));
    }

    /**
     * Store a newly created resource in storage (conversion logic).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'lead_id' => 'required|exists:leads,id',
            'passport_no' => 'nullable|string|max:50',
            'dob' => 'nullable|date',
            'academic_summary' => 'nullable|string',
            'preferred_country' => 'nullable|string|max:100',
            'preferred_course' => 'nullable|string|max:255',
        ]);

        $validated['status'] = 'Active';

        // Fetch Lead data to populate student basic info
        $lead = Lead::findOrFail($request->lead_id);
        $validated['name'] = $lead->name;
        $validated['email'] = $lead->email;
        $validated['phone'] = $lead->phone;

        $validated['added_by'] = $lead->added_by ?? Auth::id();

        $student = Student::create($validated);
        
        // Log Initial Status
        ProcessHistory::create([
            'student_id' => $student->id,
            'new_status' => $student->status,
            'changed_by' => Auth::id(),
            'notes' => 'Initial profile creation via lead conversion.',
        ]);

        // Update lead status
        $lead = Lead::find($request->lead_id);
        $lead->update(['status' => 'Converted']);

        return redirect()->route('students.show', $student)->with('success', 'Lead converted to Student successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Student $student)
    {
        Gate::authorize('manage-student', $student);
        $student->load([
            'applications.course.university', 
            'documents', 
            'visaRecord',
            'processHistories' => function($query) {
                $query->orderBy('created_at', 'desc');
            },
            'processHistories.user'
        ]);
        $courses = \App\Models\Course::with('university')->get();
        return view('students.show', compact('student', 'courses'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Student $student)
    {
        Gate::authorize('manage-student', $student);
        return view('students.edit', compact('student'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Student $student)
    {
        Gate::authorize('manage-student', $student);
        $validated = $request->validate([
            'passport_no' => 'nullable|string|max:50',
            'dob' => 'nullable|date',
            'academic_summary' => 'nullable|string',
            'preferred_country' => 'nullable|string|max:100',
            'preferred_course' => 'nullable|string|max:255',
            'status' => 'required|string',
        ]);

        $oldStatus = $student->status;
        $student->update($validated);

        if ($oldStatus !== $student->status) {
            ProcessHistory::create([
                'student_id' => $student->id,
                'old_status' => $oldStatus,
                'new_status' => $student->status,
                'changed_by' => Auth::id(),
                'notes' => 'Status manually updated via profile edit.',
            ]);
        }

        return redirect()->route('students.show', $student)->with('success', 'Student profile updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Student $student)
    {
        Gate::authorize('delete-records');
        $student->delete();
        return redirect()->route('students.index')->with('success', 'Student deleted.');
    }
}
