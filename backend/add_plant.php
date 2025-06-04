<?php
// backend/add_plant.php
require 'db_connect.php'; // Incluye el archivo de conexión

header('Content-Type: application/json');

// Obtener los datos enviados por POST (desde JavaScript)
// Es importante sanitizar y validar estos datos en una aplicación real
$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['plant_name']) && isset($data['health_status'])) {
    $plant_name = $conn->real_escape_string($data['plant_name']);
    $plant_description = isset($data['plant_description']) ? $conn->real_escape_string($data['plant_description']) : '';
    $health_status = $conn->real_escape_string($data['health_status']);
    
    // Asumimos un user_id fijo por ahora, ya que no hay sistema de login
    // En una app real, obtendrías esto de la sesión del usuario
    $user_id = 1; // Ejemplo

    $sql = "INSERT INTO user_plants (user_id, plant_name, plant_description, health_status) VALUES (?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error preparando la consulta: " . $conn->error]);
        exit();
    }

    $stmt->bind_param("isss", $user_id, $plant_name, $plant_description, $health_status);

    if ($stmt->execute()) {
        $new_plant_id = $stmt->insert_id;
        echo json_encode([
            "success" => true, 
            "message" => "Planta añadida con éxito.",
            "plant_id" => $new_plant_id,
            "plant_name" => $data['plant_name'], // Devolver los datos para actualizar UI
            "plant_description" => $data['plant_description'],
            "health_status" => $data['health_status']
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al añadir planta: " . $stmt->error]);
    }

    $stmt->close();
} else {
    http_response_code(400); // Bad Request
    echo json_encode(["success" => false, "message" => "Datos incompletos para añadir planta."]);
}

$conn->close();
?>
