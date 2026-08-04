<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::updateOrCreate(
            ['email' => 'skillencecrm@gmail.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('skillencecrm@@2026'),
                'role' => 'admin',
                'status' => 'active',
            ]
        );

        $this->call([
            UniversitySeeder::class,
        ]);
    }
}
