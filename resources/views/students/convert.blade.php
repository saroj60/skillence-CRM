@extends('layouts.app')

@section('content')
<div class="row justify-content-center">
    <div class="col-md-8">
        <div class="mb-4">
            <a href="{{ route('leads.edit', $lead) }}" class="text-decoration-none small">← Back to Lead</a>
            <h2 class="fw-bold mt-2">Convert Lead to Student</h2>
            <p class="text-muted">Student: {{ $lead->name }}</p>
        </div>

        <div class="card shadow-sm p-4 border-0">
            <form action="{{ route('students.store') }}" method="POST">
                @csrf
                <input type="hidden" name="lead_id" value="{{ $lead->id }}">
                
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label small fw-medium">Passport Number</label>
                        <input type="text" name="passport_no" class="form-control" placeholder="Optional">
                    </div>
                    
                    <div class="col-md-6">
                        <label class="form-label small fw-medium">Date of Birth</label>
                        <input type="date" name="dob" class="form-control">
                    </div>

                    <div class="col-md-12">
                        <label class="form-label small fw-medium">Academic Summary</label>
                        <textarea name="academic_summary" class="form-control" rows="3" placeholder="Previous education details..."></textarea>
                    </div>

                    <div class="col-md-6">
                        <label class="form-label small fw-medium">Preferred Country</label>
                        <input type="text" name="preferred_country" class="form-control" placeholder="e.g. Australia, Canada">
                    </div>

                    <div class="col-md-6">
                        <label class="form-label small fw-medium">Preferred Course</label>
                        <input type="text" name="preferred_course" class="form-control" placeholder="e.g. IT, Nursing">
                    </div>

                    <div class="col-md-12 mt-4 text-end">
                        <button type="submit" class="btn btn-success px-5 shadow-sm">Complete Conversion</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
