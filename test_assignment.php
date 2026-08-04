<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "LEADS:\n";
$leads = App\Models\Lead::all();
foreach($leads as $lead) {
    echo "ID: {$lead->id} | Name: {$lead->name} | assigned: {$lead->assigned_to} | added: {$lead->added_by}\n";
}
