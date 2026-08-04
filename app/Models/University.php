<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class University extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'country',
        'website',
    ];

    /**
     * Get the courses offered by the university.
     */
    public function courses()
    {
        return $this->hasMany(Course::class);
    }
}
