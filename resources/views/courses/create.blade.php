@extends('layouts.app')

@section('content')
<div class="row justify-content-center">
    <div class="col-md-8">
        <div class="mb-4">
            <a href="{{ route('courses.index') }}" class="text-decoration-none small">← Back to Courses</a>
            <h2 class="fw-bold mt-2">Add New Course</h2>
        </div>

        <div class="card shadow-sm p-4 border-0">
            <form action="{{ route('courses.store') }}" method="POST">
                @csrf
                <div class="row g-3">
                    <div class="col-md-12">
                        <label class="form-label small fw-medium">Assign to University</label>
                        <select name="university_id" class="form-select @error('university_id') is-invalid @enderror" required>
                            <option value="">Select University...</option>
                            @foreach($universities as $uni)
                                <option value="{{ $uni->id }}">{{ $uni->name }} ({{ $uni->country }})</option>
                            @endforeach
                        </select>
                        @error('university_id') <div class="invalid-feedback">{{ $message }}</div> @enderror
                    </div>

                    <div class="col-md-12">
                        <label class="form-label small fw-medium">Course Title</label>
                        <input type="text" name="title" class="form-control @error('title') is-invalid @enderror" value="{{ old('title') }}" required>
                        @error('title') <div class="invalid-feedback">{{ $message }}</div> @enderror
                    </div>

                    <div class="col-md-6">
                        <label class="form-label small fw-medium">Duration</label>
                        <input type="text" name="duration" class="form-control" value="{{ old('duration') }}" placeholder="e.g. 3 Years, 2 Semesters">
                    </div>

                    <div class="col-md-6">
                        <label class="form-label small fw-medium">Application Deadline</label>
                        <input type="text" name="deadline" class="form-control" value="{{ old('deadline') }}" placeholder="e.g. 15 Jan, Oct 2026">
                    </div>

                    <div class="col-md-12">
                        <label class="form-label small fw-medium">Entry Requirements</label>
                        <textarea name="requirements" class="form-control" rows="4" placeholder="Briefly list entry requirements..."></textarea>
                    </div>

                    <div class="col-md-12 mt-4 text-end">
                        <button type="submit" class="btn btn-primary px-5 shadow-sm">Save Course</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
