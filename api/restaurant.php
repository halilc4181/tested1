<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$dataFile = '../data/restaurant.json';

// Ensure data directory exists
if (!file_exists('../data')) {
    mkdir('../data', 0777, true);
}

// Initialize default data if file doesn't exist
if (!file_exists($dataFile)) {
    $defaultData = [
        'name' => 'Lezzet Durağı',
        'nameEn' => 'Taste Station',
        'logo' => 'https://images.pexels.com/photos/1199960/pexels-photo-1199960.jpeg?auto=compress&cs=tinysrgb&w=200',
        'phone' => '+90 212 555 0123',
        'address' => 'Beyoğlu, İstiklal Cad. No:123, İstanbul',
        'addressEn' => 'Beyoğlu, İstiklal Street No:123, Istanbul',
        'wifiPassword' => 'lezzet2024',
        'socialMedia' => [
            'instagram' => '@lezzetduragi',
            'facebook' => 'LezzetDuragiOfficial',
            'twitter' => '@lezzetduragi'
        ]
    ];
    file_put_contents($dataFile, json_encode($defaultData, JSON_PRETTY_PRINT));
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $data = json_decode(file_get_contents($dataFile), true);
    echo json_encode($data);
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if ($input['action'] === 'update') {
        unset($input['action']);
        file_put_contents($dataFile, json_encode($input, JSON_PRETTY_PRINT));
        echo json_encode(['success' => true]);
    }
}
?>