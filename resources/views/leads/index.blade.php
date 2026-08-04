@extends('layouts.app')

@section('content')
<div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="fw-bold">Lead Management</h2>
    <a href="{{ route('leads.create') }}" class="btn btn-primary">+ Add New Lead</a>
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
                    <th class="px-4 py-3">Student Name</th>
                    <th class="py-3">Contact</th>
                    <th class="py-3">Source</th>
                    <th class="py-3">Status</th>
                    <th class="py-3">Assigned To</th>
                    <th class="text-end px-4 py-3">Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse($leads as $lead)
                <tr>
                    <td class="px-4 fw-medium">{{ $lead->name }}</td>
                    <td>
                        <div class="small">{{ $lead->phone }}</div>
                        <div class="text-muted small">{{ $lead->email }}</div>
                    </td>
                    <td><span class="badge bg-light text-dark border">{{ $lead->source ?? 'Unknown' }}</span></td>
                    <td>
                        @php
                            $colors = ['New' => 'primary', 'Contacted' => 'info', 'Converted' => 'success'];
                            $color = $colors[$lead->status] ?? 'secondary';
                        @endphp
                        <span class="badge bg-{{ $color }}">{{ $lead->status }}</span>
                    </td>
                    <td>{{ $lead->assignedTo->name ?? 'Unassigned' }}</td>
                    <td class="text-end px-4">
                        <div class="btn-group">
                            <a href="{{ route('leads.edit', $lead) }}" class="btn btn-sm btn-outline-secondary">Edit</a>
                            @can('delete-records')
                            <form action="{{ route('leads.destroy', $lead) }}" method="POST" onsubmit="return confirm('Delete this lead?')">
                                @csrf @method('DELETE')
                                <button type="submit" class="btn btn-sm btn-outline-danger border-0">Del</button>
                            </form>
                            @endcan
                        </div>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="6" class="text-center py-5 text-muted">No leads found. Start by adding one!</td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>
    @if($leads->hasPages())
    <div class="card-footer bg-white border-0">
        {{ $leads->links() }}
    </div>
    @endif
</div>
@endsection
