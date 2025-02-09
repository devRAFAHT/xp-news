// Define a URL base para as requisições à API de usuários
const baseUrl = "http://localhost:8080/xp-news/users";

// Obtém os parâmetros da URL e extrai o parâmetro "id", se existir
const params = new URLSearchParams(window.location.search);
const userId = params.get('id');

/**
 * Busca todos os usuários e popula a tabela (caso exista um elemento com id "tabelaUsuarios").
 */
async function findAll() {
    // Monta a URL para buscar todos os usuários
    const url = `${baseUrl}/find-all`;

    await fetch(url)
        .then(response => response.json()) // Converte a resposta para JSON
        .then(data => {
            console.log("Dados recebidos:", data);

            // Extrai a lista de usuários da propriedade "content"
            const users = data.content;
            if (!users || users.length === 0) {
                console.log("Nenhum usuário encontrado.");
                return;
            }

            // Para cada usuário, cria uma linha na tabela
            users.forEach(user => {
                // Cria um novo elemento de linha (<tr>)
                const novaLinha = document.createElement('tr');

                // Cria as células da tabela para exibir os dados do usuário
                const tdId = document.createElement('td');
                const tdFullName = document.createElement('td');
                const tdEmail = document.createElement('td');
                const tdUsername = document.createElement('td');
                const tdRole = document.createElement('td');
                const tdAcoes = document.createElement('td');

                // Preenche as células com os dados do usuário
                tdId.innerText = user.id || "N/A";
                tdFullName.innerText = user.fullName || "N/A";
                tdEmail.innerText = user.email || "N/A";
                tdUsername.innerText = user.username || "N/A";
                // Remove o prefixo "ROLE_" do valor da role, se existir
                tdRole.innerText = user.role ? user.role.substring("ROLE_".length) : "N/A";

                // Cria o botão de "Editar"
                const btnEditar = document.createElement('button');
                btnEditar.classList.add('btn', 'btn-secondary', 'btn-sm', 'me-2');
                btnEditar.textContent = 'Editar';
                // Ao clicar, redireciona para a tela de edição com o id do usuário na URL
                btnEditar.addEventListener('click', () => {
                    window.location.href = `../pages/editar-usuario.html?id=${user.id}`;
                });

                // Cria o botão de "Excluir"
                const btnExcluir = document.createElement('button');
                btnExcluir.classList.add('btn', 'btn-danger', 'btn-sm');
                btnExcluir.textContent = 'Excluir';
                // Ao clicar, chama a função deleteUser passando o id do usuário
                btnExcluir.addEventListener('click', () => deleteUser(user.id));

                // Adiciona os botões na célula de ações
                tdAcoes.appendChild(btnEditar);
                tdAcoes.appendChild(btnExcluir);

                // Adiciona todas as células na linha criada
                novaLinha.appendChild(tdId);
                novaLinha.appendChild(tdFullName);
                novaLinha.appendChild(tdEmail);
                novaLinha.appendChild(tdUsername);
                novaLinha.appendChild(tdRole);
                novaLinha.appendChild(tdAcoes);

                // Adiciona a linha na tabela (elemento com id "tabelaUsuarios")
                document.getElementById('tabelaUsuarios').appendChild(novaLinha);
            });
        })
        .catch(error => console.error("Erro na requisição:", error)); // Trata possíveis erros na requisição
}

/**
 * Deleta o usuário com o id especificado.
 * @param {number} userId - O id do usuário a ser excluído.
 */
async function deleteUser(userId) {
    // Monta a URL para excluir o usuário
    const url = `${baseUrl}/delete?id=${userId}`;

    await fetch(url, {
        method: 'DELETE' // Método HTTP para deleção
    })
        .then(response => {
            if (response.ok) {
                // Exibe mensagem de sucesso e recarrega a lista de usuários
                alert('Usuário excluído com sucesso!');
                document.getElementById('tabelaUsuarios').innerHTML = '';
                findAll();
            } else {
                alert('Erro ao excluir o usuário.');
            }
        })
        .catch(error => console.error("Erro ao excluir usuário:", error));
}

/**
 * Atualiza os dados do usuário (para a tela de edição).
 */
async function updateUser() {
    // Obtém novamente o parâmetro "id" da URL (pode ser redundante se já estiver na variável global)
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');

    // Coleta os valores dos campos do formulário de edição
    const fullName = document.getElementById('fullName').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;

    // Monta o objeto com os dados do usuário para atualização
    const userData = {
        fullName: fullName,
        username: username,
        email: email,
        role: role
    };

    // Monta a URL para atualizar o usuário
    const url = `${baseUrl}/update?id=${userId}`;

    try {
        const response = await fetch(url, {
            method: 'PUT', // Método HTTP para atualização
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData) // Converte o objeto para JSON
        });

        if (response.ok) {
            alert('Usuário atualizado com sucesso!');
            // Redireciona para a tela de administração após a atualização
            window.location.href = 'tela-administracao.html';
        } else {
            alert('Erro ao atualizar usuário.');
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Ocorreu um erro ao atualizar o usuário.');
    }
}

/**
 * Preenche o formulário de edição com os dados do usuário.
 */
async function getUserById() {
    // Obtém o id do usuário a partir dos parâmetros da URL
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');

    // Monta a URL para buscar os dados do usuário
    const url = `${baseUrl}/find-by-id?id=${userId}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.id) {
            // Preenche os campos do formulário com os dados do usuário
            document.getElementById('fullName').value = data.fullName || "";
            document.getElementById('email').value = data.email || "";
            document.getElementById('username').value = data.username || "";
            document.getElementById('role').value = data.role || "ROLE_CLIENT";
        } else {
            alert("Dados do usuário não encontrados.");
        }
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
    }
}

/**
 * Cria um novo usuário (para a tela de criação).
 * O payload enviado será:
 * {
 *    "fullName": "Rafael Oliveira",
 *    "username": "rafaht15",
 *    "email": "rafag@gmail.com",
 *    "password": "securePassword123"
 * }
 */
async function createUser() {
    // Coleta os dados do formulário de criação
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Monta o objeto com os dados do novo usuário
    const userData = {
        fullName: fullName,
        email: email,
        username: username,
        password: password
    };

    // Monta a URL para criar um novo usuário
    const url = `${baseUrl}/create`;

    try {
        const response = await fetch(url, {
            method: 'POST', // Método HTTP para criação
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData) // Converte os dados para JSON
        });

        if (response.ok) {
            alert('Usuário criado com sucesso!');
            // Redireciona para a tela de administração após a criação
            window.location.href = 'tela-administracao.html';
        } else {
            // Caso haja erro, tenta extrair a mensagem de erro da resposta
            const errorData = await response.json();
            console.error('Erro ao criar usuário:', errorData);
            alert('Erro ao criar usuário. Verifique os dados informados.');
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Ocorreu um erro ao criar o usuário.');
    }
}

/**
 * Configura os eventos de acordo com a página atual.
 * - Se a página contém a tabela de usuários (id "tabelaUsuarios"), chama findAll().
 * - Se a página é de edição (formulário "editUserForm" e parâmetro "id" na URL), preenche os dados e configura o submit.
 * - Se a página é de criação (formulário "createUserForm"), configura o submit para criar um novo usuário.
 */
window.onload = function() {
    // Se existir a tabela de usuários, carrega os usuários
    if (document.getElementById('tabelaUsuarios')) {
        findAll();
    }

    // Se estiver na tela de edição (formulário com id "editUserForm" e há parâmetro "id" na URL)
    if (document.getElementById('editUserForm') && params.get('id')) {
        getUserById(); // Preenche o formulário com os dados do usuário
        document.getElementById('editUserForm').addEventListener('submit', function (event) {
            event.preventDefault(); // Previne o envio padrão do formulário
            updateUser(); // Atualiza os dados do usuário
        });
    }

    // Se estiver na tela de criação (formulário com id "createUserForm")
    if (document.getElementById('createUserForm')) {
        document.getElementById('createUserForm').addEventListener('submit', function (event) {
            event.preventDefault(); // Previne o envio padrão do formulário
            createUser(); // Cria um novo usuário
        });
    }
};
