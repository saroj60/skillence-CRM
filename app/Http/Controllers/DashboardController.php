<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\Student;
use App\Models\Application;
use App\Models\VisaRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $isOthers = $user->role === 'others';

        $leadsQuery = Lead::query();
        $studentsQuery = Student::query();
        $visaQuery = VisaRecord::query();

        if ($isOthers) {
            $leadsQuery->where('added_by', $user->id);
            $studentsQuery->where('added_by', $user->id);
            // Visas associated with students this user added
            $visaQuery->whereHas('student', function($q) use ($user) {
                $q->where('added_by', $user->id);
            });
        }

        $stats = [
            'total_leads' => $leadsQuery->count(),
            'active_students' => $studentsQuery->clone()->where('status', 'Active')->count(),
            'total_applications' => Application::count(), // Optional to scope if needed
            'pending_visas' => $visaQuery->whereNotIn('status', ['Visa Granted', 'Visa Refused'])->count(),
        ];

        $recentLeads = $leadsQuery->latest()->take(5)->get();
        $recentStudents = $studentsQuery->with('lead')->latest()->take(5)->get();

        return view('dashboard.index', compact('stats', 'recentLeads', 'recentStudents'));
    }
}
