<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'university_id',
        'title',
        'duration',
        'requirements',
        'deadline',
    ];

    /**
     * Get the university that offers the course.
     */
    public function university()
    {
        return $this->belongsTo(University::class);
    }

    /**
     * Get the applications for the course.
     */
    public function applications()
    {
        return $this->hasMany(Application::class);
    }
}
