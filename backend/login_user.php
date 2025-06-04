<?php
// backend/login_user.php
require 'db_connect.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$response = ["success" => false, "message" => "", "user" => null];

if (isset($data['login_identifier']) && isset($data['password'])) { // login_identifier puede ser username o email
    $login_identifier = trim($data['login_identifier']);
    $password = $data['password'];

    if (empty($login_identifier) || empty($password)) {
        $response["message"] = "Usuario/Email y contraseña son obligatorios.";
        http_response_code(400);
        echo json_encode($response);
        exit();
    }

    // Buscar usuario por username o email
    $stmt = $conn->prepare("SELECT id, username, email, password_hash FROM users WHERE username = ? OR email = ?");
    if ($stmt === false) {
        $response["message"] = "Error preparando la consulta: " . $conn->error;
        http_response_code(500);
        echo json_encode($response);
        exit();
    }
    $stmt->bind_param("ss", $login_identifier, $login_identifier);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        // Verificar la contraseña
        if (password_verify($password, $user['password_hash'])) {
            $response["success"] = true;
            $response["message"] = "Inicio de sesión exitoso.";
            // Devolver información del usuario (sin el hash de la contraseña)
            $response["user"] = [
                "id" => $user['id'],
                "username" => $user['username'],
                "email" => $user['email']
            ];
            // Aquí podrías iniciar una sesión PHP o generar un token JWT
            // Por ahora, el frontend guardará el user_id en localStorage
        } else {
            $response["message"] = "Contraseña incorrecta.";
            http_response_code(401); // Unauthorized
        }
    } else {
        $response["message"] = "Usuario o correo electrónico no encontrado.";
        http_response_code(404); // Not Found
    }
    $stmt->close();
} else {
    $response["message"] = "Datos incompletos para el inicio de sesión.";
    http_response_code(400);
}

echo json_encode($response);
$conn->close();
?>
