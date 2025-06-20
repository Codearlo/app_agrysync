<?php
session_start();
header('Content-Type: application/json');
$response = ['logueado' => false];
if (isset($_SESSION['usuario'])) {
  $response['logueado'] = true;
}
echo json_encode($response);
?>