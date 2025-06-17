<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        $dietPlans = readJsonFile(DIET_PLANS_FILE);
        sendResponse($dietPlans);
        break;

    case 'POST':
        if (!$input) {
            sendError('Invalid input data');
        }

        $dietPlans = readJsonFile(DIET_PLANS_FILE);
        
        $newDietPlan = [
            'id' => generateId(),
            'patientId' => $input['patientId'],
            'patientName' => $input['patientName'],
            'title' => $input['title'],
            'createdDate' => $input['createdDate'] ?? date('Y-m-d'),
            'totalCalories' => (int)$input['totalCalories'],
            'duration' => $input['duration'],
            'status' => $input['status'] ?? 'active',
            'type' => $input['type'],
            'meals' => $input['meals'] ?? [],
            'notes' => $input['notes'] ?? ''
        ];
        
        $dietPlans[] = $newDietPlan;
        
        if (writeJsonFile(DIET_PLANS_FILE, $dietPlans)) {
            sendResponse($newDietPlan, 201);
        } else {
            sendError('Failed to save diet plan');
        }
        break;

    case 'PUT':
        $planId = $_GET['id'] ?? null;
        if (!$planId || !$input) {
            sendError('Diet plan ID and input data required');
        }

        $dietPlans = readJsonFile(DIET_PLANS_FILE);
        $planIndex = array_search($planId, array_column($dietPlans, 'id'));
        
        if ($planIndex === false) {
            sendError('Diet plan not found', 404);
        }

        // Update diet plan data
        foreach ($input as $key => $value) {
            if ($key !== 'id') {
                $dietPlans[$planIndex][$key] = $value;
            }
        }

        if (writeJsonFile(DIET_PLANS_FILE, $dietPlans)) {
            sendResponse($dietPlans[$planIndex]);
        } else {
            sendError('Failed to update diet plan');
        }
        break;

    case 'DELETE':
        $planId = $_GET['id'] ?? null;
        if (!$planId) {
            sendError('Diet plan ID required');
        }

        $dietPlans = readJsonFile(DIET_PLANS_FILE);
        $dietPlans = array_filter($dietPlans, function($plan) use ($planId) {
            return $plan['id'] !== $planId;
        });

        if (writeJsonFile(DIET_PLANS_FILE, array_values($dietPlans))) {
            sendResponse(['message' => 'Diet plan deleted successfully']);
        } else {
            sendError('Failed to delete diet plan');
        }
        break;

    default:
        sendError('Method not allowed', 405);
}
?>