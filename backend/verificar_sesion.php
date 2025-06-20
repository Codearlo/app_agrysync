<?php
session_start();
header('Content-Type: application/json');
$response = ['logueado' => false, 'nombre' => ''];
if (isset($_SESSION['usuario'])) {
  $response['logueado'] = true;
  $response['nombre'] = $_SESSION['usuario']['nombre']; // Ajusta según tu estructura de sesión
}
echo json_encode($response);
?>