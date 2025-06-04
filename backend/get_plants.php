<?php
// backend/get_plants.php
require 'db_connect.php'; // Incluye el archivo de conexión

header('Content-Type: application/json');

// Asumimos un user_id fijo por ahora
// En una app real, obtendrías esto de la sesión del usuario o un parámetro GET seguro
$user_id = 1; // Ejemplo

$sql = "SELECT id, plant_name, plant_description, health_status, added_date FROM user_plants WHERE user_id = ? ORDER BY added_date DESC";

$stmt = $conn->prepare($sql);
if ($stmt === false) {
    http_response_code(500);
    echo json_encode(["error" => "Error preparando la consulta: " . $conn->error]);
    exit();
}

$stmt->bind_param("i", $user_id);
$stmt->execute();
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
