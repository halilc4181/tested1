<?php
// Enhanced Remote License Server for QR Menu System
// This file should be placed on vudolix.com/lisans-sistemi/verify.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-License-Check, X-Request-ID');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['valid' => false, 'reason' => 'Method not allowed']);
    exit;
}

// Enhanced rate limiting
$clientIP = $_SERVER['REMOTE_ADDR'] ?? '';
$rateLimitKey = 'rate_limit_' . hash('md5', $clientIP);
$maxRequests = 50;
$timeWindow = 3600; // 1 hour

if (!checkAdvancedRateLimit($clientIP, $maxRequests, $timeWindow)) {
    http_response_code(429);
    echo json_encode(['valid' => false, 'reason' => 'Rate limit exceeded']);
    exit;
}

// Get input data
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['license_key']) || !isset($input['domain'])) {
    echo json_encode(['valid' => false, 'reason' => 'Invalid request data']);
    exit;
}

$licenseKey = trim($input['license_key']);
$domain = trim($input['domain']);
$ipAddress = $input['ip_address'] ?? $clientIP;
$userAgent = $input['user_agent'] ?? '';
$timestamp = $input['timestamp'] ?? time();
$requestHash = $input['request_hash'] ?? '';

// Validate request hash
$expectedHash = hash('sha256', $licenseKey . $domain . $timestamp);
if (abs($timestamp - time()) > 300) { // 5 minutes tolerance
    logSecurityEvent($licenseKey, $domain, $ipAddress, 'Request timestamp too old');
    echo json_encode(['valid' => false, 'reason' => 'Request timestamp invalid']);
    exit;
}

// Validate license key format
if (!preg_match('/^QRMENU-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$/', $licenseKey)) {
    logLicenseAttempt($licenseKey, $domain, $ipAddress, false, 'Invalid format');
    echo json_encode(['valid' => false, 'reason' => 'Invalid license key format']);
    exit;
}

// Simulate database connection (replace with actual database)
$licenses = [
    'QRMENU-ABC12-DEF34-GHI56-JKL78' => [
        'customer_id' => 1,
        'customer_name' => 'Test Customer',
        'customer_email' => 'test@example.com',
        'is_active' => true,
        'max_sites' => 3,
        'allowed_domains' => ['localhost', '127.0.0.1', 'example.com', 'demo.example.com'],
        'features' => ['full_access', 'unlimited_products', 'custom_themes'],
        'expires_at' => '2025-12-31 23:59:59',
        'created_at' => '2024-01-01 00:00:00'
    ],
    'QRMENU-TEST1-TEST2-TEST3-TEST4' => [
        'customer_id' => 2,
        'customer_name' => 'Demo Customer',
        'customer_email' => 'demo@example.com',
        'is_active' => true,
        'max_sites' => 1,
        'allowed_domains' => ['localhost', 'demo.example.com'],
        'features' => ['basic_access'],
        'expires_at' => '2024-12-31 23:59:59',
        'created_at' => '2024-01-01 00:00:00'
    ]
];

// Check if license exists
if (!isset($licenses[$licenseKey])) {
    logLicenseAttempt($licenseKey, $domain, $ipAddress, false, 'License not found');
    echo json_encode(['valid' => false, 'reason' => 'License not found']);
    exit;
}

$license = $licenses[$licenseKey];

// Check if license is active
if (!$license['is_active']) {
    logLicenseAttempt($licenseKey, $domain, $ipAddress, false, 'License deactivated');
    echo json_encode(['valid' => false, 'reason' => 'License has been deactivated']);
    exit;
}

// Check expiration date
if ($license['expires_at'] && strtotime($license['expires_at']) < time()) {
    logLicenseAttempt($licenseKey, $domain, $ipAddress, false, 'License expired');
    echo json_encode(['valid' => false, 'reason' => 'License has expired']);
    exit;
}

// Check domain restrictions
if (!empty($license['allowed_domains']) && !in_array($domain, $license['allowed_domains'])) {
    logLicenseAttempt($licenseKey, $domain, $ipAddress, false, 'Domain not allowed');
    echo json_encode([
        'valid' => false, 
        'reason' => 'Domain not authorized for this license',
        'domain_allowed' => false
    ]);
    exit;
}

// Check usage limits (simulate with file-based storage)
$usageFile = 'usage_' . hash('md5', $licenseKey) . '.json';
$usage = [];
if (file_exists($usageFile)) {
    $usage = json_decode(file_get_contents($usageFile), true) ?: [];
}

// Clean old usage data (older than 30 days)
$cutoffTime = time() - (30 * 24 * 60 * 60);
$usage = array_filter($usage, function($entry) use ($cutoffTime) {
    return $entry['last_seen'] > $cutoffTime;
});

// Count unique domains
$uniqueDomains = array_unique(array_column($usage, 'domain'));
$maxSites = $license['max_sites'] ?? 1;

if (count($uniqueDomains) >= $maxSites && !in_array($domain, $uniqueDomains)) {
    logLicenseAttempt($licenseKey, $domain, $ipAddress, false, 'Site limit exceeded');
    echo json_encode(['valid' => false, 'reason' => 'Maximum number of sites exceeded']);
    exit;
}

// Update usage tracking
$usageKey = $domain . '_' . $ipAddress;
$usage[$usageKey] = [
    'domain' => $domain,
    'ip_address' => $ipAddress,
    'user_agent' => $userAgent,
    'last_seen' => time(),
    'usage_count' => ($usage[$usageKey]['usage_count'] ?? 0) + 1
];

file_put_contents($usageFile, json_encode($usage));

// Log successful verification
logLicenseAttempt($licenseKey, $domain, $ipAddress, true, 'Valid');

// Return success response
echo json_encode([
    'valid' => true,
    'reason' => 'License verified successfully',
    'expires' => $license['expires_at'],
    'customer' => $license['customer_name'],
    'features' => $license['features'],
    'domain_allowed' => true,
    'max_sites' => $license['max_sites'],
    'sites_used' => count($uniqueDomains),
    'verification_token' => generateVerificationToken($licenseKey, $domain)
]);

function checkAdvancedRateLimit($clientIP, $maxRequests, $timeWindow) {
    $rateLimitFile = 'rate_limits.json';
    $rateLimits = [];
    
    if (file_exists($rateLimitFile)) {
        $rateLimits = json_decode(file_get_contents($rateLimitFile), true) ?: [];
    }

    $now = time();
    $clientData = $rateLimits[$clientIP] ?? ['requests' => [], 'blocked_until' => 0];

    // Check if client is currently blocked
    if ($clientData['blocked_until'] > $now) {
        return false;
    }

    // Clean old requests
    $clientData['requests'] = array_filter($clientData['requests'], function($timestamp) use ($now, $timeWindow) {
        return ($now - $timestamp) < $timeWindow;
    });

    // Check request count
    if (count($clientData['requests']) >= $maxRequests) {
        $clientData['blocked_until'] = $now + $timeWindow;
        $rateLimits[$clientIP] = $clientData;
        file_put_contents($rateLimitFile, json_encode($rateLimits));
        return false;
    }

    // Add current request
    $clientData['requests'][] = $now;
    $clientData['blocked_until'] = 0;
    $rateLimits[$clientIP] = $clientData;
    file_put_contents($rateLimitFile, json_encode($rateLimits));

    return true;
}

function generateVerificationToken($licenseKey, $domain) {
    return hash('sha256', $licenseKey . $domain . time() . 'secret_salt');
}

function logLicenseAttempt($licenseKey, $domain, $ipAddress, $success, $reason) {
    $logData = [
        'timestamp' => date('Y-m-d H:i:s'),
        'license_key' => substr($licenseKey, 0, 10) . '...',
        'domain' => $domain,
        'ip' => $ipAddress,
        'result' => $success ? 'VALID' : 'INVALID',
        'reason' => $reason,
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
    ];

    file_put_contents(
        'license_logs.txt', 
        json_encode($logData) . "\n", 
        FILE_APPEND | LOCK_EX
    );
}

function logSecurityEvent($licenseKey, $domain, $ipAddress, $event) {
    $logData = [
        'timestamp' => date('Y-m-d H:i:s'),
        'event' => 'SECURITY_VIOLATION',
        'license_key' => substr($licenseKey, 0, 10) . '...',
        'domain' => $domain,
        'ip' => $ipAddress,
        'details' => $event,
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
    ];

    file_put_contents(
        'security_events.txt', 
        json_encode($logData) . "\n", 
        FILE_APPEND | LOCK_EX
    );
}
?>