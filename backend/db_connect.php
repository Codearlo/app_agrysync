<?php
// backend/db_connect.php
header("Access-Control-Allow-Origin: *"); // Permite solicitudes desde cualquier origen (ajusta en producción)
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$servername = "localhost"; // o tu host de base de datos
$username = "u347334547_agrosyncadmin"; // Reemplaza con tu usuario de MySQL
$password = "CH7322a#"; // Reemplaza con tu contraseña
$dbname = "u347334547_agrosync"; // El nombre de tu base de datos

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    error_log("Connection failed: " . $conn->connect_error);
    http_response_code(500); 
    echo json_encode(["error" => "Database connection failed."]); // Mensaje más genérico para el cliente
    exit();
}

if (!$conn->set_charset("utf8mb4")) {
    error_log("Error loading character set utf8mb4: " . $conn->error);
    // No es necesario salir aquí, pero es bueno loguearlo
}
?>

