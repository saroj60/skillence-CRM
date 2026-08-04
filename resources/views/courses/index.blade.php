@extends('layouts.app')

@section('content')
<div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="fw-bold">Course Finder</h2>
    @can('manage-globals')
    <a href="{{ route('courses.create') }}" class="btn btn-primary">+ Add New Course</a>
    @endcan
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
                    <th class="px-4 py-3">Course Title</th>
                    <th class="py-3">University</th>
                    <th class="py-3">Duration</th>
                    <th class="py-3">Deadline</th>
                    <th class="text-end px-4 py-3">Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse($courses as $course)
                <tr>
                    <td class="px-4 fw-medium">{{ $course->title }}</td>
                    <td>{{ $course->university->name }} ({{ $course->university->country }})</td>
                    <td>{{ $course->duration ?? 'N/A' }}</td>
                    <td><span class="text-danger small fw-medium">{{ $course->deadline ?? 'No deadline' }}</span></td>
                    <td class="text-end px-4">
                        @can('manage-globals')
                        <div class="btn-group">
                            <a href="{{ route('courses.edit', $course) }}" class="btn btn-sm btn-outline-secondary">Edit</a>
                            <form action="{{ route('courses.destroy', $course) }}" method="POST" onsubmit="return confirm('Delete course?')">
                                @csrf @method('DELETE')
                                <button type="submit" class="btn btn-sm btn-outline-danger">Del</button>
                            </form>
                        </div>
                        @endcan
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="5" class="text-center py-5 text-muted">No courses found.</td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    @if($courses->hasPages())
    <div class="card-footer bg-white border-0">
        {{ $courses->links() }}
    </div>
    @endif
</div>
@endsection
