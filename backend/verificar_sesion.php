<?php
// backend/verificar_sesion.php
session_start();
header('Content-Type: application/json');

$response = ['loggedIn' => false, 'user' => null];

// Comprobar si la variable de sesión 'user' está establecida
if (isset($_SESSION['user']) && isset($_SESSION['user']['id'])) {
    $response['loggedIn'] = true;
    $response['user'] = $_SESSION['user']; 
}

echo json_encode($response);
?>