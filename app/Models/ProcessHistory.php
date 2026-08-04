<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProcessHistory extends Model
{
    protected $fillable = [
        'student_id',
        'application_id',
        'old_status',
        'new_status',
        'changed_by',
        'notes',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function application()
    {
        return $this->belongsTo(Application::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
