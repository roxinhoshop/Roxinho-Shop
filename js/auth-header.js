/**
 * @file auth-header.js
 * @description Gerenciamento do cabeçalho com autenticação e menu do usuário
 */

/**
 * Atualiza o estado do cabeçalho baseado no login do usuário
 */
function atualizarEstadoLogin() {
    // Obter elementos do cabeçalho
    const caixaLogin = document.getElementById("caixa-login");
    const statusLogin = document.getElementById("status-login");
    const subtextoLogin = document.getElementById("subtexto-login");
    const setaLogin = document.getElementById("seta-login");
    const avatarUsuario = document.getElementById("avatar-usuario");
    const dropdownUsuario = document.getElementById("dropdown-usuario");
    
    if (!caixaLogin || !statusLogin) {
        console.warn("Elementos do cabeçalho não encontrados");
        return;
    }

    // Verificar se usuário está logado
    const token = localStorage.getItem("jwtToken");
    const userEmail = localStorage.getItem("userEmail");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (token && userEmail) {
        // Usuário logado - extrair nome do email
        const userName = userEmail.split('@')[0];
        const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);
        
        // Atualizar texto do cabeçalho
        statusLogin.textContent = `Olá, ${displayName}!`;
        if (subtextoLogin) {
            subtextoLogin.textContent = "Minha Conta";
        }
        
        // Remover seta quando logado
        if (setaLogin) {
            setaLogin.style.display = "none";
        }
        
        // Adicionar classe de logado
        caixaLogin.classList.add("logado");
        
        // Atualizar dropdown existente
        if (dropdownUsuario) {
            atualizarDropdownUsuario(isAdmin);
        }
        
        // Adicionar evento de clique para mostrar dropdown
        caixaLogin.style.cursor = "pointer";
        caixaLogin.onclick = toggleDropdownUsuario;
        
    } else {
        // Usuário não logado
        statusLogin.textContent = "Entre";
        if (subtextoLogin) {
            subtextoLogin.textContent = "Login";
        }
        
        // Mostrar seta quando não logado
        if (setaLogin) {
            setaLogin.style.display = "block";
        }
        
        // Remover classe de logado
        caixaLogin.classList.remove("logado");
        
        // Esconder dropdown
        if (dropdownUsuario) {
            dropdownUsuario.style.display = "none";
        }
        
        // Redirecionar para login ao clicar
        caixaLogin.style.cursor = "pointer";
        caixaLogin.onclick = () => window.location.href = "login.html";
    }
}

/**
 * Atualiza o dropdown do menu do usuário
 */
function atualizarDropdownUsuario(isAdmin) {
    const dropdown = document.getElementById('dropdown-usuario');
    if (!dropdown) return;
    
    // Atualizar link de admin no dropdown
    const linkAdminDropdown = document.getElementById('link-admin-dropdown');
    if (linkAdminDropdown) {
        linkAdminDropdown.style.display = isAdmin ? 'block' : 'none';
    }
    
    // Adicionar evento de logout
    const btnLogout = document.getElementById('botao-logout');
    if (btnLogout) {
        btnLogout.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            fazerLogout();
        };
    }
    
    // Adicionar link para painel admin se for admin
    const linkAdmin = document.getElementById('link-admin');
    if (linkAdmin) {
        linkAdmin.style.display = isAdmin ? 'flex' : 'none';
    }
}

/**
 * Toggle do dropdown do usuário
 */
function toggleDropdownUsuario(event) {
    event.stopPropagation();
    
    const dropdown = document.getElementById('dropdown-usuario');
    if (!dropdown) return;
    
    const isVisible = dropdown.style.display === 'block';
    dropdown.style.display = isVisible ? 'none' : 'block';
}

/**
 * Fecha dropdown ao clicar fora
 */
document.addEventListener('click', (event) => {
    const caixaLogin = document.getElementById('caixa-login');
    const dropdown = document.getElementById('dropdown-usuario');
    
    if (dropdown && caixaLogin && !caixaLogin.contains(event.target)) {
        dropdown.style.display = 'none';
    }
});

/**
 * Fazer logout
 */
function fazerLogout() {
    // Limpar localStorage
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("isAdmin");
    
    // Disparar evento de mudança de autenticação
    window.dispatchEvent(new Event("authChange"));
    
    // Mostrar notificação
    if (typeof showNotification === 'function') {
        showNotification("Logout realizado com sucesso!", "success");
    }
    
    // Redirecionar para home
    setTimeout(() => {
        window.location.href = "index.html";
    }, 500);
}

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(atualizarEstadoLogin, 100);
});

// Atualizar quando houver mudança de autenticação
window.addEventListener('authChange', atualizarEstadoLogin);

// Exportar funções
window.atualizarEstadoLogin = atualizarEstadoLogin;
window.fazerLogout = fazerLogout;

