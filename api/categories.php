<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$dataFile = '../data/categories.json';

// Ensure data directory exists
if (!file_exists('../data')) {
    mkdir('../data', 0777, true);
}

// Initialize default data if file doesn't exist
if (!file_exists($dataFile)) {
    $defaultData = [
        [
            'id' => '1',
            'name' => 'Sıcak İçecekler',
            'nameEn' => 'Hot Beverages',
            'icon' => 'coffee',
            'order' => 1,
            'isActive' => true,
            'showOnHome' => true,
            'image' => 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400'
        ],
        [
            'id' => '2',
            'name' => 'Soğuk İçecekler',
            'nameEn' => 'Cold Beverages',
            'icon' => 'glass-water',
            'order' => 2,
            'isActive' => true,
            'showOnHome' => true,
            'image' => 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=400'
        ],
        [
            'id' => '3',
            'name' => 'Kahvaltı',
            'nameEn' => 'Breakfast',
            'icon' => 'croissant',
            'order' => 3,
            'isActive' => true,
            'showOnHome' => true,
            'image' => 'https://images.pexels.com/photos/824635/pexels-photo-824635.jpeg?auto=compress&cs=tinysrgb&w=400'
        ],
        [
            'id' => '4',
            'name' => 'Ana Yemekler',
            'nameEn' => 'Main Dishes',
            'icon' => 'chef-hat',
            'order' => 4,
            'isActive' => true,
            'showOnHome' => true,
            'image' => 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400'
        ],
        [
            'id' => '5',
            'name' => 'Tatlılar',
            'nameEn' => 'Desserts',
            'icon' => 'cake',
            'order' => 5,
            'isActive' => true,
            'showOnHome' => false,
            'image' => 'https://images.pexels.com/photos/4686819/pexels-photo-4686819.jpeg?auto=compress&cs=tinysrgb&w=400'
        ],
        [
            'id' => '6',
            'name' => 'Aperitifler',
            'nameEn' => 'Appetizers',
            'icon' => 'utensils',
            'order' => 6,
            'isActive' => true,
            'showOnHome' => false,
            'image' => ''
        ]
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
            $newCategory = [
                'id' => uniqid(),
                'name' => $input['name'],
                'nameEn' => $input['nameEn'],
                'icon' => $input['icon'],
                'order' => $input['order'],
                'isActive' => $input['isActive'],
                'showOnHome' => $input['showOnHome'] ?? false,
                'image' => $input['image'] ?? ''
            ];
            $data[] = $newCategory;
            break;
            
        case 'update':
            foreach ($data as &$category) {
                if ($category['id'] === $input['id']) {
                    $category = array_merge($category, $input);
                    unset($category['action']);
                    break;
                }
            }
            break;
            
        case 'delete':
            $data = array_filter($data, function($category) use ($input) {
                return $category['id'] !== $input['id'];
            });
            $data = array_values($data);
            break;
    }
    
    file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));
    echo json_encode(['success' => true]);
}
?>