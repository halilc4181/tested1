<?php
// Security Log Endpoint for receiving client-side security events

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Security-Log');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Verify this is a security log request
if (!isset($_SERVER['HTTP_X_SECURITY_LOG'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid request']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['event']) || !isset($input['timestamp'])) {
    echo json_encode(['success' => false, 'error' => 'Invalid log data']);
    exit;
}

// Enhance log data with server information
$enhancedLog = array_merge($input, [
    'server_timestamp' => date('Y-m-d H:i:s'),
    'server_ip' => $_SERVER['REMOTE_ADDR'] ?? '',
    'received_at' => time(),
    'log_source' => 'client'
]);

// Store the security log
$logFile = 'client_security_logs.txt';
file_put_contents(
    $logFile,
    json_encode($enhancedLog) . "\n",
    FILE_APPEND | LOCK_EX
);

// Check for critical events that need immediate attention
$criticalEvents = [
    'SECURITY_LOCKDOWN',
    'DOM_TAMPERING',
    'SUSPICIOUS_CONSOLE_USAGE',
    'MULTIPLE_VIOLATIONS'
];

if (in_array($input['event'], $criticalEvents)) {
    // Log to separate critical events file
    file_put_contents(
        'critical_security_events.txt',
        json_encode($enhancedLog) . "\n",
        FILE_APPEND | LOCK_EX
    );
    
    // In production, send immediate alert (email, SMS, webhook)
    error_log("CRITICAL SECURITY EVENT: " . json_encode($enhancedLog));
}

echo json_encode(['success' => true, 'logged' => true]);
?>