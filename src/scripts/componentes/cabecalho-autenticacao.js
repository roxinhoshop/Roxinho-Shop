/**
 * Mantém usuário logado permanentemente até clicar em Sair
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
        // ========== USUÁRIO LOGADO ==========
        
        // Extrair nome do email
        const userName = userEmail.split('@')[0];
        const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);
        
        // Atualizar texto do cabeçalho
        statusLogin.textContent = `Olá, ${displayName}!`;
        if (subtextoLogin) {
            subtextoLogin.textContent = "Minha Conta";
        }
        
        // Mudar seta para baixo (menu hamburguer)
        if (setaLogin) {
            setaLogin.className = "fa-solid fa-chevron-down seta";
        }
        
        // Adicionar classe de logado
        caixaLogin.classList.add("logado");
        
        // Configurar link do painel baseado no tipo de usuário
        if (linkPainelDropdown) {
            if (isAdmin) {
                linkPainelDropdown.href = "painel-administracao.html";
                if (textoPainel) {
                    textoPainel.textContent = "Painel Admin";
                }
            } else {
                linkPainelDropdown.href = "painel-usuario.html";
                if (textoPainel) {
                    textoPainel.textContent = "Painel Usuário";
                }
            }
        }
        
        // IMPORTANTE: Apenas abrir menu, NÃO redirecionar
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
        // ========== USUÁRIO NÃO LOGADO ==========
        
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
        
        // Redirecionar para login ao clicar (apenas quando NÃO logado)
        caixaLogin.style.cursor = "pointer";
        caixaLogin.onclick = () => window.location.href = "entrar.html";
    }
}

/**
 * Toggle do dropdown do usuário
 * IMPORTANTE: Não redireciona, apenas abre/fecha o menu
 */
function toggleDropdownUsuario(event) {
    event.preventDefault();
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
 * IMPORTANTE: Esta é a ÚNICA forma de deslogar
 */
function fazerLogout() {
    // Confirmar logout
    if (!confirm('Deseja realmente sair da sua conta?')) {
        return;
    }
    
    // Limpar TODO o localStorage relacionado à autenticação
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("userName");
    
    // Disparar evento de mudança de autenticação
    window.dispatchEvent(new Event("authChange"));
    
    // Mostrar notificação
    if (typeof showNotification === 'function') {
        showNotification("Você saiu da sua conta com sucesso!", "success");
    }
    
    // Redirecionar para home
    setTimeout(() => {
        window.location.href = "../../index.html";
    }, 500);
}

/**
 * Verifica se o token ainda é válido
 * Mantém usuário logado permanentemente até ele clicar em Sair
 */
function verificarTokenValido() {
    const token = localStorage.getItem("jwtToken");
    
    // Se tem token, considera válido
    // Não expira automaticamente
    return !!token;
}

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se usuário está logado
    if (verificarTokenValido()) {
    }
    
    // Atualizar interface
    setTimeout(atualizarEstadoLogin, 100);
    
    // Proteção adicional: Re-aplicar comportamento correto após 500ms
    setTimeout(() => {
        const caixaLogin = document.getElementById("caixa-login");
        const token = localStorage.getItem("jwtToken");
        
        if (caixaLogin && token) {
            // Remover TODOS os event listeners
            const novaCaixa = caixaLogin.cloneNode(true);
            caixaLogin.parentNode.replaceChild(novaCaixa, caixaLogin);
            
            // Adicionar apenas o comportamento correto
            novaCaixa.onclick = toggleDropdownUsuario;
            novaCaixa.style.cursor = "pointer";
        }
    }, 500);
});

// Atualizar quando houver mudança de autenticação
window.addEventListener('authChange', atualizarEstadoLogin);

// Manter login ao navegar entre páginas
window.addEventListener('pageshow', () => {
    atualizarEstadoLogin();
});

// Exportar funções
window.atualizarEstadoLogin = atualizarEstadoLogin;
window.fazerLogout = fazerLogout;
window.verificarTokenValido = verificarTokenValido;
window.toggleDropdownUsuario = toggleDropdownUsuario;

