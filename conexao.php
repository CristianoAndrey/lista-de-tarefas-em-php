<?php
$host = "localhost";
$dbname = "tarefas_db";
$username = "root";
$password = ""; // Senha vazia por padrão no WAMP

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Erro na conexão: " . $conn->connect_error);
}
?>
