<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VisaRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'status',
        'interview_date',
        'checklist',
    ];

    protected $casts = [
        'checklist' => 'array',
    ];

    /**
     * Get the student that the visa record belongs to.
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
