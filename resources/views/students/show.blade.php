@extends('layouts.app')

@section('content')
<div class="mb-4 d-flex justify-content-between align-items-center">
    <div>
        <a href="{{ route('students.index') }}" class="text-decoration-none small">← Back to Database</a>
        <h2 class="fw-bold mt-2">{{ $student->name }}</h2>
        <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">{{ $student->status }}</span>
    </div>
    @if(Auth::user()->role !== 'others')
    <div class="btn-group shadow-sm">
        <a href="{{ route('students.edit', $student) }}" class="btn btn-outline-secondary">Edit Profile</a>
        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#applicationModal">+ New Application</button>
    </div>
    @endif
</div>

<div class="row g-4">
    <!-- Main Profile Info -->
    <div class="col-md-4">
        <div class="card p-4 h-100 border-0 shadow-sm">
            <h5 class="fw-bold mb-4">Personal Details</h5>
            <div class="mb-3">
                <label class="text-muted small d-block">Contact Info</label>
                <div class="fw-medium">{{ $student->phone }}</div>
                <div class="small">{{ $student->email }}</div>
            </div>
            <div class="mb-3">
                <label class="text-muted small d-block">Passport & DOB</label>
                <div class="fw-medium">{{ $student->passport_no ?? 'No Passport' }}</div>
                <div class="small">{{ $student->dob ? \Carbon\Carbon::parse($student->dob)->format('d M Y') : 'DOB not set' }}</div>
            </div>
            <hr>
            <div class="mb-3">
                <label class="text-muted small d-block">Preferences</label>
                <div class="badge bg-light text-dark border">{{ $student->preferred_country ?? 'Any Country' }}</div>
                <div class="small mt-1">{{ $student->preferred_course ?? 'Any Course' }}</div>
            </div>
            <div class="mt-4">
                <label class="text-muted small d-block">Academic Summary</label>
                <p class="small text-dark">{{ $student->academic_summary ?? 'No academic summary provided.' }}</p>
            </div>
            
            <hr>
            <h6 class="fw-bold mb-3">Visa Processing</h6>
            <form action="{{ route('visa-records.store') }}" method="POST">
                @csrf
                <input type="hidden" name="student_id" value="{{ $student->id }}">
                <div class="mb-2">
                    <label class="x-small text-muted">Visa Status</label>
                    <select name="status" class="form-select form-select-sm" onchange="this.form.submit()" {{ Auth::user()->role === 'others' ? 'disabled' : '' }}>
                        <option value="Not Started" {{ ($student->visaRecord->status ?? '') == 'Not Started' ? 'selected' : '' }}>Not Started</option>
                        <option value="Preparation" {{ ($student->visaRecord->status ?? '') == 'Preparation' ? 'selected' : '' }}>Preparation</option>
                        <option value="Interview Scheduled" {{ ($student->visaRecord->status ?? '') == 'Interview Scheduled' ? 'selected' : '' }}>Interview Scheduled</option>
                        <option value="Visa Granted" {{ ($student->visaRecord->status ?? '') == 'Visa Granted' ? 'selected' : '' }}>Visa Granted</option>
                        <option value="Visa Refused" {{ ($student->visaRecord->status ?? '') == 'Visa Refused' ? 'selected' : '' }}>Visa Refused</option>
                    </select>
                </div>
                <div class="mb-0">
                    <label class="x-small text-muted">Interview Date</label>
                    <input type="date" name="interview_date" class="form-control form-control-sm" value="{{ $student->visaRecord->interview_date ?? '' }}" onchange="this.form.submit()" {{ Auth::user()->role === 'others' ? 'readonly' : '' }}>
                </div>
            </form>
        </div>
    </div>

    @if(Auth::user()->role !== 'others')
    <!-- Right Side: Applications & Documents -->
    <div class="col-md-8">
        <!-- Applications Section -->
        <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h6 class="mb-0 fw-bold">Active Applications</h6>
                <span class="badge bg-light text-dark border">{{ $student->applications->count() }}</span>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="bg-light text-muted x-small text-uppercase">
                            <tr>
                                <th class="px-4">University & Course</th>
                                <th>Applied Date</th>
                                <th>Status</th>
                                <th class="text-end px-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($student->applications as $app)
                            <tr>
                                <td class="px-4">
                                    <div class="fw-medium text-primary">{{ $app->course->university->name }}</div>
                                    <div class="small">{{ $app->course->title }}</div>
                                </td>
                                <td>{{ \Carbon\Carbon::parse($app->applied_date)->format('d M Y') }}</td>
                                <td><span class="badge bg-info">{{ $app->status }}</span></td>
                                <td class="text-end px-4">
                                    <button class="btn btn-sm btn-link text-decoration-none p-0">Update</button>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="4" class="text-center py-4 text-muted small">No applications found.</td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Documents Section -->
        <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h6 class="mb-0 fw-bold">Uploaded Documents</h6>
                <button class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#uploadModal">+ Upload</button>
            </div>
            <div class="card-body">
                @if(session('success'))
                    <div class="alert alert-success py-2 small">{{ session('success') }}</div>
                @endif
                <div class="row g-3">
                    @forelse($student->documents as $doc)
                    <div class="col-md-6">
                        <div class="d-flex align-items-center p-2 border rounded bg-light">
                            <div class="me-3 fs-3 text-secondary">📄</div>
                            <div class="flex-grow-1 overflow-hidden">
                                <div class="small fw-bold text-truncate">{{ $doc->type }}</div>
                                <div class="x-small text-muted">{{ $doc->status }}</div>
                            </div>
                            <div class="btn-group">
                                <a href="{{ route('documents.show', $doc) }}" target="_blank" class="btn btn-sm btn-link">View</a>
                                    @can('delete-records')
                                    <form action="{{ route('documents.destroy', $doc) }}" method="POST" onsubmit="return confirm('Delete document?')">
                                        @csrf @method('DELETE')
                                        <button class="btn btn-sm text-danger">Del</button>
                                    </form>
                                    @endcan
                            </div>
                        </div>
                    </div>
                    @empty
                    <div class="text-center py-3 text-muted small w-100">No documents uploaded.</div>
                    @endforelse
                </div>
            </div>
        </div>

        <!-- Pipeline Activity Timeline -->
        <div class="card border-0 shadow-sm">
            <div class="card-header bg-white py-3">
                <h6 class="mb-0 fw-bold">Pipeline Activity</h6>
            </div>
            <div class="card-body">
                <div class="timeline">
                    @forelse($student->processHistories as $history)
                    <div class="timeline-item pb-3 mb-3 border-start ps-4 position-relative">
                        <div class="timeline-dot position-absolute start-0 top-0 translate-middle-x bg-primary rounded-circle" style="width: 12px; height: 12px; margin-top: 6px;"></div>
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <div class="fw-bold small">
                                    @if($history->old_status)
                                        <span class="text-muted text-decoration-line-through">{{ $history->old_status }}</span> → 
                                    @endif
                                    <span class="text-primary">{{ $history->new_status }}</span>
                                </div>
                                <div class="text-muted x-small mt-1">{{ $history->notes }}</div>
                            </div>
                            <div class="text-end">
                                <div class="x-small fw-medium">{{ $history->user->name ?? 'System' }}</div>
                                <div class="x-small text-muted opacity-75">{{ $history->created_at->diffForHumans() }}</div>
                            </div>
                        </div>
                    </div>
                    @empty
                    <div class="text-center py-3 text-muted small">No activity recorded yet.</div>
                    @endforelse
                </div>
            </div>
        </div>
    </div>
    @endif
</div>

<style>
    .timeline-item:last-child {
        border-left: 2px solid transparent !important;
    }
    .timeline-item {
        border-left: 2px solid #e9ecef !important;
    }
    .x-small { font-size: 0.75rem; }
</style>

<!-- Upload Modal -->
<div class="modal fade" id="uploadModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content border-0">
            <div class="modal-header">
                <h5 class="modal-title fw-bold">Upload Student Document</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form action="{{ route('documents.store') }}" method="POST" enctype="multipart/form-data">
                @csrf
                <input type="hidden" name="student_id" value="{{ $student->id }}">
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label small fw-medium">Document Type</label>
                        <select name="type" class="form-select" required>
                            <option value="Passport">Passport</option>
                            <option value="Academic Transcript">Academic Transcript</option>
                            <option value="SOP">Statement of Purpose (SOP)</option>
                            <option value="CV/Resume">CV/Resume</option>
                            <option value="Citizenship">Citizenship Copy</option>
                            <option value="IELTS/PTE Score">IELTS/PTE Score Card</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-medium">Select File (PDF, JPG, PNG)</label>
                        <input type="file" name="file" class="form-control" required>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Upload Document</button>
                </div>
            </form>
        </div>
    </div>
</div>
<!-- Application Modal -->
<div class="modal fade" id="applicationModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content border-0">
            <div class="modal-header">
                <h5 class="modal-title fw-bold">New University Application</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form action="{{ route('applications.store') }}" method="POST">
                @csrf
                <input type="hidden" name="student_id" value="{{ $student->id }}">
                <input type="hidden" name="status" value="Applied">
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label small fw-medium">Select Course & University</label>
                        <select name="course_id" class="form-select" required>
                            <option value="">-- Select Course --</option>
                            @foreach($courses as $course)
                                <option value="{{ $course->id }}">{{ $course->university->name }} - {{ $course->title }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-medium">Applied Date</label>
                        <input type="date" name="applied_date" class="form-control" value="{{ date('Y-m-d') }}" required>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Submit Application</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
