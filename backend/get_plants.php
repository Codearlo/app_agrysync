<?php
// backend/get_plants.php
require 'db_connect.php'; // Incluye el archivo de conexión

header('Content-Type: application/json');

// Asumimos un user_id fijo por ahora
// En una app real, obtendrías esto de la sesión del usuario o un parámetro GET seguro
// $user_id = 1; // Ejemplo original

// Modificación para recibir user_id vía GET
if (isset($_GET['user_id'])) {
    $user_id = intval($_GET['user_id']);
    if ($user_id <= 0) {
        http_response_code(400);
        echo json_encode(["error" => "ID de usuario inválido."]);
        exit();
    }
} else {
    // Si no se proporciona user_id, podrías devolver un error o un conjunto vacío,
    // o manejarlo según la lógica de tu aplicación (ej. no mostrar plantas si no hay usuario).
    // Por ahora, devolvemos un error si no se especifica.
    http_response_code(400);
    echo json_encode(["error" => "ID de usuario no proporcionado."]);
    exit();
}


$sql = "SELECT id, plant_name, plant_description, health_status, added_date FROM user_plants WHERE user_id = ? ORDER BY added_date DESC";

$stmt = $conn->prepare($sql);
if ($stmt === false) {
    http_response_code(500);
    error_log("Error preparando la consulta get_plants: " . $conn->error); // Log del error
    echo json_encode(["error" => "Error interno del servidor al preparar la consulta."]);
    exit();
}

$stmt->bind_param("i", $user_id);

if (!$stmt->execute()) {
    http_response_code(500);
    error_log("Error ejecutando la consulta get_plants: " . $stmt->error); // Log del error
    echo json_encode(["error" => "Error interno del servidor al ejecutar la consulta."]);
    $stmt->close();
    $conn->close();
    exit();
}

$result = $stmt->get_result();

$plants = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $plants[] = $row;
    }
}

echo json_encode($plants);

$stmt->close();
$conn->close();
?>
