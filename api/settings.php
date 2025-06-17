<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        $settings = readJsonFile(SETTINGS_FILE);
        sendResponse($settings);
        break;

    case 'PUT':
        if (!$input) {
            sendError('Invalid input data');
        }

        $settings = readJsonFile(SETTINGS_FILE);
        
        // Update settings data
        foreach ($input as $key => $value) {
            $settings[$key] = $value;
        }

        if (writeJsonFile(SETTINGS_FILE, $settings)) {
            sendResponse($settings);
        } else {
            sendError('Failed to update settings');
        }
        break;

    default:
        sendError('Method not allowed', 405);
}
?>