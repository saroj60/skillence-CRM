@extends('layouts.app')

@section('content')
<div class="row justify-content-center">
    <div class="col-md-6">
        <div class="mb-4">
            <a href="{{ route('universities.index') }}" class="text-decoration-none small">← Back to Universities</a>
            <h2 class="fw-bold mt-2">Edit University</h2>
        </div>

        <div class="card shadow-sm p-4 border-0">
            <form action="{{ route('universities.update', $university) }}" method="POST">
                @csrf
                @method('PUT')
                <div class="mb-3">
                    <label class="form-label small fw-medium">University Name</label>
                    <input type="text" name="name" class="form-control @error('name') is-invalid @enderror" value="{{ old('name', $university->name) }}" required>
                    @error('name') <div class="invalid-feedback">{{ $message }}</div> @enderror
                </div>

                <div class="mb-3">
                    <label class="form-label small fw-medium">Country</label>
                    <input type="text" name="country" class="form-control @error('country') is-invalid @enderror" value="{{ old('country', $university->country) }}" required>
                    @error('country') <div class="invalid-feedback">{{ $message }}</div> @enderror
                </div>

                <div class="mb-3">
                    <label class="form-label small fw-medium">Website URL</label>
                    <input type="url" name="website" class="form-control" value="{{ old('website', $university->website) }}">
                </div>

                <div class="mt-4">
                    <button type="submit" class="btn btn-primary w-100 py-2 shadow-sm">Update University</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
