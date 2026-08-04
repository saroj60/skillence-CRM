@extends('layouts.app')

@section('content')
<div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="fw-bold">Staff Management</h2>
    <a href="{{ route('users.create') }}" class="btn btn-primary">+ Add New Staff</a>
</div>

@if(session('success'))
    <div class="alert alert-success alert-dismissible fade show" role="alert">
        {{ session('success') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
@endif

<div class="card shadow-sm border-0">
    <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
            <thead class="bg-light text-muted small text-uppercase">
                <tr>
                    <th class="px-4 py-3">Full Name</th>
                    <th class="py-3">Email Address</th>
                    <th class="py-3">Role</th>
                    <th class="py-3">Status</th>
                    <th class="text-end px-4 py-3">Actions</th>
                </tr>
            </thead>
            <tbody>
                @foreach($users as $u)
                <tr>
                    <td class="px-4 fw-medium">{{ $u->name }}</td>
                    <td>{{ $u->email }}</td>
                    <td><span class="badge bg-light text-dark border">{{ ucfirst($u->role) }}</span></td>
                    <td>
                        <span class="badge bg-{{ $u->status == 'active' ? 'success' : 'danger' }} bg-opacity-10 text-{{ $u->status == 'active' ? 'success' : 'danger' }} border border-{{ $u->status == 'active' ? 'success' : 'danger' }} border-opacity-25">{{ ucfirst($u->status) }}</span>
                    </td>
                    <td class="text-end px-4">
                        <div class="btn-group">
                            <a href="{{ route('users.edit', $u) }}" class="btn btn-sm btn-outline-secondary">Edit</a>
                            @if($u->id !== Auth::id())
                                <form action="{{ route('users.destroy', $u) }}" method="POST" onsubmit="return confirm('Delete user?')">
                                    @csrf @method('DELETE')
                                    <button type="submit" class="btn btn-sm btn-outline-danger">Del</button>
                                </form>
                            @endif
                        </div>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</div>
@endsection
