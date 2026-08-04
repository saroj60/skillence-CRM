@extends('layouts.app')

@section('content')
<div class="row justify-content-center">
    <div class="col-md-8">
        <div class="mb-4">
            <a href="{{ route('students.show', $student) }}" class="text-decoration-none small">← Back to Profile</a>
            <h2 class="fw-bold mt-2">Edit Student Profile</h2>
            <p class="text-muted">{{ $student->name }}</p>
        </div>

        <div class="card shadow-sm p-4 border-0">
            <form action="{{ route('students.update', $student) }}" method="POST">
                @csrf
                @method('PUT')
                
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label small fw-medium">Passport Number</label>
                        <input type="text" name="passport_no" class="form-control" value="{{ old('passport_no', $student->passport_no) }}">
                    </div>
                    
                    <div class="col-md-6">
                        <label class="form-label small fw-medium">Date of Birth</label>
                        <input type="date" name="dob" class="form-control" value="{{ old('dob', $student->dob) }}">
                    </div>

                    <div class="col-md-12">
                        <label class="form-label small fw-medium">Academic Summary</label>
                        <textarea name="academic_summary" class="form-control" rows="4">{{ old('academic_summary', $student->academic_summary) }}</textarea>
                    </div>

                    <div class="col-md-6">
                        <label class="form-label small fw-medium">Preferred Country</label>
                        <input type="text" name="preferred_country" class="form-control" value="{{ old('preferred_country', $student->preferred_country) }}">
                    </div>

                    <div class="col-md-6">
                        <label class="form-label small fw-medium">Preferred Course</label>
                        <input type="text" name="preferred_course" class="form-control" value="{{ old('preferred_course', $student->preferred_course) }}">
                    </div>

                    <div class="col-md-6">
                        <label class="form-label small fw-medium">Profile Status</label>
                        <select name="status" class="form-select">
                            <option value="Active" {{ $student->status == 'Active' ? 'selected' : '' }}>Active</option>
                            <option value="Inactive" {{ $student->status == 'Inactive' ? 'selected' : '' }}>Inactive</option>
                            <option value="Graduated" {{ $student->status == 'Graduated' ? 'selected' : '' }}>Graduated</option>
                            <option value="Withdrawn" {{ $student->status == 'Withdrawn' ? 'selected' : '' }}>Withdrawn</option>
                        </select>
                    </div>

                    <div class="col-md-12 mt-4 d-flex justify-content-between align-items-center">
                        <div>
                            @can('delete-records')
                            <button type="submit" form="delete-student-form" class="btn btn-danger shadow-sm">Delete Profile</button>
                            @endcan
                        </div>
                        <button type="submit" class="btn btn-primary px-5 shadow-sm">Save Changes</button>
                    </div>
                </div>
            </form>

            @can('delete-records')
            <form id="delete-student-form" action="{{ route('students.destroy', $student) }}" method="POST" onsubmit="return confirm('Are you sure you want to delete this student profile? This action cannot be undone.')" class="d-none">
                @csrf
                @method('DELETE')
            </form>
            @endcan
        </div>
    </div>
</div>
@endsection
