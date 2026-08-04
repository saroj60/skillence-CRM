<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\University;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $courses = Course::with('university')->latest()->paginate(15);
        return view('courses.index', compact('courses'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        Gate::authorize('manage-globals');
        $universities = University::all();
        return view('courses.create', compact('universities'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Gate::authorize('manage-globals');
        $validated = $request->validate([
            'university_id' => 'required|exists:universities,id',
            'title' => 'required|string|max:255',
            'duration' => 'nullable|string|max:255',
            'requirements' => 'nullable|string',
            'deadline' => 'nullable|string|max:255',
        ]);

        Course::create($validated);

        return redirect()->route('courses.index')->with('success', 'Course added successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Course $course)
    {
        return view('courses.show', compact('course'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Course $course)
    {
        Gate::authorize('manage-globals');
        $universities = University::all();
        return view('courses.edit', compact('course', 'universities'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Course $course)
    {
        Gate::authorize('manage-globals');
        $validated = $request->validate([
            'university_id' => 'required|exists:universities,id',
            'title' => 'required|string|max:255',
            'duration' => 'nullable|string|max:255',
            'requirements' => 'nullable|string',
            'deadline' => 'nullable|string|max:255',
        ]);

        $course->update($validated);

        return redirect()->route('courses.index')->with('success', 'Course updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Course $course)
    {
        Gate::authorize('manage-globals');
        $course->delete();
        return redirect()->route('courses.index')->with('success', 'Course deleted.');
    }
}
