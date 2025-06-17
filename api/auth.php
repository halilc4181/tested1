<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'POST':
        if (!$input || !isset($input['email']) || !isset($input['password'])) {
            sendError('Email and password required');
        }

        // Demo authentication - in production, use proper password hashing
        if ($input['email'] === 'diyetisyen@email.com' && $input['password'] === '123456') {
            $user = [
                'id' => '1',
                'email' => 'diyetisyen@email.com',
                'name' => 'Dr. Ayşe Kaya',
                'role' => 'dietitian',
                'photo' => ''
            ];
            
            sendResponse([
                'success' => true,
                'user' => $user,
                'token' => 'demo_token_' . time()
            ]);
        } else {
            sendError('Invalid credentials', 401);
        }
        break;

    default:
        sendError('Method not allowed', 405);
}
?>