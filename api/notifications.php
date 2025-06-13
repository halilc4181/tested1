<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$dataFile = '../data/notifications.json';

// Ensure data directory exists
if (!file_exists('../data')) {
    mkdir('../data', 0777, true);
}

// Initialize default data if file doesn't exist
if (!file_exists($dataFile)) {
    $defaultData = [];
    file_put_contents($dataFile, json_encode($defaultData, JSON_PRETTY_PRINT));
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $data = json_decode(file_get_contents($dataFile), true);
    // Sort by timestamp, newest first
    usort($data, function($a, $b) {
        return strtotime($b['timestamp']) - strtotime($a['timestamp']);
    });
    echo json_encode($data);
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $data = json_decode(file_get_contents($dataFile), true);
    
    switch ($input['action']) {
        case 'add':
            $newNotification = [
                'id' => uniqid(),
                'tableId' => $input['tableId'],
                'tableName' => $input['tableName'],
                'timestamp' => $input['timestamp']
            ];
            $data[] = $newNotification;
            break;
            
        case 'delete':
            $data = array_filter($data, function($notification) use ($input) {
                return $notification['id'] !== $input['id'];
            });
            $data = array_values($data);
            break;
            
        case 'clear':
            $data = [];
            break;
    }
    
    file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));
    echo json_encode(['success' => true]);
}
?>