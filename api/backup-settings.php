<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        $backupSettings = readJsonFile(BACKUP_SETTINGS_FILE);
        sendResponse($backupSettings);
        break;

    case 'PUT':
        if (!$input) {
            sendError('Invalid input data');
        }

        $backupSettings = readJsonFile(BACKUP_SETTINGS_FILE);
        
        // Update backup settings data
        foreach ($input as $key => $value) {
            $backupSettings[$key] = $value;
        }

        if (writeJsonFile(BACKUP_SETTINGS_FILE, $backupSettings)) {
            sendResponse($backupSettings);
        } else {
            sendError('Failed to update backup settings');
        }
        break;

    default:
        sendError('Method not allowed', 405);
}
?>