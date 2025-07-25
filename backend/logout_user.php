<?php
// backend/logout_user.php
session_start(); // Inicia la sesión para poder destruirla

// Elimina todas las variables de sesión
$_SESSION = array();

// Si se desea destruir la sesión completamente, borra también la cookie de sesión.
// Nota: ¡Esto destruirá la sesión, y no solo los datos de la sesión!
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Finalmente, destruye la sesión.
session_destroy();

header('Content-Type: application/json');
echo json_encode(['success' => true, 'message' => 'Sesión cerrada correctamente.']);
?>