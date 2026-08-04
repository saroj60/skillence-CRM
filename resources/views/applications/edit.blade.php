@extends('layouts.app')

@section('content')
<div class="row justify-content-center">
    <div class="col-md-6">
        <div class="mb-4">
            <a href="{{ route('students.show', $application->student_id) }}" class="text-decoration-none small">← Back to Student Profile</a>
            <h2 class="fw-bold mt-2">Edit Application Status</h2>
            <p class="text-muted">{{ $application->student->name }} - {{ $application->course->university->name }}</p>
        </div>

        <div class="card shadow-sm p-4 border-0">
            <form action="{{ route('applications.update', $application) }}" method="POST">
                @csrf
                @method('PUT')
                
                <div class="mb-3">
                    <label class="form-label small fw-medium">Application Status</label>
                    <select name="status" class="form-select @error('status') is-invalid @enderror" required>
                        <option value="Applied" {{ $application->status == 'Applied' ? 'selected' : '' }}>Applied</option>
                        <option value="Offer" {{ $application->status == 'Offer' ? 'selected' : '' }}>Conditional Offer</option>
                        <option value="Accepted" {{ $application->status == 'Accepted' ? 'selected' : '' }}>Accepted</option>
                        <option value="Rejected" {{ $application->status == 'Rejected' ? 'selected' : '' }}>Rejected</option>
                    </select>
                </div>

                <div class="mb-3">
                    <label class="form-label small fw-medium">Update Course (If changed)</label>
                    <select name="course_id" class="form-select">
                        @foreach($courses as $c)
                            <option value="{{ $c->id }}" {{ $application->course_id == $c->id ? 'selected' : '' }}>{{ $c->university->name }} - {{ $c->title }}</option>
                        @endforeach
                    </select>
                </div>

                <div class="mb-3">
                    <label class="form-label small fw-medium">Applied Date</label>
                    <input type="date" name="applied_date" class="form-control" value="{{ old('applied_date', $application->applied_date) }}" required>
                </div>

                <div class="mt-4 d-flex justify-content-between">
                    <button type="submit" class="btn btn-primary px-5 shadow-sm">Update Record</button>
                    @can('delete-records')
                    <form action="{{ route('applications.destroy', $application) }}" method="POST" onsubmit="return confirm('Remove application record?')">
                        @csrf @method('DELETE')
                        <button type="submit" class="btn btn-outline-danger">Remove</button>
                    </form>
                    @endcan
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
