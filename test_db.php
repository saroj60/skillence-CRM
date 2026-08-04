<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$users = App\Models\User::all();
foreach($users as $user) {
    echo "USER ID: {$user->id} | Name: {$user->name} | Role: {$user->role}\n";
}

echo "----\nLEADS:\n";
$leads = App\Models\Lead::all();
foreach($leads as $lead) {
    echo "LEAD ID: {$lead->id} | Name: {$lead->name} | Added_by: {$lead->added_by}\n";
}

echo "----\nSTUDENTS:\n";
$students = App\Models\Student::with('lead')->get();
foreach($students as $s) {
    echo "STUDENT ID: {$s->id} | Name: " . ($s->lead->name ?? 'No Lead') . " | Added_by: {$s->added_by}\n";
}
