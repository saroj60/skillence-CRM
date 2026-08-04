@extends('layouts.app')

@section('content')
<div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="fw-bold">All Applications</h2>
    <a href="{{ route('applications.create') }}" class="btn btn-primary">+ New Application</a>
</div>

<div class="card shadow-sm border-0">
    <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
            <thead class="bg-light text-muted small text-uppercase">
                <tr>
                    <th class="px-4 py-3">Student</th>
                    <th class="py-3">University & Course</th>
                    <th class="py-3">Applied Date</th>
                    <th class="py-3">Status</th>
                    <th class="text-end px-4 py-3">Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse($applications as $app)
                <tr>
                    <td class="px-4">
                        <div class="fw-medium text-dark">{{ $app->student->name }}</div>
                    </td>
                    <td>
                        <div class="fw-medium">{{ $app->course->university->name }}</div>
                        <div class="small text-muted">{{ $app->course->title }}</div>
                    </td>
                    <td>{{ \Carbon\Carbon::parse($app->applied_date)->format('d M Y') }}</td>
                    <td>
                        @php
                            $colors = ['Applied' => 'primary', 'Offer' => 'info', 'Rejected' => 'danger', 'Accepted' => 'success'];
                            $color = $colors[$app->status] ?? 'secondary';
                        @endphp
                        <span class="badge bg-{{ $color }}">{{ $app->status }}</span>
                    </td>
                    <td class="text-end px-4">
                        <a href="{{ route('students.show', $app->student) }}" class="btn btn-sm btn-outline-primary">View Profile</a>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="5" class="text-center py-5 text-muted">No applications found.</td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="card-footer bg-white border-0">
        {{ $applications->links() }}
    </div>
</div>
@endsection
