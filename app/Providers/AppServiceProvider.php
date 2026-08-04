<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\User;
class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::define('manage-globals', function (User $user) {
            return $user->role === 'admin';
        });

        Gate::define('delete-records', function (User $user) {
            return $user->role === 'admin';
        });

        Gate::define('manage-lead', function (User $user, $lead) {
            if ($user->role === 'admin' || $user->role === 'staff') {
                return true;
            }
            return $lead->added_by === $user->id;
        });

        Gate::define('manage-student', function (User $user, $student) {
            if ($user->role === 'admin' || $user->role === 'staff') {
                return true;
            }
            return $student->added_by === $user->id;
        });

        Gate::define('manage-related', function (User $user, $student) {
            if ($user->role === 'admin' || $user->role === 'staff') {
                return true;
            }
            return $student && $student->added_by === $user->id;
        });
    }
}
