<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

if (version_compare(PHP_VERSION, '8.2.0', '<')) {
    die('<b>HTTP ERROR 500:</b> Your server is running PHP ' . PHP_VERSION . ', but this Laravel application requires PHP 8.2.0 or higher. Please go to your Hostinger hPanel -> Advanced -> PHP Configuration and change the PHP version to 8.2 or 8.3.');
}

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());
