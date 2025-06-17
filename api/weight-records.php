<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'POST':
        if (!$input || !isset($input['patientId'])) {
            sendError('Patient ID and weight data required');
        }

        $patients = readJsonFile(PATIENTS_FILE);
        $patientIndex = array_search($input['patientId'], array_column($patients, 'id'));
        
        if ($patientIndex === false) {
            sendError('Patient not found', 404);
        }

        $newWeightRecord = [
            'id' => generateId(),
            'patientId' => $input['patientId'],
            'weight' => (float)$input['weight'],
            'date' => $input['date'] ?? date('Y-m-d'),
            'notes' => $input['notes'] ?? ''
        ];

        // Add weight record to patient's history
        $patients[$patientIndex]['weightHistory'][] = $newWeightRecord;
        
        // Update current weight and BMI
        $patients[$patientIndex]['currentWeight'] = (float)$input['weight'];
        $patients[$patientIndex]['lastVisit'] = $input['date'] ?? date('Y-m-d');
        
        $heightInMeters = $patients[$patientIndex]['height'] / 100;
        $patients[$patientIndex]['bmi'] = round($input['weight'] / ($heightInMeters * $heightInMeters), 1);

        if (writeJsonFile(PATIENTS_FILE, $patients)) {
            sendResponse($newWeightRecord, 201);
        } else {
            sendError('Failed to add weight record');
        }
        break;

    case 'PUT':
        // Reset patient weight history
        $patientId = $_GET['patientId'] ?? null;
        if (!$patientId) {
            sendError('Patient ID required');
        }

        $patients = readJsonFile(PATIENTS_FILE);
        $patientIndex = array_search($patientId, array_column($patients, 'id'));
        
        if ($patientIndex === false) {
            sendError('Patient not found', 404);
        }

        // Reset weight history to current weight only
        $newWeightRecord = [
            'id' => generateId(),
            'patientId' => $patientId,
            'weight' => $patients[$patientIndex]['currentWeight'],
            'date' => date('Y-m-d'),
            'notes' => 'Yeni başlangıç kaydı'
        ];

        $patients[$patientIndex]['weightHistory'] = [$newWeightRecord];

        if (writeJsonFile(PATIENTS_FILE, $patients)) {
            sendResponse(['message' => 'Weight history reset successfully']);
        } else {
            sendError('Failed to reset weight history');
        }
        break;

    default:
        sendError('Method not allowed', 405);
}
?>