@extends('layouts.app')

@section('content')
<div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="fw-bold">Student Database</h2>
    <div>
        <span class="text-muted small me-3">{{ $students->total() }} profiles found</span>
        <a href="{{ route('leads.create') }}" class="btn btn-primary shadow-sm">+ Add New Student <span class="opacity-75 fw-normal" style="font-size: 0.85em;">(via Lead)</span></a>
    </div>
</div>

@if(session('success'))
    <div class="alert alert-success alert-dismissible fade show" role="alert">
        {{ session('success') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
@endif

<div class="card shadow-sm border-0">
    <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
            <thead class="bg-light text-muted small text-uppercase">
                <tr>
                    <th class="px-4 py-3">Student Name</th>
                    <th class="py-3">Passport</th>
                    <th class="py-3">Preferred Country</th>
                    <th class="py-3">Status</th>
                    <th class="text-end px-4 py-3">Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse($students as $student)
                <tr>
                    <td class="px-4">
                        <div class="fw-medium">{{ $student->name }}</div>
                        <div class="text-muted small">{{ $student->email }}</div>
                    </td>
                    <td><code>{{ $student->passport_no ?? 'N/A' }}</code></td>
                    <td>{{ $student->preferred_country ?? 'Unspecified' }}</td>
                    <td><span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">{{ $student->status }}</span></td>
                    <td class="text-end px-4">
                        <div class="d-flex justify-content-end align-items-center gap-1">
                            <a href="{{ route('students.show', $student) }}" class="btn btn-sm btn-primary">Profile</a>
                            <a href="{{ route('students.edit', $student) }}" class="btn btn-sm btn-outline-secondary">Edit</a>
                            @can('delete-records')
                            <form action="{{ route('students.destroy', $student) }}" method="POST" onsubmit="return confirm('Are you sure you want to delete this student profile? This action cannot be undone.')" class="d-inline">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="btn btn-sm btn-danger">Delete</button>
                            </form>
                            @endcan
                        </div>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="5" class="text-center py-5 text-muted">No students yet. Convert some leads first!</td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    @if($students->hasPages())
    <div class="card-footer bg-white border-0">
        {{ $students->links() }}
    </div>
    @endif
</div>
@endsection
