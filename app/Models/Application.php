<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'course_id',
        'status',
        'applied_date',
    ];

    /**
     * Get the student that made the application.
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the course being applied for.
     */
    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the process history for the application.
     */
    public function processHistories()
    {
        return $this->hasMany(ProcessHistory::class);
    }
}
