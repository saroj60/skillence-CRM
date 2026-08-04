@extends('layouts.app')

@section('content')
<div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="fw-bold">Universities</h2>
    @can('manage-globals')
    <a href="{{ route('universities.create') }}" class="btn btn-primary">+ Add University</a>
    @endcan
</div>

@if(session('success'))
    <div class="alert alert-success alert-dismissible fade show" role="alert">
        {{ session('success') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
@endif

<div class="row g-4">
    @forelse($universities as $university)
    <div class="col-md-4">
        <div class="card h-100 border-0 shadow-sm p-3">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <h5 class="fw-bold mb-0">{{ $university->name }}</h5>
                <span class="badge bg-light text-dark border">{{ $university->country }}</span>
            </div>
            <p class="small text-muted mb-3">{{ $university->website }}</p>
            <div class="mt-auto d-flex justify-content-between align-items-center">
                <span class="small fw-medium text-primary">{{ $university->courses_count }} Courses</span>
                @can('manage-globals')
                <div class="btn-group">
                    <a href="{{ route('universities.edit', $university) }}" class="btn btn-sm btn-outline-secondary">Edit</a>
                    <form action="{{ route('universities.destroy', $university) }}" method="POST" onsubmit="return confirm('Delete university?')">
                        @csrf @method('DELETE')
                        <button type="submit" class="btn btn-sm btn-outline-danger">Del</button>
                    </form>
                </div>
                @endcan
            </div>
        </div>
    </div>
    @empty
    <div class="col-12 text-center py-5 text-muted">No universities added yet.</div>
    @endforelse
</div>

<div class="mt-4">
    {{ $universities->links() }}
</div>
@endsection
