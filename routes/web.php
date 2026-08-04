<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\UniversityController;
use App\Http\Controllers\CourseController;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\VisaRecordController;
use App\Http\Controllers\UserController;

// Serve storage files directly for shared hosting without symlink support
Route::get('/storage/{folder}/{id}/{filename}', function ($folder, $id, $filename) {
    $path = storage_path('app/public/' . $folder . '/' . $id . '/' . $filename);
    if (!file_exists($path)) {
        abort(404);
    }
    return response()->file($path);
})->where('filename', '.*');

Route::get('/', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('leads', LeadController::class);
    
    Route::get('/leads/{lead}/convert', [StudentController::class, 'convert'])->name('students.convert');
    Route::resource('students', StudentController::class)->except(['create']);
    
    Route::resource('universities', UniversityController::class);
    Route::resource('courses', CourseController::class);
    
    Route::resource('applications', ApplicationController::class);
    Route::resource('documents', DocumentController::class);
    Route::resource('visa-records', VisaRecordController::class);

    Route::resource('users', UserController::class);
});
