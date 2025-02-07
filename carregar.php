<?php
header('Content-Type: application/json');

$host = 'localhost'; // Altere se necessário
$dbname = 'tarefas_db';
$username = 'root'; // Altere se necessário
$password = ''; // Altere se necessário

try {
    // Conectar ao banco de dados
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Carregar as listas
    $stmt = $pdo->query('SELECT * FROM listas');
    $listas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Carregar as tarefas de cada lista
    foreach ($listas as &$lista) {
        $stmtTarefas = $pdo->prepare('SELECT * FROM tarefas WHERE lista_id = :lista_id');
        $stmtTarefas->execute(['lista_id' => $lista['id']]);
        $lista['tarefas'] = $stmtTarefas->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode(['listas' => $listas]);

} catch (PDOException $e) {
    echo json_encode(['erro' => $e->getMessage()]);
}
?>
