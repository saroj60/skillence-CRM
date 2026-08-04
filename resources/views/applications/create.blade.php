@extends('layouts.app')

@section('content')
<div class="row justify-content-center">
    <div class="col-md-6">
        <div class="mb-4">
            <h2 class="fw-bold mt-2">New University Application</h2>
        </div>

        <div class="card shadow-sm p-4 border-0">
            <form action="{{ route('applications.store') }}" method="POST">
                @csrf
                <div class="mb-3">
                    <label class="form-label small fw-medium">Student</label>
                    <select name="student_id" class="form-select @error('student_id') is-invalid @enderror" required {{ isset($student) ? 'disabled' : '' }}>
                        <option value="">Select Student...</option>
                        @foreach($students as $s)
                            <option value="{{ $s->id }}" {{ (isset($student) && $student->id == $s->id) ? 'selected' : '' }}>{{ $s->lead->name }}</option>
                        @endforeach
                    </select>
                    @if(isset($student))
                        <input type="hidden" name="student_id" value="{{ $student->id }}">
                    @endif
                    @error('student_id') <div class="invalid-feedback">{{ $message }}</div> @enderror
                </div>

                <div class="mb-3">
                    <label class="form-label small fw-medium">Course</label>
                    <select name="course_id" class="form-select @error('course_id') is-invalid @enderror" required>
                        <option value="">Select Course...</option>
                        @foreach($courses as $c)
                            <option value="{{ $c->id }}">{{ $c->university->name }} - {{ $c->title }}</option>
                        @endforeach
                    </select>
                    @error('course_id') <div class="invalid-feedback">{{ $message }}</div> @enderror
                </div>

                <div class="mb-3">
                    <label class="form-label small fw-medium">Applied Date</label>
                    <input type="date" name="applied_date" class="form-control" value="{{ date('Y-m-d') }}" required>
                </div>

                <div class="mb-3">
                    <label class="form-label small fw-medium">Initial Status</label>
                    <select name="status" class="form-select">
                        <option value="Applied">Applied</option>
                        <option value="Offer">Conditional Offer</option>
                        <option value="Accepted">Accepted</option>
                    </select>
                </div>

                <div class="mt-4">
                    <button type="submit" class="btn btn-primary w-100 py-2 shadow-sm">Record Application</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
