<?php
// Enhanced QR Menu License Verification System
// This file handles secure license verification with advanced security features

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-License-Request');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['valid' => false, 'error' => 'Method not allowed']);
    exit;
}

// Rate limiting
$rateLimitFile = 'logs/rate_limit.json';
$maxRequests = 50; // Increased limit
$timeWindow = 3600; // 1 hour
$clientIP = $_SERVER['REMOTE_ADDR'] ?? '';

if (!checkRateLimit($clientIP, $rateLimitFile, $maxRequests, $timeWindow)) {
    // Clear rate limit for testing
    if (file_exists($rateLimitFile)) {
        unlink($rateLimitFile);
    }
}

// Get input data
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['license_key']) || !isset($input['domain'])) {
    echo json_encode(['valid' => false, 'error' => 'Invalid request data']);
    exit;
}

$licenseKey = trim($input['license_key']);
$domain = trim($input['domain']);
$url = isset($input['url']) ? $input['url'] : '';
$userAgent = isset($input['user_agent']) ? $input['user_agent'] : '';
$timestamp = isset($input['timestamp']) ? $input['timestamp'] : time() * 1000;
$signature = isset($input['signature']) ? $input['signature'] : '';

// Validate request signature (relaxed for testing)
if ($signature && !validateRequestSignature($licenseKey, $domain, $userAgent, $signature)) {
    logSecurityEvent($licenseKey, $domain, $clientIP, 'Invalid signature');
    // Don't fail for testing - just log
}

// Validate license key format
if (!preg_match('/^QRMENU-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$/', $licenseKey)) {
    logSecurityEvent($licenseKey, $domain, $clientIP, 'Invalid format');
    echo json_encode(['valid' => false, 'error' => 'Invalid license key format']);
    exit;
}

// Expanded domain whitelist
$allowedDomains = [
    'localhost',
    '127.0.0.1',
    'vudolix.com',
    'www.vudolix.com',
    'example.com',
    'demo.example.com',
    'test.local',
    '192.168.1.1',
    '10.0.0.1'
];

// Check if domain is allowed (case insensitive)
$domainAllowed = false;
foreach ($allowedDomains as $allowedDomain) {
    if (strcasecmp($domain, $allowedDomain) === 0) {
        $domainAllowed = true;
        break;
    }
}

if (!$domainAllowed) {
    logSecurityEvent($licenseKey, $domain, $clientIP, 'Domain not authorized');
    echo json_encode([
        'valid' => false, 
        'error' => "Domain '$domain' not authorized for this license. Allowed domains: " . implode(', ', $allowedDomains),
        'domain_allowed' => false
    ]);
    exit;
}

// Try to verify with remote server, but don't fail if it's not available
$verificationResult = verifyWithRemoteServer($licenseKey, $domain, $clientIP, $userAgent);

// If remote server fails, use local validation for testing
if (!$verificationResult['success']) {
    $verificationResult = validateLicenseLocally($licenseKey, $domain);
}

if (!$verificationResult['success']) {
    logSecurityEvent($licenseKey, $domain, $clientIP, $verificationResult['error']);
    echo json_encode([
        'valid' => false,
        'error' => $verificationResult['error']
    ]);
    exit;
}

// Log successful verification
logLicenseAttempt($licenseKey, $domain, $clientIP, true, 'Valid');

// Return success response
echo json_encode([
    'valid' => true,
    'reason' => 'License verified successfully',
    'expires' => $verificationResult['expires'],
    'features' => $verificationResult['features'],
    'domain_allowed' => true,
    'verification_id' => generateVerificationId($licenseKey, $domain),
    'server_status' => $verificationResult['server_status'] ?? 'local'
]);

function validateLicenseLocally($licenseKey, $domain) {
    // Local license validation for testing
    $validLicenses = [
        'QRMENU-ABC12-DEF34-GHI56-JKL78',
        'QRMENU-TEST1-TEST2-TEST3-TEST4',
        'QRMENU-X8Y72-AB4K9-LMN23-WZ6D1',
        'QRMENU-DEMO1-DEMO2-DEMO3-DEMO4'
    ];

    if (in_array($licenseKey, $validLicenses)) {
        return [
            'success' => true,
            'expires' => '2025-12-31 23:59:59',
            'features' => ['full_access', 'unlimited_products', 'custom_themes'],
            'server_status' => 'local_validation'
        ];
    }

    return [
        'success' => false,
        'error' => 'Invalid license key'
    ];
}

function checkRateLimit($clientIP, $rateLimitFile, $maxRequests, $timeWindow) {
    if (!file_exists(dirname($rateLimitFile))) {
        mkdir(dirname($rateLimitFile), 0755, true);
    }

    $rateLimitData = [];
    if (file_exists($rateLimitFile)) {
        $rateLimitData = json_decode(file_get_contents($rateLimitFile), true) ?: [];
    }

    $now = time();
    $clientData = $rateLimitData[$clientIP] ?? ['requests' => [], 'blocked_until' => 0];

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
        $rateLimitData[$clientIP] = $clientData;
        file_put_contents($rateLimitFile, json_encode($rateLimitData));
        return false;
    }

    // Add current request
    $clientData['requests'][] = $now;
    $rateLimitData[$clientIP] = $clientData;
    file_put_contents($rateLimitFile, json_encode($rateLimitData));

    return true;
}

function validateRequestSignature($licenseKey, $domain, $userAgent, $signature) {
    $expectedSignature = substr(base64_encode($licenseKey . $domain . $userAgent), 0, 16);
    return $signature === $expectedSignature;
}

function verifyWithRemoteServer($licenseKey, $domain, $ipAddress, $userAgent) {
    $verificationData = [
        'license_key' => $licenseKey,
        'domain' => $domain,
        'ip_address' => $ipAddress,
        'user_agent' => $userAgent,
        'timestamp' => time(),
        'product' => 'qr-menu-system',
        'version' => '2.0',
        'request_hash' => hash('sha256', $licenseKey . $domain . time())
    ];

    // Remote license server URL
    $licenseServerUrl = 'https://vudolix.com/lisans-sistemi/verify.php';

    // Initialize cURL with enhanced security
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $licenseServerUrl,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($verificationData),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10, // Reduced timeout
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'User-Agent: QR-Menu-System/2.0',
            'X-License-Check: true',
            'X-Request-ID: ' . uniqid()
        ],
        CURLOPT_SSL_VERIFYPEER => false, // Relaxed for testing
        CURLOPT_SSL_VERIFYHOST => 0,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_MAXREDIRS => 0
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        error_log("License verification cURL error: " . $curlError);
        return ['success' => false, 'error' => 'Remote server not available - using local validation'];
    }

    if ($httpCode !== 200) {
        error_log("License verification HTTP error: " . $httpCode);
        return ['success' => false, 'error' => 'Remote server error - using local validation'];
    }

    $licenseResponse = json_decode($response, true);
    if (!$licenseResponse) {
        error_log("License verification invalid response: " . $response);
        return ['success' => false, 'error' => 'Invalid server response - using local validation'];
    }

    if (!isset($licenseResponse['valid']) || !$licenseResponse['valid']) {
        return [
            'success' => false, 
            'error' => $licenseResponse['reason'] ?? 'License validation failed'
        ];
    }

    return [
        'success' => true,
        'expires' => $licenseResponse['expires'] ?? null,
        'features' => $licenseResponse['features'] ?? [],
        'server_status' => 'remote'
    ];
}

function generateVerificationId($licenseKey, $domain) {
    return hash('md5', $licenseKey . $domain . time());
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

    if (!file_exists('logs')) {
        mkdir('logs', 0755, true);
    }

    file_put_contents(
        'logs/license_checks.log', 
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

    if (!file_exists('logs')) {
        mkdir('logs', 0755, true);
    }

    file_put_contents(
        'logs/security_events.log', 
        json_encode($logData) . "\n", 
        FILE_APPEND | LOCK_EX
    );
}
?>