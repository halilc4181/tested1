<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        $appointments = readJsonFile(APPOINTMENTS_FILE);
        sendResponse($appointments);
        break;

    case 'POST':
        if (!$input) {
            sendError('Invalid input data');
        }

        $appointments = readJsonFile(APPOINTMENTS_FILE);
        
        $newAppointment = [
            'id' => generateId(),
            'patientId' => $input['patientId'],
            'patientName' => $input['patientName'],
            'date' => $input['date'],
            'time' => $input['time'],
            'type' => $input['type'],
            'status' => $input['status'] ?? 'confirmed',
            'notes' => $input['notes'] ?? '',
            'duration' => (int)($input['duration'] ?? 30)
        ];
        
        $appointments[] = $newAppointment;
        
        if (writeJsonFile(APPOINTMENTS_FILE, $appointments)) {
            sendResponse($newAppointment, 201);
        } else {
            sendError('Failed to save appointment');
        }
        break;

    case 'PUT':
        $appointmentId = $_GET['id'] ?? null;
        if (!$appointmentId || !$input) {
            sendError('Appointment ID and input data required');
        }

        $appointments = readJsonFile(APPOINTMENTS_FILE);
        $appointmentIndex = array_search($appointmentId, array_column($appointments, 'id'));
        
        if ($appointmentIndex === false) {
            sendError('Appointment not found', 404);
        }

        // Update appointment data
        foreach ($input as $key => $value) {
            if ($key !== 'id') {
                $appointments[$appointmentIndex][$key] = $value;
            }
        }

        if (writeJsonFile(APPOINTMENTS_FILE, $appointments)) {
            sendResponse($appointments[$appointmentIndex]);
        } else {
            sendError('Failed to update appointment');
        }
        break;

    case 'DELETE':
        $appointmentId = $_GET['id'] ?? null;
        if (!$appointmentId) {
            sendError('Appointment ID required');
        }

        $appointments = readJsonFile(APPOINTMENTS_FILE);
        $appointments = array_filter($appointments, function($appointment) use ($appointmentId) {
            return $appointment['id'] !== $appointmentId;
        });

        if (writeJsonFile(APPOINTMENTS_FILE, array_values($appointments))) {
            sendResponse(['message' => 'Appointment deleted successfully']);
        } else {
            sendError('Failed to delete appointment');
        }
        break;

    default:
        sendError('Method not allowed', 405);
}
?>