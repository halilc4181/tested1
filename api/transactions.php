<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        $transactions = readJsonFile(TRANSACTIONS_FILE);
        sendResponse($transactions);
        break;

    case 'POST':
        if (!$input) {
            sendError('Invalid input data');
        }

        $transactions = readJsonFile(TRANSACTIONS_FILE);
        
        $newTransaction = [
            'id' => generateId(),
            'patientId' => $input['patientId'],
            'patientName' => $input['patientName'],
            'type' => $input['type'],
            'category' => $input['category'],
            'amount' => (float)$input['amount'],
            'description' => $input['description'],
            'date' => $input['date'],
            'paymentMethod' => $input['paymentMethod'],
            'status' => $input['status'],
            'invoiceNumber' => $input['invoiceNumber'] ?? '',
            'notes' => $input['notes'] ?? '',
            'createdAt' => date('c'),
            'updatedAt' => date('c')
        ];
        
        $transactions[] = $newTransaction;
        
        if (writeJsonFile(TRANSACTIONS_FILE, $transactions)) {
            sendResponse($newTransaction, 201);
        } else {
            sendError('Failed to save transaction');
        }
        break;

    case 'PUT':
        $transactionId = $_GET['id'] ?? null;
        if (!$transactionId || !$input) {
            sendError('Transaction ID and input data required');
        }

        $transactions = readJsonFile(TRANSACTIONS_FILE);
        $transactionIndex = -1;
        
        foreach ($transactions as $index => $transaction) {
            if ($transaction['id'] === $transactionId) {
                $transactionIndex = $index;
                break;
            }
        }
        
        if ($transactionIndex === -1) {
            sendError('Transaction not found', 404);
        }

        // Update transaction data
        foreach ($input as $key => $value) {
            if ($key !== 'id' && $key !== 'createdAt') {
                $transactions[$transactionIndex][$key] = $value;
            }
        }
        $transactions[$transactionIndex]['updatedAt'] = date('c');

        if (writeJsonFile(TRANSACTIONS_FILE, $transactions)) {
            sendResponse($transactions[$transactionIndex]);
        } else {
            sendError('Failed to update transaction');
        }
        break;

    case 'DELETE':
        $transactionId = $_GET['id'] ?? null;
        if (!$transactionId) {
            sendError('Transaction ID required');
        }

        $transactions = readJsonFile(TRANSACTIONS_FILE);
        $transactions = array_filter($transactions, function($transaction) use ($transactionId) {
            return $transaction['id'] !== $transactionId;
        });

        if (writeJsonFile(TRANSACTIONS_FILE, array_values($transactions))) {
            sendResponse(['message' => 'Transaction deleted successfully']);
        } else {
            sendError('Failed to delete transaction');
        }
        break;

    default:
        sendError('Method not allowed', 405);
}
?>