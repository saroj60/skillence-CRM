@extends('layouts.app')

@section('content')
<div class="row justify-content-center">
    <div class="col-md-6">
        <div class="mb-4">
            <a href="{{ route('users.index') }}" class="text-decoration-none small">← Back to Staff List</a>
            <h2 class="fw-bold mt-2">Edit User: {{ $user->name }}</h2>
        </div>

        <div class="card shadow-sm p-4 border-0">
            <form action="{{ route('users.update', $user) }}" method="POST">
                @csrf
                @method('PUT')
                <div class="mb-3">
                    <label class="form-label small fw-medium">Full Name</label>
                    <input type="text" name="name" class="form-control @error('name') is-invalid @enderror" value="{{ old('name', $user->name) }}" required autofocus>
                    @error('name') <div class="invalid-feedback">{{ $message }}</div> @enderror
                </div>

                <div class="mb-3">
                    <label class="form-label small fw-medium">Email Address</label>
                    <input type="email" name="email" class="form-control @error('email') is-invalid @enderror" value="{{ old('email', $user->email) }}" required>
                    @error('email') <div class="invalid-feedback">{{ $message }}</div> @enderror
                </div>

                <div class="mb-3">
                    <label class="form-label small fw-medium">Password (Leave blank to keep current)</label>
                    <input type="password" name="password" class="form-control @error('password') is-invalid @enderror">
                    @error('password') <div class="invalid-feedback">{{ $message }}</div> @enderror
                </div>

                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label small fw-medium">Role</label>
                        <select name="role" class="form-select" required>
                            <option value="staff" {{ $user->role == 'staff' ? 'selected' : '' }}>Staff (Counselor)</option>
                            <option value="admin" {{ $user->role == 'admin' ? 'selected' : '' }}>System Admin</option>
                            <option value="others" {{ $user->role == 'others' ? 'selected' : '' }}>External/Others</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label small fw-medium">Status</label>
                        <select name="status" class="form-select" required>
                            <option value="active" {{ $user->status == 'active' ? 'selected' : '' }}>Active</option>
                            <option value="inactive" {{ $user->status == 'inactive' ? 'selected' : '' }}>Inactive</option>
                        </select>
                    </div>
                </div>

                <div class="mt-4">
                    <button type="submit" class="btn btn-primary w-100 py-2 shadow-sm">Update User</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
