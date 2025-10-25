const API_BASE_URL = "http://localhost:8000"; // Será ajustado para o URL do backend

// --- Funções de Login/Cadastro ---

async function registerUser(nome, email, senha) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || "Erro ao cadastrar usuário.");
        }
        return data;
    } catch (error) {
        console.error("Erro no cadastro:", error);
        throw error;
    }
}

async function loginUser(email, senha) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || "Erro ao fazer login.");
        }
        
        // Salvar dados do usuário no localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isLoggedIn', 'true');
        return data.user;

    } catch (error) {
        console.error("Erro no login:", error);
        throw error;
    }
}

function logoutUser() {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    updateHeaderLoginStatus();
    // Redirecionar para a página inicial
    window.location.href = "index.html"; 
}

function getLoggedInUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// --- Funções de UI ---

function updateHeaderLoginStatus() {
    const user = getLoggedInUser();
    const statusLogin = document.getElementById('status-login');
    const subtextoLogin = document.getElementById('subtexto-login');
    const dropdownUsuario = document.getElementById('dropdown-usuario');
    const caixaLogin = document.getElementById('caixa-login');
    const setaLogin = document.getElementById('seta-login');
    
    if (user) {
        statusLogin.innerText = `Olá, ${user.nome.split(' ')[0]}!`;
        subtextoLogin.innerText = "Minha Conta";
        caixaLogin.href = "painelusuario.html"; // Redireciona para o painel
        dropdownUsuario.style.display = 'block'; // Mostrar dropdown
        setaLogin.style.display = 'block'; // Mostrar seta
        
        // Configurar botão de logout no dropdown
        const btnLogout = document.getElementById('botao-logout');
        if (btnLogout) {
            btnLogout.onclick = logoutUser;
        }

    } else {
        statusLogin.innerText = "Entre";
        subtextoLogin.innerText = "Login";
        caixaLogin.href = "login.html"; // Redireciona para login
        dropdownUsuario.style.display = 'none'; // Esconder dropdown
        setaLogin.style.display = 'none'; // Esconder seta
    }
}

// --- Funções de Modo Escuro ---

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
}

function applyInitialDarkMode() {
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
    }
}

// Aplica o modo escuro antes do carregamento completo da página
applyInitialDarkMode();

// --- Event Listeners ---

document.addEventListener('DOMContentLoaded', () => {
    updateHeaderLoginStatus();

    // Listener para o botão de modo escuro
    const modoEscuroToggle = document.getElementById('modoEscuroToggle');
    if (modoEscuroToggle) {
        modoEscuroToggle.addEventListener('click', toggleDarkMode);
    }
    
    // Configurar o formulário de login (se estiver na página de login)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;
            const mensagemErro = document.getElementById('mensagem-erro');
            
            try {
                await loginUser(email, senha);
                window.location.href = "index.html"; // Redirecionar para a página inicial
            } catch (error) {
                mensagemErro.innerText = error.message;
                mensagemErro.style.display = 'block';
            }
        });
    }

    // Configurar o formulário de cadastro (se estiver na página de cadastro)
    const cadastroForm = document.getElementById('cadastro-form');
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;
            const mensagemErro = document.getElementById('mensagem-erro');
            
            try {
                await registerUser(nome, email, senha);
                // Após o cadastro, redirecionar para a página de login
                window.location.href = "login.html?cadastro=sucesso"; 
            } catch (error) {
                mensagemErro.innerText = error.message;
                mensagemErro.style.display = 'block';
            }
        });
    }
});

