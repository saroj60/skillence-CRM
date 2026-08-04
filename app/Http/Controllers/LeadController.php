<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class LeadController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = Lead::with('assignedTo')->latest();
        if (Auth::user()->role === 'others') {
            $query->where('added_by', Auth::id());
        }
        $leads = $query->paginate(10);
        return view('leads.index', compact('leads'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $staff = User::where('role', 'staff')->get();
        $partners = User::where('role', 'others')->get();
        return view('leads.create', compact('staff', 'partners'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'source' => 'nullable|string|max:255',
            'status' => 'required|string|in:New,Contacted,Converted',
            'assigned_to' => 'nullable|exists:users,id',
            'added_by' => 'nullable|exists:users,id',
        ]);

        if (Auth::user()->role === 'others') {
            $validated['added_by'] = Auth::id();
        } else {
            $validated['added_by'] = $request->input('added_by') ?: Auth::id();
        }

        Lead::create($validated);

        return redirect()->route('leads.index')->with('success', 'Lead created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Lead $lead)
    {
        Gate::authorize('manage-lead', $lead);
        return view('leads.show', compact('lead'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Lead $lead)
    {
        Gate::authorize('manage-lead', $lead);
        $staff = User::where('role', 'staff')->get();
        $partners = User::where('role', 'others')->get();
        return view('leads.edit', compact('lead', 'staff', 'partners'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Lead $lead)
    {
        Gate::authorize('manage-lead', $lead);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'source' => 'nullable|string|max:255',
            'status' => 'required|string|in:New,Contacted,Converted',
            'assigned_to' => 'nullable|exists:users,id',
            'added_by' => 'nullable|exists:users,id',
        ]);

        if (Auth::user()->role === 'others') {
            $validated['added_by'] = Auth::id();
        } else {
            // Allow admin removal (if they pass empty), keep if set, fallback if empty logic
            if ($request->has('added_by')) {
                $validated['added_by'] = $request->input('added_by');
            }
        }

        $lead->update($validated);

        return redirect()->route('leads.index')->with('success', 'Lead updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Lead $lead)
    {
        Gate::authorize('delete-records');
        $lead->delete();
        return redirect()->route('leads.index')->with('success', 'Lead deleted successfully.');
    }
}
