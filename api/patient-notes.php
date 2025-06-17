<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        $patientId = $_GET['patientId'] ?? null;
        if (!$patientId) {
            sendError('Patient ID required');
        }

        $notes = readJsonFile(PATIENT_NOTES_FILE);
        $patientNotes = array_filter($notes, function($note) use ($patientId) {
            return $note['patientId'] === $patientId;
        });

        // Sort by date descending
        usort($patientNotes, function($a, $b) {
            return strtotime($b['createdAt']) - strtotime($a['createdAt']);
        });

        sendResponse(array_values($patientNotes));
        break;

    case 'POST':
        if (!$input) {
            sendError('Invalid input data');
        }

        $notes = readJsonFile(PATIENT_NOTES_FILE);
        
        $newNote = [
            'id' => generateId(),
            'patientId' => $input['patientId'],
            'patientName' => $input['patientName'],
            'title' => $input['title'],
            'content' => $input['content'],
            'type' => $input['type'] ?? 'general',
            'isPrivate' => $input['isPrivate'] ?? false,
            'tags' => $input['tags'] ?? [],
            'createdAt' => date('c'),
            'updatedAt' => date('c'),
            'createdBy' => 'diyetisyen' // In a real app, this would be the logged-in user
        ];
        
        $notes[] = $newNote;
        
        if (writeJsonFile(PATIENT_NOTES_FILE, $notes)) {
            sendResponse($newNote, 201);
        } else {
            sendError('Failed to save note');
        }
        break;

    case 'PUT':
        $noteId = $_GET['id'] ?? null;
        if (!$noteId || !$input) {
            sendError('Note ID and input data required');
        }

        $notes = readJsonFile(PATIENT_NOTES_FILE);
        $noteIndex = array_search($noteId, array_column($notes, 'id'));
        
        if ($noteIndex === false) {
            sendError('Note not found', 404);
        }

        // Update note data
        foreach ($input as $key => $value) {
            if ($key !== 'id' && $key !== 'createdAt' && $key !== 'createdBy') {
                $notes[$noteIndex][$key] = $value;
            }
        }
        $notes[$noteIndex]['updatedAt'] = date('c');

        if (writeJsonFile(PATIENT_NOTES_FILE, $notes)) {
            sendResponse($notes[$noteIndex]);
        } else {
            sendError('Failed to update note');
        }
        break;

    case 'DELETE':
        $noteId = $_GET['id'] ?? null;
        if (!$noteId) {
            sendError('Note ID required');
        }

        $notes = readJsonFile(PATIENT_NOTES_FILE);
        $notes = array_filter($notes, function($note) use ($noteId) {
            return $note['id'] !== $noteId;
        });

        if (writeJsonFile(PATIENT_NOTES_FILE, array_values($notes))) {
            sendResponse(['message' => 'Note deleted successfully']);
        } else {
            sendError('Failed to delete note');
        }
        break;

    default:
        sendError('Method not allowed', 405);
}
?>