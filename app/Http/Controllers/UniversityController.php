<?php

namespace App\Http\Controllers;

use App\Models\University;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class UniversityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $universities = University::withCount('courses')->latest()->paginate(10);
        return view('universities.index', compact('universities'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        Gate::authorize('manage-globals');
        return view('universities.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Gate::authorize('manage-globals');
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'country' => 'required|string|max:100',
            'website' => 'nullable|url|max:255',
        ]);

        University::create($validated);

        return redirect()->route('universities.index')->with('success', 'University added successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(University $university)
    {
        $university->load('courses');
        return view('universities.show', compact('university'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(University $university)
    {
        Gate::authorize('manage-globals');
        return view('universities.edit', compact('university'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, University $university)
    {
        Gate::authorize('manage-globals');
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'country' => 'required|string|max:100',
            'website' => 'nullable|url|max:255',
        ]);

        $university->update($validated);

        return redirect()->route('universities.index')->with('success', 'University updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(University $university)
    {
        Gate::authorize('manage-globals');
        $university->delete();
        return redirect()->route('universities.index')->with('success', 'University deleted.');
    }
}
