<?php
header('Content-Type: application/json');

$host = 'localhost'; // Altere se necessário
$dbname = 'if0_38266177_tarefas_db';
$username = 'root'; // Altere se necessário
$password = ''; // Altere se necessário

try {
    // Conectar ao banco de dados
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Receber os dados enviados via POST
    $dados = json_decode(file_get_contents('php://input'), true);

    // Limpar as tabelas antes de salvar (caso necessário)
    $pdo->exec('DELETE FROM tarefas');
    $pdo->exec('DELETE FROM listas');

    // Inserir as listas
    $stmt = $pdo->prepare("INSERT INTO listas (titulo) VALUES (:titulo)");
    
    foreach ($dados['listas'] as $lista) {
        $stmt->execute(['titulo' => $lista['titulo']]);
        $listaId = $pdo->lastInsertId(); // ID da lista inserida

        // Inserir as tarefas da lista
        $stmtTarefa = $pdo->prepare("INSERT INTO tarefas (lista_id, texto, completa) VALUES (:lista_id, :texto, :completa)");

        foreach ($lista['tarefas'] as $tarefa) {
            $stmtTarefa->execute([
                'lista_id' => $listaId,
                'texto' => $tarefa['texto'],
                'completa' => $tarefa['completa'] ? 1 : 0
            ]);
        }
    }

    echo json_encode(['sucesso' => true]);

} catch (PDOException $e) {
    echo json_encode(['sucesso' => false, 'erro' => $e->getMessage()]);
}
?>
