<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        $emailReminders = readJsonFile(EMAIL_REMINDERS_FILE);
        sendResponse($emailReminders);
        break;

    case 'POST':
        if (!$input) {
            sendError('Invalid input data');
        }

        $emailReminders = readJsonFile(EMAIL_REMINDERS_FILE);
        
        $newReminder = [
            'id' => generateId(),
            'appointmentId' => $input['appointmentId'] ?? '',
            'patientId' => $input['patientId'],
            'patientName' => $input['patientName'],
            'patientEmail' => $input['patientEmail'],
            'appointmentDate' => $input['appointmentDate'] ?? '',
            'appointmentTime' => $input['appointmentTime'] ?? '',
            'appointmentType' => $input['appointmentType'] ?? '',
            'reminderDate' => $input['reminderDate'] ?? date('Y-m-d'),
            'status' => $input['status'] ?? 'pending',
            'sentDate' => $input['sentDate'] ?? null,
            'errorMessage' => $input['errorMessage'] ?? null,
            'emailType' => $input['emailType'],
            'subject' => $input['subject'],
            'content' => $input['content']
        ];
        
        $emailReminders[] = $newReminder;
        
        if (writeJsonFile(EMAIL_REMINDERS_FILE, $emailReminders)) {
            sendResponse($newReminder, 201);
        } else {
            sendError('Failed to save email reminder');
        }
        break;

    case 'PUT':
        $reminderId = $_GET['id'] ?? null;
        if (!$reminderId || !$input) {
            sendError('Email reminder ID and input data required');
        }

        $emailReminders = readJsonFile(EMAIL_REMINDERS_FILE);
        $reminderIndex = array_search($reminderId, array_column($emailReminders, 'id'));
        
        if ($reminderIndex === false) {
            sendError('Email reminder not found', 404);
        }

        // Update email reminder data
        foreach ($input as $key => $value) {
            if ($key !== 'id') {
                $emailReminders[$reminderIndex][$key] = $value;
            }
        }

        if (writeJsonFile(EMAIL_REMINDERS_FILE, $emailReminders)) {
            sendResponse($emailReminders[$reminderIndex]);
        } else {
            sendError('Failed to update email reminder');
        }
        break;

    case 'DELETE':
        $reminderId = $_GET['id'] ?? null;
        if (!$reminderId) {
            sendError('Email reminder ID required');
        }

        $emailReminders = readJsonFile(EMAIL_REMINDERS_FILE);
        $emailReminders = array_filter($emailReminders, function($reminder) use ($reminderId) {
            return $reminder['id'] !== $reminderId;
        });

        if (writeJsonFile(EMAIL_REMINDERS_FILE, array_values($emailReminders))) {
            sendResponse(['message' => 'Email reminder deleted successfully']);
        } else {
            sendError('Failed to delete email reminder');
        }
        break;

    default:
        sendError('Method not allowed', 405);
}
?>