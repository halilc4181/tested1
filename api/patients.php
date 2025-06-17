<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        $patients = readJsonFile(PATIENTS_FILE);
        sendResponse($patients);
        break;

    case 'POST':
        if (!$input) {
            sendError('Invalid input data');
        }

        $patients = readJsonFile(PATIENTS_FILE);
        
        // Calculate BMI
        $heightInMeters = $input['height'] / 100;
        $bmi = round($input['currentWeight'] / ($heightInMeters * $heightInMeters), 1);
        
        $newPatient = [
            'id' => generateId(),
            'name' => $input['name'],
            'surname' => $input['surname'],
            'age' => (int)$input['age'],
            'gender' => $input['gender'],
            'phone' => $input['phone'],
            'email' => $input['email'] ?? '',
            'address' => $input['address'] ?? '',
            'height' => (int)$input['height'],
            'currentWeight' => (float)$input['currentWeight'],
            'targetWeight' => (float)$input['targetWeight'],
            'bmi' => $bmi,
            'registrationDate' => date('Y-m-d'),
            'lastVisit' => $input['lastVisit'] ?? date('Y-m-d'),
            'medicalHistory' => $input['medicalHistory'] ?? '',
            'allergies' => $input['allergies'] ?? '',
            'medications' => $input['medications'] ?? '',
            'diseases' => $input['diseases'] ?? '',
            'doctorNotes' => $input['doctorNotes'] ?? '',
            'goals' => $input['goals'] ?? '',
            'status' => $input['status'] ?? 'active',
            'weightHistory' => [
                [
                    'id' => generateId(),
                    'patientId' => '',
                    'weight' => (float)$input['currentWeight'],
                    'date' => date('Y-m-d'),
                    'notes' => 'İlk kayıt'
                ]
            ]
        ];
        
        $newPatient['weightHistory'][0]['patientId'] = $newPatient['id'];
        $patients[] = $newPatient;
        
        if (writeJsonFile(PATIENTS_FILE, $patients)) {
            sendResponse($newPatient, 201);
        } else {
            sendError('Failed to save patient');
        }
        break;

    case 'PUT':
        $patientId = $_GET['id'] ?? null;
        if (!$patientId || !$input) {
            sendError('Patient ID and input data required');
        }

        $patients = readJsonFile(PATIENTS_FILE);
        $patientIndex = array_search($patientId, array_column($patients, 'id'));
        
        if ($patientIndex === false) {
            sendError('Patient not found', 404);
        }

        // Update patient data
        foreach ($input as $key => $value) {
            if ($key !== 'id') {
                $patients[$patientIndex][$key] = $value;
            }
        }

        // Recalculate BMI if weight or height changed
        if (isset($input['currentWeight']) || isset($input['height'])) {
            $heightInMeters = $patients[$patientIndex]['height'] / 100;
            $patients[$patientIndex]['bmi'] = round($patients[$patientIndex]['currentWeight'] / ($heightInMeters * $heightInMeters), 1);
        }

        if (writeJsonFile(PATIENTS_FILE, $patients)) {
            sendResponse($patients[$patientIndex]);
        } else {
            sendError('Failed to update patient');
        }
        break;

    case 'DELETE':
        $patientId = $_GET['id'] ?? null;
        if (!$patientId) {
            sendError('Patient ID required');
        }

        $patients = readJsonFile(PATIENTS_FILE);
        $patients = array_filter($patients, function($patient) use ($patientId) {
            return $patient['id'] !== $patientId;
        });

        // Also delete related appointments, diet plans, and exercise programs
        $appointments = readJsonFile(APPOINTMENTS_FILE);
        $appointments = array_filter($appointments, function($appointment) use ($patientId) {
            return $appointment['patientId'] !== $patientId;
        });
        writeJsonFile(APPOINTMENTS_FILE, array_values($appointments));

        $dietPlans = readJsonFile(DIET_PLANS_FILE);
        $dietPlans = array_filter($dietPlans, function($plan) use ($patientId) {
            return $plan['patientId'] !== $patientId;
        });
        writeJsonFile(DIET_PLANS_FILE, array_values($dietPlans));

        $exercisePrograms = readJsonFile(EXERCISE_PROGRAMS_FILE);
        $exercisePrograms = array_filter($exercisePrograms, function($program) use ($patientId) {
            return $program['patientId'] !== $patientId;
        });
        writeJsonFile(EXERCISE_PROGRAMS_FILE, array_values($exercisePrograms));

        if (writeJsonFile(PATIENTS_FILE, array_values($patients))) {
            sendResponse(['message' => 'Patient deleted successfully']);
        } else {
            sendError('Failed to delete patient');
        }
        break;

    default:
        sendError('Method not allowed', 405);
}
?>