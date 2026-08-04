<?php

namespace App\Http\Controllers;

use App\Models\VisaRecord;
use App\Models\Student;
use App\Models\ProcessHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class VisaRecordController extends Controller
{
    /**
     * Store or update resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'status' => 'required|string',
            'interview_date' => 'nullable|date',
            'checklist' => 'nullable|array',
        ]);

        $student = Student::findOrFail($request->student_id);
        Gate::authorize('manage-related', $student);
        $visaRecord = VisaRecord::where('student_id', $request->student_id)->first();
        $oldStatus = $visaRecord ? $visaRecord->status : 'Not Started';

        VisaRecord::updateOrCreate(
            ['student_id' => $request->student_id],
            $validated
        );

        if ($oldStatus !== $request->status) {
            ProcessHistory::create([
                'student_id' => $request->student_id,
                'old_status' => $oldStatus,
                'new_status' => $request->status,
                'changed_by' => Auth::id(),
                'notes' => 'Visa status updated from profile page.',
            ]);
        }

        return redirect()->back()->with('success', 'Visa record updated.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, VisaRecord $visaRecord)
    {
        $validated = $request->validate([
            'status' => 'required|string',
            'interview_date' => 'nullable|date',
            'checklist' => 'nullable|array',
        ]);

        Gate::authorize('manage-related', $visaRecord->student);
        $oldStatus = $visaRecord->status;
        $visaRecord->update($validated);

        if ($oldStatus !== $request->status) {
            ProcessHistory::create([
                'student_id' => $visaRecord->student_id,
                'old_status' => $oldStatus,
                'new_status' => $request->status,
                'changed_by' => Auth::id(),
                'notes' => 'Visa status updated via management.',
            ]);
        }

        return redirect()->back()->with('success', 'Visa record updated.');
    }
}
