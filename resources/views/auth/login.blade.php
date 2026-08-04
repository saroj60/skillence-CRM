@extends('layouts.app')

@section('content')
<div class="row justify-content-center mt-5">
    <div class="col-md-5">
        <div class="card shadow-lg p-4 bg-glass">
            <div class="text-center mb-4">
                <h3 class="fw-bold text-primary">System Login</h3>
                <p class="text-muted small">Internal CRM for Education Consultancy</p>
            </div>

            <form action="{{ url('/login') }}" method="POST">
                @csrf
                <div class="mb-3">
                    <label for="email" class="form-label small fw-medium">Email Address</label>
                    <input type="email" name="email" id="email" class="form-control @error('email') is-invalid @enderror" value="{{ old('email') }}" required autofocus>
                    @error('email')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>

                <div class="mb-3">
                    <label for="password" class="form-label small fw-medium">Password</label>
                    <input type="password" name="password" id="password" class="form-control" required>
                </div>

                <div class="mb-3 form-check">
                    <input type="checkbox" name="remember" id="remember" class="form-check-input">
                    <label class="form-check-label small" for="remember">Remember Me</label>
                </div>

                <button type="submit" class="btn btn-primary w-100 py-2">Login to Dashboard</button>
            </form>
        </div>
        <div class="text-center mt-3 text-muted small">
            &copy; {{ date('Y') }} Skellence Education Consultancy
        </div>
    </div>
</div>
@endsection
