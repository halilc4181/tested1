<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$dataFile = '../data/products.json';

// Ensure data directory exists
if (!file_exists('../data')) {
    mkdir('../data', 0777, true);
}

// Initialize default data if file doesn't exist
if (!file_exists($dataFile)) {
    $defaultData = [
        [
            'id' => '1',
            'name' => 'Türk Kahvesi',
            'nameEn' => 'Turkish Coffee',
            'description' => 'Geleneksel Türk kahvesi, orta şekerli, yanında lokum ikram edilir.',
            'descriptionEn' => 'Traditional Turkish coffee, medium sweet, served with Turkish delight.',
            'price' => 25,
            'image' => 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400',
            'category' => '1',
            'likes' => 156,
            'dislikes' => 12,
            'views' => 1250,
            'isActive' => true,
            'variations' => [
                ['id' => '1a', 'name' => 'Şekersiz', 'nameEn' => 'No Sugar', 'priceModifier' => 0, 'isAvailable' => true],
                ['id' => '1b', 'name' => 'Az Şekerli', 'nameEn' => 'Low Sugar', 'priceModifier' => 0, 'isAvailable' => true],
                ['id' => '1c', 'name' => 'Orta Şekerli', 'nameEn' => 'Medium Sugar', 'priceModifier' => 0, 'isAvailable' => true],
                ['id' => '1d', 'name' => 'Şekerli', 'nameEn' => 'Sweet', 'priceModifier' => 0, 'isAvailable' => true]
            ],
            'createdAt' => '2024-01-15T00:00:00Z'
        ],
        [
            'id' => '2',
            'name' => 'Cappuccino',
            'nameEn' => 'Cappuccino',
            'description' => 'İtalyan usulü cappuccino, özel süt köpüğü ve tarçın ile.',
            'descriptionEn' => 'Italian-style cappuccino with special milk foam and cinnamon.',
            'price' => 30,
            'image' => 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400',
            'category' => '1',
            'likes' => 203,
            'dislikes' => 8,
            'views' => 1890,
            'isActive' => true,
            'variations' => [
                ['id' => '2a', 'name' => 'Küçük', 'nameEn' => 'Small', 'priceModifier' => -5, 'isAvailable' => true],
                ['id' => '2b', 'name' => 'Orta', 'nameEn' => 'Medium', 'priceModifier' => 0, 'isAvailable' => true],
                ['id' => '2c', 'name' => 'Büyük', 'nameEn' => 'Large', 'priceModifier' => 8, 'isAvailable' => true]
            ],
            'createdAt' => '2024-01-10T00:00:00Z'
        ],
        [
            'id' => '3',
            'name' => 'Limonata',
            'nameEn' => 'Lemonade',
            'description' => 'Taze sıkılmış limon, naneli, buzlu.',
            'descriptionEn' => 'Fresh squeezed lemon, with mint, iced.',
            'price' => 18,
            'image' => 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=400',
            'category' => '2',
            'likes' => 89,
            'dislikes' => 3,
            'views' => 567,
            'isActive' => true,
            'variations' => [
                ['id' => '3a', 'name' => 'Naneli', 'nameEn' => 'With Mint', 'priceModifier' => 2, 'isAvailable' => true],
                ['id' => '3b', 'name' => 'Basit', 'nameEn' => 'Plain', 'priceModifier' => 0, 'isAvailable' => true]
            ],
            'createdAt' => '2024-01-12T00:00:00Z'
        ],
        [
            'id' => '4',
            'name' => 'Menemen',
            'nameEn' => 'Turkish Scrambled Eggs',
            'description' => 'Domates, biber, soğan ile hazırlanmış geleneksel menemen.',
            'descriptionEn' => 'Traditional scrambled eggs with tomatoes, peppers, and onions.',
            'price' => 45,
            'image' => 'https://images.pexels.com/photos/824635/pexels-photo-824635.jpeg?auto=compress&cs=tinysrgb&w=400',
            'category' => '3',
            'likes' => 178,
            'dislikes' => 15,
            'views' => 2100,
            'isActive' => true,
            'variations' => [
                ['id' => '4a', 'name' => 'Peynirli', 'nameEn' => 'With Cheese', 'priceModifier' => 8, 'isAvailable' => true],
                ['id' => '4b', 'name' => 'Sucuklu', 'nameEn' => 'With Sausage', 'priceModifier' => 12, 'isAvailable' => true],
                ['id' => '4c', 'name' => 'Klasik', 'nameEn' => 'Classic', 'priceModifier' => 0, 'isAvailable' => true]
            ],
            'createdAt' => '2024-01-08T00:00:00Z'
        ],
        [
            'id' => '5',
            'name' => 'Izgara Köfte',
            'nameEn' => 'Grilled Meatballs',
            'description' => 'El yapımı köfteler, ızgara sebze ve pilav ile servis edilir.',
            'descriptionEn' => 'Handmade meatballs served with grilled vegetables and rice.',
            'price' => 85,
            'image' => 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400',
            'category' => '4',
            'likes' => 234,
            'dislikes' => 18,
            'views' => 3200,
            'isActive' => true,
            'variations' => [
                ['id' => '5a', 'name' => 'Tek Porsiyon', 'nameEn' => 'Single Portion', 'priceModifier' => 0, 'isAvailable' => true],
                ['id' => '5b', 'name' => 'Çift Porsiyon', 'nameEn' => 'Double Portion', 'priceModifier' => 35, 'isAvailable' => true]
            ],
            'createdAt' => '2024-01-05T00:00:00Z'
        ],
        [
            'id' => '6',
            'name' => 'Baklava',
            'nameEn' => 'Baklava',
            'description' => 'Geleneksel Türk baklavası, fıstıklı, şerbetli.',
            'descriptionEn' => 'Traditional Turkish baklava with pistachios and syrup.',
            'price' => 35,
            'image' => 'https://images.pexels.com/photos/4686819/pexels-photo-4686819.jpeg?auto=compress&cs=tinysrgb&w=400',
            'category' => '5',
            'likes' => 312,
            'dislikes' => 9,
            'views' => 4100,
            'isActive' => true,
            'variations' => [
                ['id' => '6a', 'name' => 'Fıstıklı', 'nameEn' => 'With Pistachios', 'priceModifier' => 5, 'isAvailable' => true],
                ['id' => '6b', 'name' => 'Cevizli', 'nameEn' => 'With Walnuts', 'priceModifier' => 0, 'isAvailable' => true]
            ],
            'createdAt' => '2024-01-03T00:00:00Z'
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
            $newProduct = [
                'id' => uniqid(),
                'name' => $input['name'],
                'nameEn' => $input['nameEn'],
                'description' => $input['description'],
                'descriptionEn' => $input['descriptionEn'],
                'price' => $input['price'],
                'image' => $input['image'],
                'category' => $input['category'],
                'likes' => 0,
                'dislikes' => 0,
                'views' => 0,
                'isActive' => $input['isActive'],
                'variations' => [],
                'createdAt' => date('c')
            ];
            $data[] = $newProduct;
            break;
            
        case 'update':
            foreach ($data as &$product) {
                if ($product['id'] === $input['id']) {
                    $product = array_merge($product, $input);
                    unset($product['action']);
                    break;
                }
            }
            break;
            
        case 'delete':
            $data = array_filter($data, function($product) use ($input) {
                return $product['id'] !== $input['id'];
            });
            $data = array_values($data);
            break;
            
        case 'like':
            foreach ($data as &$product) {
                if ($product['id'] === $input['id']) {
                    $product['likes']++;
                    break;
                }
            }
            break;
            
        case 'dislike':
            foreach ($data as &$product) {
                if ($product['id'] === $input['id']) {
                    $product['dislikes']++;
                    break;
                }
            }
            break;
            
        case 'incrementViews':
            foreach ($data as &$product) {
                if ($product['id'] === $input['id']) {
                    $product['views']++;
                    break;
                }
            }
            break;
    }
    
    file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));
    echo json_encode(['success' => true]);
}
?>