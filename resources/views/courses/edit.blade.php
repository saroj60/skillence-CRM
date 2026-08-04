@extends('layouts.app')

@section('content')
<div class="row justify-content-center">
    <div class="col-md-8">
        <div class="mb-4">
            <a href="{{ route('courses.index') }}" class="text-decoration-none small">← Back to Courses</a>
            <h2 class="fw-bold mt-2">Edit Course</h2>
        </div>

        <div class="card shadow-sm p-4 border-0">
            <form action="{{ route('courses.update', $course) }}" method="POST">
                @csrf
                @method('PUT')
                <div class="row g-3">
                    <div class="col-md-12">
                        <label class="form-label small fw-medium">University</label>
                        <select name="university_id" class="form-select @error('university_id') is-invalid @enderror" required>
                            @foreach($universities as $uni)
                                <option value="{{ $uni->id }}" {{ $course->university_id == $uni->id ? 'selected' : '' }}>{{ $uni->name }} ({{ $uni->country }})</option>
                            @endforeach
                        </select>
                        @error('university_id') <div class="invalid-feedback">{{ $message }}</div> @enderror
                    </div>

                    <div class="col-md-12">
                        <label class="form-label small fw-medium">Course Title</label>
                        <input type="text" name="title" class="form-control @error('title') is-invalid @enderror" value="{{ old('title', $course->title) }}" required>
                        @error('title') <div class="invalid-feedback">{{ $message }}</div> @enderror
                    </div>

                    <div class="col-md-6">
                        <label class="form-label small fw-medium">Duration</label>
                        <input type="text" name="duration" class="form-control" value="{{ old('duration', $course->duration) }}">
                    </div>

                    <div class="col-md-6">
                        <label class="form-label small fw-medium">Application Deadline</label>
                        <input type="text" name="deadline" class="form-control" value="{{ old('deadline', $course->deadline) }}">
                    </div>

                    <div class="col-md-12">
                        <label class="form-label small fw-medium">Entry Requirements</label>
                        <textarea name="requirements" class="form-control" rows="4">{{ old('requirements', $course->requirements) }}</textarea>
                    </div>

                    <div class="col-md-12 mt-4 text-end">
                        <button type="submit" class="btn btn-primary px-5 shadow-sm">Update Course</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
