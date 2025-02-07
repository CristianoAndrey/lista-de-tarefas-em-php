document.addEventListener('DOMContentLoaded', () => {
    console.log('Página carregada. Carregando dados...');
    carregarDados();
});

// Função para salvar os dados no banco de dados
async function salvarDados() {
    console.log('Iniciando salvamento de dados...');

    const listas = [];
    document.querySelectorAll('.lista').forEach(lista => {
        const tarefas = [];
        lista.querySelectorAll('.tarefa').forEach(tarefa => {
            tarefas.push({
                texto: tarefa.querySelector('span').textContent,
                completa: tarefa.classList.contains('completa'),
            });
        });

        listas.push({
            titulo: lista.querySelector('.lista-titulo').textContent,
            tarefas: tarefas
        });
    });

    const dados = { listas };
    console.log('Dados a serem salvos:', dados);

        const response = await fetch('salvar.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados),
        });

        const result = await response.json();
        console.log('Resposta do servidor:', result);

        if (!result.sucesso) {
            throw new Error('Erro ao salvar os dados.');
        }

        console.log('Dados salvos com sucesso!');
   
}

// Função para carregar os dados do banco de dados
async function carregarDados() {
    console.log('Iniciando carregamento de dados...');

   
        const response = await fetch('carregar.php');
        const dados = await response.json();
        
        console.log('Dados carregados:', dados);

        const listasContainer = document.getElementById('listas-container');
        listasContainer.innerHTML = '';

        dados.listas.forEach(listaData => {
            const novaLista = criarNovaLista(listaData.titulo);
            listasContainer.appendChild(novaLista);

            listaData.tarefas.forEach(tarefa => {
                adicionarTarefaExistente(novaLista, tarefa);
            });
        });
   
}

// Função para criar uma nova lista
// Função para criar uma nova lista
// Função para criar uma nova lista
function criarNovaLista(titulo) {
    const novaLista = document.createElement('div');
    novaLista.className = 'lista';
    novaLista.innerHTML = ` 
        <div class="lista-header">
            <h2 class="lista-titulo">${titulo}</h2>
            <button class="apagar-concluidas" onclick="apagarConcluidas(this)">Limpar Concluídas</button>
            <button class="apagar-lista" onclick="apagarLista(this)">✕</button>
        </div>
        <div class="lista-tarefas">
            <div class="input-grupo">
                <input type="text" class="nova-tarefa" placeholder="Adicionar um cartão" onkeydown="enviarComEnter(event, this)">
                <button onclick="adicionarTarefa(this)">Adicionar</button>
            </div>
        </div>
    `;
    return novaLista;
}

// Função para adicionar uma nova lista
function adicionarNovaLista() {
    const titulo = prompt('Nome da nova lista:'); // Solicita o título para a lista
    if (titulo) {
        const listasContainer = document.getElementById('listas-container');
        const novaLista = criarNovaLista(titulo); // Passa o título para criar a nova lista
        listasContainer.appendChild(novaLista);
        salvarDados();  // Salvar após adicionar a nova lista
    }
}


// Função para adicionar uma tarefa existente
function adicionarTarefaExistente(lista, tarefaData) {
    const listaTarefas = lista.querySelector('.lista-tarefas');
    const novaTarefa = document.createElement('div');
    novaTarefa.className = 'tarefa';
    if (tarefaData.completa) novaTarefa.classList.add('completa');
    novaTarefa.draggable = true;

    novaTarefa.innerHTML = `
        <input type="checkbox" onchange="concluirTarefa(this)" ${tarefaData.completa ? 'checked' : ''}>
        <span>${tarefaData.texto}</span>
        <button class="excluir" onclick="excluirTarefa(this)">✕</button>
    `;

    listaTarefas.appendChild(novaTarefa);
    adicionarEventosDragDrop(novaTarefa);
}

// Função para concluir tarefa (sem pontos)
function concluirTarefa(checkbox) {
    const tarefa = checkbox.closest('.tarefa');
    
    // Marca ou desmarca a tarefa como concluída
    if (checkbox.checked) {
        tarefa.classList.add('completa');
    } else {
        tarefa.classList.remove('completa');
    }

    salvarDados();  // Salva os dados
}

// Função para excluir uma tarefa
function excluirTarefa(botao) {
    const tarefa = botao.closest('.tarefa');
    tarefa.remove();
    salvarDados();
}

// Função para apagar uma lista
function apagarLista(botao) {
    if (confirm('Tem certeza que deseja apagar esta lista?')) {
        botao.closest('.lista').remove();
        salvarDados();
    }
}

// Função para apagar as tarefas concluídas de uma lista
function apagarConcluidas(botao) {
    const lista = botao.closest('.lista');
    const tarefas = lista.querySelectorAll('.tarefa');
    tarefas.forEach(tarefa => {
        if (tarefa.classList.contains('completa')) {
            tarefa.remove();
        }
    });
    salvarDados();
}

// Função para enviar tarefa ao pressionar Enter
function enviarComEnter(event, input) {
    if (event.key === 'Enter') {
        event.preventDefault();
        adicionarTarefa(input.nextElementSibling);
    }
}

// Função para adicionar uma nova tarefa
function adicionarTarefa(botao) {
    const lista = botao.closest('.lista');
    const input = lista.querySelector('.nova-tarefa');
    const texto = input.value.trim();

    if (texto !== '') {
        const listaTarefas = lista.querySelector('.lista-tarefas');
        const novaTarefa = document.createElement('div');
        novaTarefa.className = 'tarefa';
        novaTarefa.draggable = true;

        novaTarefa.innerHTML = `
            <input type="checkbox" onchange="concluirTarefa(this)">
            <span>${texto}</span>
            <button class="excluir" onclick="excluirTarefa(this)">✕</button>
        `;

        listaTarefas.appendChild(novaTarefa);
        input.value = '';
        adicionarEventosDragDrop(novaTarefa);
        salvarDados();
    }
}

// Função para adicionar eventos de drag & drop (caso necessário)
function adicionarEventosDragDrop(tarefa) {
    tarefa.addEventListener('dragstart', (event) => {
        event.dataTransfer.setData('text', event.target.innerHTML);
        event.target.classList.add('dragging');
    });

    tarefa.addEventListener('dragend', (event) => {
        event.target.classList.remove('dragging');
    });

    tarefa.addEventListener('dragover', (event) => {
        event.preventDefault();
        const afterElement = getDragAfterElement(event.clientY);
        const draggable = document.querySelector('.dragging');
        if (afterElement == null) {
            event.target.appendChild(draggable);
        } else {
            event.target.insertBefore(draggable, afterElement);
        }
    });

    tarefa.addEventListener('dragenter', (event) => {
        event.preventDefault();
    });

    tarefa.addEventListener('dragleave', (event) => {
        event.target.classList.remove('dragging');
    });
}

// Função para determinar o elemento após o qual o item deve ser colocado
function getDragAfterElement(y) {
    const draggableElements = [...document.querySelectorAll('.tarefa:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}
