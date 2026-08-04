<?php

namespace Database\Seeders;

use App\Models\University;
use App\Models\Course;
use Illuminate\Database\Seeder;

class UniversitySeeder extends Seeder
{
    public function run(): void
    {
        $unis = [
            [
                'name' => 'University of Sydney',
                'country' => 'Australia',
                'website' => 'https://sydney.edu.au',
                'courses' => [
                    ['title' => 'Master of Data Science', 'duration' => '2 Years', 'deadline' => '15 Jan'],
                    ['title' => 'Bachelor of Commerce', 'duration' => '3 Years', 'deadline' => '30 Oct'],
                ]
            ],
            [
                'name' => 'University of Toronto',
                'country' => 'Canada',
                'website' => 'https://utoronto.ca',
                'courses' => [
                    ['title' => 'MEng in Computer Science', 'duration' => '1.5 Years', 'deadline' => '01 Dec'],
                    ['title' => 'MBA', 'duration' => '2 Years', 'deadline' => '15 Feb'],
                ]
            ],
            [
                'name' => 'University of Manchester',
                'country' => 'UK',
                'website' => 'https://manchester.ac.uk',
                'courses' => [
                    ['title' => 'MSc Digital Marketing', 'duration' => '1 Year', 'deadline' => '31 May'],
                ]
            ]
        ];

        foreach ($unis as $u) {
            $university = University::create([
                'name' => $u['name'],
                'country' => $u['country'],
                'website' => $u['website'],
            ]);

            foreach ($u['courses'] as $c) {
                Course::create([
                    'university_id' => $university->id,
                    'title' => $c['title'],
                    'duration' => $c['duration'],
                    'deadline' => $c['deadline'],
                    'requirements' => 'Standard international student entry requirements.',
                ]);
            }
        }
    }
}
