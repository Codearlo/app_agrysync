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
    // No uses die() en una API real, mejor devuelve un JSON de error
    // Para este ejemplo, lo mantenemos simple
    error_log("Connection failed: " . $conn->connect_error); // Log del error
    http_response_code(500); // Internal Server Error
    echo json_encode(["error" => "Database connection failed. Please check server logs."]);
    exit(); // Detener la ejecución
}

// Establecer el charset a utf8mb4 para soportar emojis y caracteres especiales
if (!$conn->set_charset("utf8mb4")) {
    error_log("Error loading character set utf8mb4: " . $conn->error);
}

// Opcional: Manejar solicitudes OPTIONS para CORS preflight
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}
?>
