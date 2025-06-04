<?php
// backend/register_user.php
require 'db_connect.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$response = ["success" => false, "message" => ""];

if (isset($data['username']) && isset($data['email']) && isset($data['password'])) {
    $username = trim($data['username']);
    $email = trim($data['email']);
    $password = $data['password'];

    // Validaciones básicas (puedes expandir esto)
    if (empty($username) || empty($email) || empty($password)) {
        $response["message"] = "Todos los campos son obligatorios.";
        http_response_code(400);
        echo json_encode($response);
        exit();
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response["message"] = "Formato de correo electrónico inválido.";
        http_response_code(400);
        echo json_encode($response);
        exit();
    }

    if (strlen($password) < 6) { // Ejemplo de longitud mínima
        $response["message"] = "La contraseña debe tener al menos 6 caracteres.";
        http_response_code(400);
        echo json_encode($response);
        exit();
    }

    // Verificar si el usuario o email ya existen
    $stmt_check = $conn->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
    if ($stmt_check === false) {
        $response["message"] = "Error preparando la verificación: " . $conn->error;
        http_response_code(500);
        echo json_encode($response);
        exit();
    }
    $stmt_check->bind_param("ss", $username, $email);
    $stmt_check->execute();
    $stmt_check->store_result();

    if ($stmt_check->num_rows > 0) {
        $response["message"] = "El nombre de usuario o correo electrónico ya está en uso.";
        http_response_code(409); // Conflict
    } else {
        // Hashear la contraseña
        $password_hash = password_hash($password, PASSWORD_DEFAULT);

        $stmt_insert = $conn->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
        if ($stmt_insert === false) {
            $response["message"] = "Error preparando la inserción: " . $conn->error;
            http_response_code(500);
            echo json_encode($response);
            exit();
        }
        $stmt_insert->bind_param("sss", $username, $email, $password_hash);

        if ($stmt_insert->execute()) {
            $response["success"] = true;
            $response["message"] = "Usuario registrado con éxito.";
            // Podrías devolver el ID del usuario o un token aquí si es necesario
        } else {
            $response["message"] = "Error al registrar el usuario: " . $stmt_insert->error;
            http_response_code(500);
        }
        $stmt_insert->close();
    }
    $stmt_check->close();

} else {
    $response["message"] = "Datos incompletos para el registro.";
    http_response_code(400);
}

echo json_encode($response);
$conn->close();
?>
