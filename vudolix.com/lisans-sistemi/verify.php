<?php
// Enhanced QR Menu License Verification System - Single Domain Per License
// This file should be placed on vudolix.com/lisans-sistemi/verify.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-License-Request, X-Security-Version, X-Request-ID');

// Security headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['valid' => false, 'reason' => 'Method not allowed']);
    exit;
}

// Enhanced rate limiting with IP reputation
$clientIP = $_SERVER['REMOTE_ADDR'] ?? '';
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
$requestId = $_SERVER['HTTP_X_REQUEST_ID'] ?? uniqid();

if (!checkAdvancedRateLimit($clientIP, $userAgent)) {
    http_response_code(429);
    logSecurityEvent($clientIP, '', 'RATE_LIMIT_EXCEEDED', 'Too many requests');
    echo json_encode(['valid' => false, 'reason' => 'Rate limit exceeded']);
    exit;
}

// Get and validate input data
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !validateRequestStructure($input)) {
    logSecurityEvent($clientIP, '', 'INVALID_REQUEST', 'Malformed request data');
    echo json_encode(['valid' => false, 'reason' => 'Invalid request data']);
    exit;
}

$licenseKey = trim($input['license_key']);
$domain = trim($input['domain']);
$url = $input['url'] ?? '';
$timestamp = $input['timestamp'] ?? time() * 1000;
$browserFingerprint = $input['browser_fingerprint'] ?? '';
$securityToken = $input['security_token'] ?? '';

// Validate request timing (prevent replay attacks)
$currentTime = time() * 1000;
if (abs($currentTime - $timestamp) > 300000) { // 5 minutes tolerance
    logSecurityEvent($clientIP, $domain, 'TIMESTAMP_INVALID', 'Request timestamp too old or future');
    echo json_encode(['valid' => false, 'reason' => 'Request timestamp invalid']);
    exit;
}

// Validate license key format
if (!preg_match('/^QRMENU-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$/', $licenseKey)) {
    logSecurityEvent($clientIP, $domain, 'INVALID_FORMAT', 'License key format invalid');
    echo json_encode(['valid' => false, 'reason' => 'Invalid license key format']);
    exit;
}

// Check for suspicious patterns
if (detectSuspiciousActivity($input, $clientIP, $userAgent)) {
    logSecurityEvent($clientIP, $domain, 'SUSPICIOUS_ACTIVITY', 'Automated or suspicious request detected');
    echo json_encode(['valid' => false, 'reason' => 'Suspicious activity detected']);
    exit;
}

// Load license database - SINGLE VALID LICENSE
$licenses = loadLicenseDatabase();

// Verify license exists and is valid
$licenseValidation = validateLicense($licenseKey, $domain, $licenses);

if (!$licenseValidation['valid']) {
    logSecurityEvent($clientIP, $domain, 'LICENSE_INVALID', $licenseValidation['reason']);
    echo json_encode([
        'valid' => false,
        'reason' => $licenseValidation['reason'],
        'error_code' => $licenseValidation['error_code'] ?? 'UNKNOWN'
    ]);
    exit;
}

// Update usage tracking with enhanced metrics
updateUsageTracking($licenseKey, $domain, $clientIP, $userAgent, $browserFingerprint);

// Log successful verification
logLicenseAttempt($licenseKey, $domain, $clientIP, true, 'Valid', $requestId);

// Generate secure verification token
$verificationToken = generateSecureToken($licenseKey, $domain, $timestamp);

// Return enhanced success response
echo json_encode([
    'valid' => true,
    'reason' => 'License verified successfully',
    'expires' => $licenseValidation['license']['expires_at'],
    'customer' => $licenseValidation['license']['customer_name'],
    'features' => $licenseValidation['license']['features'],
    'domain_allowed' => true,
    'max_sites' => 1, // Always 1 for single domain restriction
    'sites_used' => 1,
    'verification_token' => $verificationToken,
    'server_time' => time(),
    'next_check' => time() + 1800, // 30 minutes
    'security_level' => 'high'
]);

function validateRequestStructure($input) {
    $required = ['license_key', 'domain', 'timestamp'];
    foreach ($required as $field) {
        if (!isset($input[$field]) || empty($input[$field])) {
            return false;
        }
    }
    return true;
}

function checkAdvancedRateLimit($clientIP, $userAgent) {
    $rateLimitFile = 'rate_limits.json';
    $maxRequests = 20; // Reasonable limit
    $timeWindow = 3600; // 1 hour
    $suspiciousThreshold = 10;
    
    $rateLimits = [];
    if (file_exists($rateLimitFile)) {
        $rateLimits = json_decode(file_get_contents($rateLimitFile), true) ?: [];
    }

    $now = time();
    $clientKey = hash('sha256', $clientIP . $userAgent);
    $clientData = $rateLimits[$clientKey] ?? [
        'requests' => [],
        'blocked_until' => 0,
        'suspicious_score' => 0,
        'first_seen' => $now
    ];

    // Check if client is currently blocked
    if ($clientData['blocked_until'] > $now) {
        return false;
    }

    // Clean old requests
    $clientData['requests'] = array_filter($clientData['requests'], function($timestamp) use ($now, $timeWindow) {
        return ($now - $timestamp) < $timeWindow;
    });

    // Check request count
    $requestCount = count($clientData['requests']);
    
    if ($requestCount >= $maxRequests) {
        $clientData['blocked_until'] = $now + $timeWindow;
        $clientData['suspicious_score'] += 10;
        $rateLimits[$clientKey] = $clientData;
        file_put_contents($rateLimitFile, json_encode($rateLimits));
        return false;
    }

    // Increase suspicious score for rapid requests
    if ($requestCount >= $suspiciousThreshold) {
        $clientData['suspicious_score'] += 1;
    }

    // Add current request
    $clientData['requests'][] = $now;
    $rateLimits[$clientKey] = $clientData;
    file_put_contents($rateLimitFile, json_encode($rateLimits));

    return true;
}

function detectSuspiciousActivity($input, $clientIP, $userAgent) {
    // Check for automated requests
    if (empty($userAgent) || strlen($userAgent) < 20) {
        return true;
    }

    // Check for common bot user agents
    $botPatterns = [
        '/bot/i', '/crawler/i', '/spider/i', '/scraper/i',
        '/curl/i', '/wget/i', '/python/i', '/php/i'
    ];
    
    foreach ($botPatterns as $pattern) {
        if (preg_match($pattern, $userAgent)) {
            return true;
        }
    }

    return false;
}

function loadLicenseDatabase() {
    // SINGLE VALID LICENSE SYSTEM
    return [
        'QRMENU-VB5T9-HY7U1-LK4R8-JM6E2' => [
            'customer_id' => 1,
            'customer_name' => 'Vudolix QR Menu License',
            'customer_email' => 'admin@vudolix.com',
            'is_active' => true,
            'max_sites' => 1, // Single domain restriction
            'registered_domain' => null, // Will be set on first use
            'features' => ['full_access', 'unlimited_products', 'custom_themes', 'priority_support'],
            'expires_at' => '2025-12-31 23:59:59',
            'created_at' => '2024-01-01 00:00:00',
            'license_type' => 'professional'
        ]
    ];
}

function validateLicense($licenseKey, $domain, $licenses) {
    // Check if license exists
    if (!isset($licenses[$licenseKey])) {
        return [
            'valid' => false,
            'reason' => 'License not found in database',
            'error_code' => 'LICENSE_NOT_FOUND'
        ];
    }

    $license = $licenses[$licenseKey];

    // Check if license is active
    if (!$license['is_active']) {
        return [
            'valid' => false,
            'reason' => 'License has been deactivated',
            'error_code' => 'LICENSE_DEACTIVATED'
        ];
    }

    // Check expiration date
    if ($license['expires_at'] && strtotime($license['expires_at']) < time()) {
        return [
            'valid' => false,
            'reason' => 'License has expired on ' . $license['expires_at'],
            'error_code' => 'LICENSE_EXPIRED'
        ];
    }

    // SINGLE DOMAIN RESTRICTION - Check if domain is already registered
    $registeredDomain = getRegisteredDomain($licenseKey);
    
    if ($registeredDomain === null) {
        // First time use - register this domain
        registerDomain($licenseKey, $domain);
        $registeredDomain = $domain;
    } elseif ($registeredDomain !== $domain) {
        // Domain mismatch - license already used on different domain
        return [
            'valid' => false,
            'reason' => "License already registered to domain: $registeredDomain. Each license can only be used on one domain.",
            'error_code' => 'DOMAIN_ALREADY_REGISTERED'
        ];
    }

    return [
        'valid' => true,
        'license' => $license,
        'registered_domain' => $registeredDomain
    ];
}

function getRegisteredDomain($licenseKey) {
    $domainFile = 'domain_' . hash('md5', $licenseKey) . '.json';
    
    if (!file_exists($domainFile)) {
        return null;
    }
    
    $domainData = json_decode(file_get_contents($domainFile), true);
    return $domainData['domain'] ?? null;
}

function registerDomain($licenseKey, $domain) {
    $domainFile = 'domain_' . hash('md5', $licenseKey) . '.json';
    
    $domainData = [
        'license_key' => $licenseKey,
        'domain' => $domain,
        'registered_at' => date('Y-m-d H:i:s'),
        'first_ip' => $_SERVER['REMOTE_ADDR'] ?? '',
        'first_user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
    ];
    
    file_put_contents($domainFile, json_encode($domainData, JSON_PRETTY_PRINT));
    
    // Log domain registration
    logDomainRegistration($licenseKey, $domain);
}

function logDomainRegistration($licenseKey, $domain) {
    $logData = [
        'timestamp' => date('Y-m-d H:i:s'),
        'event' => 'DOMAIN_REGISTERED',
        'license_key' => substr($licenseKey, 0, 10) . '...',
        'domain' => $domain,
        'ip' => $_SERVER['REMOTE_ADDR'] ?? '',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
    ];

    file_put_contents(
        'domain_registrations.txt', 
        json_encode($logData) . "\n", 
        FILE_APPEND | LOCK_EX
    );
}

function updateUsageTracking($licenseKey, $domain, $clientIP, $userAgent, $browserFingerprint) {
    $usageFile = 'usage_' . hash('md5', $licenseKey) . '.json';
    $usage = [];
    
    if (file_exists($usageFile)) {
        $usage = json_decode(file_get_contents($usageFile), true) ?: [];
    }

    $now = time();
    
    // Single entry for the registered domain
    $usage = [
        'license_key' => $licenseKey,
        'domain' => $domain,
        'ip_address' => $clientIP,
        'user_agent' => $userAgent,
        'browser_fingerprint' => $browserFingerprint,
        'last_seen' => $now,
        'usage_count' => ($usage['usage_count'] ?? 0) + 1,
        'first_seen' => $usage['first_seen'] ?? $now
    ];

    file_put_contents($usageFile, json_encode($usage, JSON_PRETTY_PRINT));
}

function generateSecureToken($licenseKey, $domain, $timestamp) {
    $secret = 'QRM_SECRET_2024_VUDOLIX_SINGLE_DOMAIN';
    $data = $licenseKey . $domain . $timestamp . $secret;
    return hash('sha256', $data);
}

function logLicenseAttempt($licenseKey, $domain, $ipAddress, $success, $reason, $requestId) {
    $logData = [
        'timestamp' => date('Y-m-d H:i:s'),
        'request_id' => $requestId,
        'license_key' => substr($licenseKey, 0, 10) . '...',
        'domain' => $domain,
        'ip' => $ipAddress,
        'result' => $success ? 'VALID' : 'INVALID',
        'reason' => $reason,
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
        'server_version' => '2.0-single-domain'
    ];

    file_put_contents(
        'license_logs.txt', 
        json_encode($logData) . "\n", 
        FILE_APPEND | LOCK_EX
    );
}

function logSecurityEvent($ipAddress, $domain, $event, $details) {
    $logData = [
        'timestamp' => date('Y-m-d H:i:s'),
        'event' => 'SECURITY_VIOLATION',
        'violation_type' => $event,
        'domain' => $domain,
        'ip' => $ipAddress,
        'details' => $details,
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
        'request_uri' => $_SERVER['REQUEST_URI'] ?? '',
        'severity' => getSeverityLevel($event)
    ];

    file_put_contents(
        'security_events.txt', 
        json_encode($logData) . "\n", 
        FILE_APPEND | LOCK_EX
    );

    // Send alert for critical events
    if ($logData['severity'] === 'critical') {
        sendSecurityAlert($logData);
    }
}

function getSeverityLevel($event) {
    $criticalEvents = ['SUSPICIOUS_ACTIVITY', 'RATE_LIMIT_EXCEEDED', 'DOMAIN_ALREADY_REGISTERED'];
    $highEvents = ['LICENSE_INVALID', 'LICENSE_NOT_FOUND'];
    
    if (in_array($event, $criticalEvents)) return 'critical';
    if (in_array($event, $highEvents)) return 'high';
    return 'medium';
}

function sendSecurityAlert($logData) {
    // In production, send email/SMS/webhook notification
    error_log("SECURITY ALERT: " . json_encode($logData));
}
?>