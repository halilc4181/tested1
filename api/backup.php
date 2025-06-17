<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Create backup
        $backupData = [
            'patients' => readJsonFile(PATIENTS_FILE),
            'appointments' => readJsonFile(APPOINTMENTS_FILE),
            'dietPlans' => readJsonFile(DIET_PLANS_FILE),
            'exercisePrograms' => readJsonFile(EXERCISE_PROGRAMS_FILE),
            'emailReminders' => readJsonFile(EMAIL_REMINDERS_FILE),
            'settings' => readJsonFile(SETTINGS_FILE),
            'backupSettings' => readJsonFile(BACKUP_SETTINGS_FILE),
            'patientNotes' => readJsonFile(PATIENT_NOTES_FILE),
            'transactions' => readJsonFile(TRANSACTIONS_FILE),
            'timestamp' => date('c'),
            'version' => '1.0'
        ];

        // Update last backup date
        $backupSettings = readJsonFile(BACKUP_SETTINGS_FILE);
        $backupSettings['lastBackupDate'] = date('c');
        writeJsonFile(BACKUP_SETTINGS_FILE, $backupSettings);

        // Set headers for file download
        header('Content-Type: application/json');
        header('Content-Disposition: attachment; filename="diyettakip_backup_' . date('Y-m-d') . '.json"');
        echo json_encode($backupData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit();
        break;

    case 'POST':
        // Restore backup
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            sendError('Invalid backup data');
        }

        $success = true;
        $errors = [];

        // Restore each data type
        if (isset($input['patients'])) {
            if (!writeJsonFile(PATIENTS_FILE, $input['patients'])) {
                $success = false;
                $errors[] = 'Failed to restore patients';
            }
        }

        if (isset($input['appointments'])) {
            if (!writeJsonFile(APPOINTMENTS_FILE, $input['appointments'])) {
                $success = false;
                $errors[] = 'Failed to restore appointments';
            }
        }

        if (isset($input['dietPlans'])) {
            if (!writeJsonFile(DIET_PLANS_FILE, $input['dietPlans'])) {
                $success = false;
                $errors[] = 'Failed to restore diet plans';
            }
        }

        if (isset($input['exercisePrograms'])) {
            if (!writeJsonFile(EXERCISE_PROGRAMS_FILE, $input['exercisePrograms'])) {
                $success = false;
                $errors[] = 'Failed to restore exercise programs';
            }
        }

        if (isset($input['emailReminders'])) {
            if (!writeJsonFile(EMAIL_REMINDERS_FILE, $input['emailReminders'])) {
                $success = false;
                $errors[] = 'Failed to restore email reminders';
            }
        }

        if (isset($input['settings'])) {
            if (!writeJsonFile(SETTINGS_FILE, $input['settings'])) {
                $success = false;
                $errors[] = 'Failed to restore settings';
            }
        }

        if (isset($input['backupSettings'])) {
            if (!writeJsonFile(BACKUP_SETTINGS_FILE, $input['backupSettings'])) {
                $success = false;
                $errors[] = 'Failed to restore backup settings';
            }
        }

        if (isset($input['patientNotes'])) {
            if (!writeJsonFile(PATIENT_NOTES_FILE, $input['patientNotes'])) {
                $success = false;
                $errors[] = 'Failed to restore patient notes';
            }
        }

        if (isset($input['transactions'])) {
            if (!writeJsonFile(TRANSACTIONS_FILE, $input['transactions'])) {
                $success = false;
                $errors[] = 'Failed to restore transactions';
            }
        }

        if ($success) {
            sendResponse(['message' => 'Backup restored successfully']);
        } else {
            sendError('Backup restoration failed: ' . implode(', ', $errors));
        }
        break;

    default:
        sendError('Method not allowed', 405);
}
?>