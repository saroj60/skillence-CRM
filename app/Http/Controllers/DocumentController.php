<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Gate;

class DocumentController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'type' => 'required|string|max:100',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:51200', // 50MB limit
        ]);

        $student = Student::findOrFail($request->student_id);
        Gate::authorize('manage-related', $student);
        
        $path = $request->file('file')->store('documents/' . $student->id, 'public');

        Document::create([
            'student_id' => $student->id,
            'type' => $request->type,
            'file_path' => $path,
            'status' => 'Pending',
        ]);

        return redirect()->back()->with('success', 'Document uploaded successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Document $document)
    {
        $request->validate([
            'status' => 'required|string|in:Pending,Verified,Rejected',
        ]);

        Gate::authorize('manage-related', $document->student);
        $document->update(['status' => $request->status]);

        return redirect()->back()->with('success', 'Document status updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Document $document)
    {
        Gate::authorize('delete-records');
        Storage::disk('public')->delete($document->file_path);
        $document->delete();

        return redirect()->back()->with('success', 'Document deleted.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Document $document)
    {
        Gate::authorize('manage-related', $document->student);

        if (!Storage::disk('public')->exists($document->file_path)) {
            abort(404);
        }

        return response()->file(Storage::disk('public')->path($document->file_path));
    }
}
