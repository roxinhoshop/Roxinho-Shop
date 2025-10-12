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
    const dropdownUsuario = document.getElementById("dropdown-usuario");
    const linkPainelDropdown = document.getElementById("link-painel-dropdown");
    const textoPainel = document.getElementById("texto-painel");
    
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
        
        // Manter seta mas mudar para baixo (menu hamburguer)
        if (setaLogin) {
            setaLogin.className = "fa-solid fa-chevron-down seta";
        }
        
        // Adicionar classe de logado
        caixaLogin.classList.add("logado");
        
        // Configurar link do painel baseado no tipo de usuário
        if (linkPainelDropdown) {
            if (isAdmin) {
                linkPainelDropdown.href = "admin-panel.html";
                if (textoPainel) {
                    textoPainel.textContent = "Painel Admin";
                }
            } else {
                linkPainelDropdown.href = "painelusuario.html";
                if (textoPainel) {
                    textoPainel.textContent = "Painel Usuário";
                }
            }
        }
        
        // Adicionar evento de clique para mostrar dropdown
        caixaLogin.style.cursor = "pointer";
        caixaLogin.onclick = toggleDropdownUsuario;
        
        // Configurar botão de logout
        const btnLogout = document.getElementById('botao-logout');
        if (btnLogout) {
            btnLogout.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                fazerLogout();
            };
        }
        
    } else {
        // Usuário não logado
        statusLogin.textContent = "Entre";
        if (subtextoLogin) {
            subtextoLogin.textContent = "Login";
        }
        
        // Mostrar seta para direita quando não logado
        if (setaLogin) {
            setaLogin.className = "fa-solid fa-arrow-right seta";
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

