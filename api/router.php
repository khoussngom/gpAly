<?php

$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

$path = parse_url($requestUri, PHP_URL_PATH);

if ($path !== '/' && file_exists(__DIR__ . $path)) {
    return false;
}

require_once __DIR__ . '/index.php';
?>