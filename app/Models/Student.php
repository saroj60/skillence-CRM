<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_id',
        'name',
        'email',
        'phone',
        'passport_no',
        'dob',
        'academic_summary',
        'preferred_country',
        'preferred_course',
        'status',
        'added_by',
    ];

    /**
     * Get the lead that the student came from.
     */
    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    /**
     * Get the applications for the student.
     */
    public function applications()
    {
        return $this->hasMany(Application::class);
    }

    /**
     * Get the documents for the student.
     */
    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    /**
     * Get the visa record for the student.
     */
    public function visaRecord()
    {
        return $this->hasOne(VisaRecord::class);
    }

    /**
     * Get the process history for the student.
     */
    public function processHistories()
    {
        return $this->hasMany(ProcessHistory::class);
    }
}
