<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration (JSON file paths)
define('DATA_DIR', __DIR__ . '/data/');
define('PATIENTS_FILE', DATA_DIR . 'patients.json');
define('APPOINTMENTS_FILE', DATA_DIR . 'appointments.json');
define('DIET_PLANS_FILE', DATA_DIR . 'dietPlans.json');
define('EXERCISE_PROGRAMS_FILE', DATA_DIR . 'exercisePrograms.json');
define('EMAIL_REMINDERS_FILE', DATA_DIR . 'emailReminders.json');
define('SETTINGS_FILE', DATA_DIR . 'settings.json');
define('BACKUP_SETTINGS_FILE', DATA_DIR . 'backupSettings.json');
define('PATIENT_NOTES_FILE', DATA_DIR . 'patientNotes.json');
define('TRANSACTIONS_FILE', DATA_DIR . 'transactions.json');

// Create data directory if it doesn't exist
if (!file_exists(DATA_DIR)) {
    if (!mkdir(DATA_DIR, 0755, true)) {
        error_log("Failed to create data directory: " . DATA_DIR);
    }
}

// Helper functions
function readJsonFile($file) {
    if (!file_exists($file)) {
        return [];
    }
    $content = file_get_contents($file);
    if ($content === false) {
        error_log("Failed to read file: " . $file);
        return [];
    }
    $data = json_decode($content, true);
    return $data ?: [];
}

function writeJsonFile($file, $data) {
    // Ensure directory exists
    $dir = dirname($file);
    if (!file_exists($dir)) {
        if (!mkdir($dir, 0755, true)) {
            error_log("Failed to create directory: " . $dir);
            return false;
        }
    }
    
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if ($json === false) {
        error_log("Failed to encode JSON for file: " . $file);
        return false;
    }
    
    $result = file_put_contents($file, $json, LOCK_EX);
    if ($result === false) {
        error_log("Failed to write file: " . $file);
        return false;
    }
    
    return true;
}

function generateId() {
    return time() . '_' . uniqid();
}

function sendResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

function sendError($message, $status = 400) {
    http_response_code($status);
    echo json_encode(['error' => $message], JSON_UNESCAPED_UNICODE);
    exit();
}

// Initialize default files if they don't exist
function initializeDefaultData() {
    // Default settings
    if (!file_exists(SETTINGS_FILE)) {
        $defaultSettings = [
            'id' => '1',
            'name' => 'Dr. Ayşe Kaya',
            'title' => 'Diyetisyen',
            'phone' => '0532 123 4567',
            'email' => 'diyetisyen@email.com',
            'address' => 'İstanbul, Türkiye',
            'license' => 'DYT-12345',
            'specialization' => 'Klinik Beslenme',
            'experience' => '8 yıl',
            'education' => 'Hacettepe Üniversitesi Beslenme ve Diyetetik Bölümü',
            'defaultAppointmentDuration' => 30,
            'workingHours' => [
                'start' => '09:00',
                'end' => '18:00'
            ],
            'bio' => 'Klinik beslenme alanında uzman diyetisyen. Obezite, diyabet ve kardiyovasküler hastalıklar konularında deneyimli.',
            'photo' => ''
        ];
        writeJsonFile(SETTINGS_FILE, $defaultSettings);
    }

    // Default backup settings
    if (!file_exists(BACKUP_SETTINGS_FILE)) {
        $defaultBackupSettings = [
            'id' => '1',
            'autoBackupEnabled' => true,
            'backupFrequency' => 7,
            'maxBackups' => 10,
            'lastBackupDate' => '',
            'backupLocation' => 'local',
            'includeImages' => false,
            'compressionEnabled' => true,
            'encryptionEnabled' => false,
            'notificationEnabled' => true
        ];
        writeJsonFile(BACKUP_SETTINGS_FILE, $defaultBackupSettings);
    }

    // Initialize empty arrays for other files
    $files = [
        PATIENTS_FILE => [],
        APPOINTMENTS_FILE => [],
        DIET_PLANS_FILE => [],
        EXERCISE_PROGRAMS_FILE => [],
        EMAIL_REMINDERS_FILE => [],
        PATIENT_NOTES_FILE => [],
        TRANSACTIONS_FILE => []
    ];

    foreach ($files as $file => $defaultData) {
        if (!file_exists($file)) {
            writeJsonFile($file, $defaultData);
        }
    }
}

// Initialize default data
initializeDefaultData();
?>