const baseUrl = "http://localhost:8080/xp-news/users";
const params = new URLSearchParams(window.location.search);
const userId = params.get('id');

/**
 * Busca todos os usuários e popula a tabela (caso exista um elemento com id "tabelaUsuarios").
 */
async function findAll() {
    const url = `${baseUrl}/find-all`;

    await fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log("Dados recebidos:", data);

            const users = data.content;
            if (!users || users.length === 0) {
                console.log("Nenhum usuário encontrado.");
                return;
            }

            users.forEach(user => {
                const novaLinha = document.createElement('tr');

                const tdId = document.createElement('td');
                const tdFullName = document.createElement('td');
                const tdEmail = document.createElement('td');
                const tdUsername = document.createElement('td');
                const tdRole = document.createElement('td');
                const tdAcoes = document.createElement('td');

                tdId.innerText = user.id || "N/A";
                tdFullName.innerText = user.fullName || "N/A";
                tdEmail.innerText = user.email || "N/A";
                tdUsername.innerText = user.username || "N/A";
                // Remove o prefixo "ROLE_" se existir
                tdRole.innerText = user.role ? user.role.substring("ROLE_".length) : "N/A";

                // Botão de editar
                const btnEditar = document.createElement('button');
                btnEditar.classList.add('btn', 'btn-secondary', 'btn-sm', 'me-2');
                btnEditar.textContent = 'Editar';
                btnEditar.addEventListener('click', () => {
                    window.location.href = `../pages/editar-usuario.html?id=${user.id}`;
                });

                // Botão de excluir
                const btnExcluir = document.createElement('button');
                btnExcluir.classList.add('btn', 'btn-danger', 'btn-sm');
                btnExcluir.textContent = 'Excluir';
                btnExcluir.addEventListener('click', () => deleteUser(user.id));

                tdAcoes.appendChild(btnEditar);
                tdAcoes.appendChild(btnExcluir);

                novaLinha.appendChild(tdId);
                novaLinha.appendChild(tdFullName);
                novaLinha.appendChild(tdEmail);
                novaLinha.appendChild(tdUsername);
                novaLinha.appendChild(tdRole);
                novaLinha.appendChild(tdAcoes);

                document.getElementById('tabelaUsuarios').appendChild(novaLinha);
            });
        })
        .catch(error => console.error("Erro na requisição:", error));
}

/**
 * Deleta o usuário com o id especificado.
 */
async function deleteUser(userId) {
    const url = `${baseUrl}/delete?id=${userId}`;

    await fetch(url, {
        method: 'DELETE'
    })
        .then(response => {
            if (response.ok) {
                alert('Usuário excluído com sucesso!');
                // Limpa a tabela e recarrega os usuários
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
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');

    const fullName = document.getElementById('fullName').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;

    const userData = {
        fullName: fullName,
        username: username,
        email: email,
        role: role
    };

    const url = `${baseUrl}/update?id=${userId}`;

    try {
        const response = await fetch(url, {
            method: 'PUT', // Ou 'PATCH', conforme sua API
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            alert('Usuário atualizado com sucesso!');
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
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');

    const url = `${baseUrl}/find-by-id?id=${userId}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.id) {
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
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const userData = {
        fullName: fullName,
        email: email,
        username: username,
        password: password
    };

    const url = `${baseUrl}/create`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            alert('Usuário criado com sucesso!');
            // Após criar, redireciona para a tela de login ou para outra página desejada
            window.location.href = 'tela-administracao.html';
        } else {
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
 */
window.onload = function() {
    // Se existir a tabela de usuários, chama a função findAll()
    if (document.getElementById('tabelaUsuarios')) {
        findAll();
    }

    // Se estiver na tela de edição (com id "editUserForm" e parâmetro id na URL)
    if (document.getElementById('editUserForm') && params.get('id')) {
        getUserById();
        document.getElementById('editUserForm').addEventListener('submit', function (event) {
            event.preventDefault();
            updateUser();
        });
    }

    // Se estiver na tela de criação de usuário (com id "createUserForm")
    if (document.getElementById('createUserForm')) {
        document.getElementById('createUserForm').addEventListener('submit', function (event) {
            event.preventDefault();
            createUser();
        });
    }
};
