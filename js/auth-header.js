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
        statusLogin.innerHTML = `Olá, ${displayName}!`;
        caixaLogin.classList.add("logado");
        
        // Criar dropdown se não existir
        if (!dropdownUsuario) {
            criarDropdownUsuario(isAdmin);
        } else {
            atualizarDropdownUsuario(isAdmin);
        }
        
        // Adicionar evento de clique para mostrar dropdown
        caixaLogin.style.cursor = "pointer";
        caixaLogin.onclick = toggleDropdownUsuario;
        
    } else {
        // Usuário não logado
        statusLogin.innerHTML = 'Entre <span class="subtexto-login">ou cadastre-se</span>';
        caixaLogin.classList.remove("logado");
        
        // Remover dropdown
        if (dropdownUsuario) {
            dropdownUsuario.style.display = "none";
        }
        
        // Redirecionar para login ao clicar
        caixaLogin.style.cursor = "pointer";
        caixaLogin.onclick = () => window.location.href = "login.html";
    }
}

/**
 * Cria o dropdown do menu do usuário
 */
function criarDropdownUsuario(isAdmin) {
    const caixaLogin = document.getElementById("caixa-login");
    
    const dropdown = document.createElement('div');
    dropdown.id = 'dropdown-usuario';
    dropdown.className = 'dropdown-usuario';
    dropdown.style.display = 'none';
    
    let menuHTML = '<ul class="menu-usuario">';
    
    if (isAdmin) {
        menuHTML += `
            <li><a href="admin-panel.html"><i class="fas fa-cog"></i> Painel Admin</a></li>
            <li><a href="painelusuario.html"><i class="fas fa-user"></i> Painel Usuário</a></li>
        `;
    } else {
        menuHTML += `
            <li><a href="painelusuario.html"><i class="fas fa-user"></i> Configurações</a></li>
        `;
    }
    
    menuHTML += `
        <li class="divider"></li>
        <li><a href="#" id="btn-logout"><i class="fas fa-sign-out-alt"></i> Sair</a></li>
    </ul>`;
    
    dropdown.innerHTML = menuHTML;
    caixaLogin.appendChild(dropdown);
    
    // Adicionar evento de logout
    setTimeout(() => {
        const btnLogout = document.getElementById('btn-logout');
        if (btnLogout) {
            btnLogout.onclick = (e) => {
                e.preventDefault();
                fazerLogout();
            };
        }
    }, 100);
}

/**
 * Atualiza o dropdown existente
 */
function atualizarDropdownUsuario(isAdmin) {
    const dropdown = document.getElementById('dropdown-usuario');
    if (!dropdown) return;
    
    let menuHTML = '<ul class="menu-usuario">';
    
    if (isAdmin) {
        menuHTML += `
            <li><a href="admin-panel.html"><i class="fas fa-cog"></i> Painel Admin</a></li>
            <li><a href="painelusuario.html"><i class="fas fa-user"></i> Painel Usuário</a></li>
        `;
    } else {
        menuHTML += `
            <li><a href="painelusuario.html"><i class="fas fa-user"></i> Configurações</a></li>
        `;
    }
    
    menuHTML += `
        <li class="divider"></li>
        <li><a href="#" id="btn-logout"><i class="fas fa-sign-out-alt"></i> Sair</a></li>
    </ul>`;
    
    dropdown.innerHTML = menuHTML;
    
    // Adicionar evento de logout
    setTimeout(() => {
        const btnLogout = document.getElementById('btn-logout');
        if (btnLogout) {
            btnLogout.onclick = (e) => {
                e.preventDefault();
                fazerLogout();
            };
        }
    }, 100);
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

