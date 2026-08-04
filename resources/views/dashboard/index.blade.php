@extends('layouts.app')

@section('content')
<div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
    <h1 class="h2">Dashboard Overview</h1>
</div>

<div class="row g-4">
    <div class="col-md-3">
        <div class="card p-3 bg-white h-100 border-0 shadow-sm border-start border-primary border-4">
            <h6 class="text-muted small text-uppercase fw-bold">Total Leads</h6>
            <h2 class="mb-0 fw-bold">{{ $stats['total_leads'] }}</h2>
            <div class="mt-2 small"><a href="{{ route('leads.index') }}" class="text-decoration-none">View all →</a></div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card p-3 bg-white h-100 border-0 shadow-sm border-start border-success border-4">
            <h6 class="text-muted small text-uppercase fw-bold">Active Students</h6>
            <h2 class="mb-0 fw-bold">{{ $stats['active_students'] }}</h2>
            <div class="mt-2 small"><a href="{{ route('students.index') }}" class="text-decoration-none text-success">View all →</a></div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card p-3 bg-white h-100 border-0 shadow-sm border-start border-warning border-4">
            <h6 class="text-muted small text-uppercase fw-bold">Pending Visas</h6>
            <h2 class="mb-0 fw-bold">{{ $stats['pending_visas'] }}</h2>
            <div class="mt-2 small"><span class="text-muted">Ongoing processing</span></div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card p-3 bg-white h-100 border-0 shadow-sm border-start border-info border-4">
            <h6 class="text-muted small text-uppercase fw-bold">Applications</h6>
            <h2 class="mb-0 fw-bold">{{ $stats['total_applications'] }}</h2>
            <div class="mt-2 small"><a href="{{ route('applications.index') }}" class="text-decoration-none text-info">View all →</a></div>
        </div>
    </div>
</div>

<div class="row g-4 mt-2">
    <!-- Recent Leads -->
    <div class="col-md-6">
        <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white py-3">
                <h6 class="mb-0 fw-bold text-primary">Recent Leads</h6>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0 small">
                        <tbody>
                            @foreach($recentLeads as $lead)
                            <tr>
                                <td class="px-3">{{ $lead->name }}</td>
                                <td><span class="badge bg-light text-dark">{{ $lead->status }}</span></td>
                                <td class="text-end px-3 text-muted">{{ $lead->created_at->format('M d') }}</td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- Recent Students -->
    <div class="col-md-6">
        <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white py-3 text-success">
                <h6 class="mb-0 fw-bold">Recent Conversions</h6>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0 small">
                        <tbody>
                            @foreach($recentStudents as $student)
                            <tr>
                                <td class="px-3 text-success fw-medium">{{ $student->name }}</td>
                                <td>{{ $student->preferred_country ?? 'N/A' }}</td>
                                <td class="text-end px-3"><a href="{{ route('students.show', $student) }}" class="text-decoration-none">Profile</a></td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
