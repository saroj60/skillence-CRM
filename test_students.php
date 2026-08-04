<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$students = App\Models\Student::with('lead')->get();
foreach($students as $s) {
    echo $s->id . ' | ' . ($s->lead->name ?? 'No Lead') . ' | added_by: ' . $s->added_by . "\n";
}
