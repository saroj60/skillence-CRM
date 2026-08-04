@extends('layouts.app')

@section('content')
<div class="row justify-content-center">
    <div class="col-md-8">
        <div class="mb-4">
            <a href="{{ route('leads.index') }}" class="text-decoration-none small">← Back to Leads</a>
            <h2 class="fw-bold mt-2">Edit Lead: {{ $lead->name }}</h2>
        </div>

        <div class="card shadow-sm p-4 border-0">
            <form action="{{ route('leads.update', $lead) }}" method="POST">
                @csrf
                @method('PUT')
                <div class="row g-3">
                    <div class="col-md-12">
                        <label class="form-label small fw-medium">Student Full Name</label>
                        <input type="text" name="name" class="form-control @error('name') is-invalid @enderror" value="{{ old('name', $lead->name) }}" required>
                        @error('name') <div class="invalid-feedback">{{ $message }}</div> @enderror
                    </div>
                    
                    <div class="col-md-6">
                        <label class="form-label small fw-medium">Phone Number</label>
                        <input type="text" name="phone" class="form-control" value="{{ old('phone', $lead->phone) }}">
                    </div>

                    <div class="col-md-6">
                        <label class="form-label small fw-medium">Email Address</label>
                        <input type="email" name="email" class="form-control" value="{{ old('email', $lead->email) }}">
                    </div>

                    <div class="col-md-4">
                        <label class="form-label small fw-medium">Source</label>
                        <select name="source" class="form-select">
                            @foreach(['Facebook', 'Instagram', 'Walk-in', 'Referral', 'Website'] as $source)
                                <option value="{{ $source }}" {{ $lead->source == $source ? 'selected' : '' }}>{{ $source }}</option>
                            @endforeach
                        </select>
                    </div>

                    <div class="col-md-4">
                        <label class="form-label small fw-medium">Status</label>
                        <select name="status" class="form-select" {{ $lead->status == 'Converted' ? 'disabled' : '' }}>
                            <option value="New" {{ $lead->status == 'New' ? 'selected' : '' }}>New</option>
                            <option value="Contacted" {{ $lead->status == 'Contacted' ? 'selected' : '' }}>Contacted</option>
                            <option value="Converted" {{ $lead->status == 'Converted' ? 'selected' : '' }}>Converted</option>
                        </select>
                    </div>

                    <div class="col-md-4">
                        <label class="form-label small fw-medium">Assign To Staff</label>
                        <select name="assigned_to" class="form-select">
                            <option value="">Unassigned</option>
                            @foreach($staff as $member)
                                <option value="{{ $member->id }}" {{ $lead->assigned_to == $member->id ? 'selected' : '' }}>{{ $member->name }}</option>
                            @endforeach
                        </select>
                    </div>

                    @if(Auth::user()->role !== 'others')
                    <div class="col-md-12 mt-3 p-3 bg-light rounded border">
                        <label class="form-label small fw-bold text-primary">Referred By (External Partner)</label>
                        <div class="text-muted x-small mb-2">Assign this lead to an 'Others' partner so they can track its visa progress.</div>
                        <select name="added_by" class="form-select">
                            <option value="">-- No Referrer (Direct) --</option>
                            @foreach($partners as $partner)
                                <option value="{{ $partner->id }}" {{ $lead->added_by == $partner->id ? 'selected' : '' }}>{{ $partner->name }}</option>
                            @endforeach
                        </select>
                    </div>
                    @endif

                    <div class="col-md-12 mt-4 d-flex justify-content-between">
                        <button type="submit" class="btn btn-primary px-5 shadow-sm">Update Lead</button>
                        @if($lead->status != 'Converted')
                            <a href="{{ route('students.convert', $lead) }}" class="btn btn-success px-4 shadow-sm">Convert to Student Profile</a>
                        @endif
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
