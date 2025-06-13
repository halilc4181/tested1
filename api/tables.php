<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$dataFile = '../data/tables.json';

// Ensure data directory exists
if (!file_exists('../data')) {
    mkdir('../data', 0777, true);
}

// Initialize default data if file doesn't exist
if (!file_exists($dataFile)) {
    $defaultData = [
        ['id' => '1', 'name' => 'Masa 1', 'nameEn' => 'Table 1', 'isActive' => true],
        ['id' => '2', 'name' => 'Masa 2', 'nameEn' => 'Table 2', 'isActive' => true],
        ['id' => '3', 'name' => 'Masa 3', 'nameEn' => 'Table 3', 'isActive' => true],
        ['id' => '4', 'name' => 'Masa 4', 'nameEn' => 'Table 4', 'isActive' => true],
        ['id' => '5', 'name' => 'Masa 5', 'nameEn' => 'Table 5', 'isActive' => true]
    ];
    file_put_contents($dataFile, json_encode($defaultData, JSON_PRETTY_PRINT));
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $data = json_decode(file_get_contents($dataFile), true);
    echo json_encode($data);
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $data = json_decode(file_get_contents($dataFile), true);
    
    switch ($input['action']) {
        case 'add':
            $newTable = [
                'id' => uniqid(),
                'name' => $input['name'],
                'nameEn' => $input['nameEn'],
                'isActive' => $input['isActive']
            ];
            $data[] = $newTable;
            break;
            
        case 'update':
            foreach ($data as &$table) {
                if ($table['id'] === $input['id']) {
                    $table = array_merge($table, $input);
                    unset($table['action']);
                    break;
                }
            }
            break;
            
        case 'delete':
            $data = array_filter($data, function($table) use ($input) {
                return $table['id'] !== $input['id'];
            });
            $data = array_values($data);
            break;
    }
    
    file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));
    echo json_encode(['success' => true]);
}
?>