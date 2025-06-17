<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        $exercisePrograms = readJsonFile(EXERCISE_PROGRAMS_FILE);
        sendResponse($exercisePrograms);
        break;

    case 'POST':
        if (!$input) {
            sendError('Invalid input data');
        }

        $exercisePrograms = readJsonFile(EXERCISE_PROGRAMS_FILE);
        
        $newProgram = [
            'id' => generateId(),
            'patientId' => $input['patientId'],
            'patientName' => $input['patientName'],
            'title' => $input['title'],
            'createdDate' => $input['createdDate'] ?? date('Y-m-d'),
            'duration' => $input['duration'],
            'status' => $input['status'] ?? 'active',
            'type' => $input['type'],
            'goal' => $input['goal'],
            'difficulty' => $input['difficulty'],
            'frequency' => (int)$input['frequency'],
            'workouts' => $input['workouts'] ?? [],
            'notes' => $input['notes'] ?? '',
            'aiGenerated' => $input['aiGenerated'] ?? false
        ];
        
        $exercisePrograms[] = $newProgram;
        
        if (writeJsonFile(EXERCISE_PROGRAMS_FILE, $exercisePrograms)) {
            sendResponse($newProgram, 201);
        } else {
            sendError('Failed to save exercise program');
        }
        break;

    case 'PUT':
        $programId = $_GET['id'] ?? null;
        if (!$programId || !$input) {
            sendError('Exercise program ID and input data required');
        }

        $exercisePrograms = readJsonFile(EXERCISE_PROGRAMS_FILE);
        $programIndex = array_search($programId, array_column($exercisePrograms, 'id'));
        
        if ($programIndex === false) {
            sendError('Exercise program not found', 404);
        }

        // Update exercise program data
        foreach ($input as $key => $value) {
            if ($key !== 'id') {
                $exercisePrograms[$programIndex][$key] = $value;
            }
        }

        if (writeJsonFile(EXERCISE_PROGRAMS_FILE, $exercisePrograms)) {
            sendResponse($exercisePrograms[$programIndex]);
        } else {
            sendError('Failed to update exercise program');
        }
        break;

    case 'DELETE':
        $programId = $_GET['id'] ?? null;
        if (!$programId) {
            sendError('Exercise program ID required');
        }

        $exercisePrograms = readJsonFile(EXERCISE_PROGRAMS_FILE);
        $exercisePrograms = array_filter($exercisePrograms, function($program) use ($programId) {
            return $program['id'] !== $programId;
        });

        if (writeJsonFile(EXERCISE_PROGRAMS_FILE, array_values($exercisePrograms))) {
            sendResponse(['message' => 'Exercise program deleted successfully']);
        } else {
            sendError('Failed to delete exercise program');
        }
        break;

    default:
        sendError('Method not allowed', 405);
}
?>