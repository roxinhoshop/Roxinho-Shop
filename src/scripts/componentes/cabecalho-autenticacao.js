


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
        
        // Obter o nome do usuário do localStorage (se disponível) ou extrair do email
        let displayName = localStorage.getItem("userFirstName");
        
        // Se não tiver o nome armazenado, usar o email como fallback
        if (!displayName) {
            const userName = userEmail.split('@')[0];
            displayName = userName.charAt(0).toUpperCase() + userName.slice(1);
        }
        
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
        
        // Configurar links dos painéis baseado no tipo de usuário
        const linkPainelAdmin = document.getElementById('link-painel-admin');
        const linkPainelUsuario = document.getElementById('link-painel-usuario');
        
        if (isAdmin) {
            // Admin: mostrar AMBOS os painéis
            if (linkPainelAdmin) {
                linkPainelAdmin.style.display = "flex";
            }
            if (linkPainelUsuario) {
                linkPainelUsuario.style.display = "flex";
            }
        } else {
            // Usuário comum: mostrar APENAS painel de usuário
            if (linkPainelAdmin) {
                linkPainelAdmin.style.display = "none";
            }
            if (linkPainelUsuario) {
                linkPainelUsuario.style.display = "flex";
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
        caixaLogin.onclick = () => {
            // Detectar se está na raiz ou em src/paginas
            const currentPath = window.location.pathname;
            if (currentPath === '/' || currentPath.endsWith('index.html')) {
                window.location.href = "src/paginas/entrar.html";
            } else {
                window.location.href = "entrar.html";
            }
        };
    }
}


function toggleDropdownUsuario(event) {
    // Se clicou em um link dentro do dropdown, permitir navegação
    if (event.target.tagName === 'A' || event.target.closest('a')) {
        return; // Deixar o link funcionar normalmente
    }
    
    event.preventDefault();
    event.stopPropagation();
    
    const dropdown = document.getElementById('dropdown-usuario');
    if (!dropdown) return;
    
    const isVisible = dropdown.style.display === 'block';
    dropdown.style.display = isVisible ? 'none' : 'block';
}


document.addEventListener('click', (event) => {
    const caixaLogin = document.getElementById('caixa-login');
    const dropdown = document.getElementById('dropdown-usuario');
    
    // Não fechar se clicou em um link dentro do dropdown
    if (event.target.tagName === 'A' && event.target.closest('#dropdown-usuario')) {
        return; // Permitir navegação
    }
    
    if (dropdown && caixaLogin && !caixaLogin.contains(event.target)) {
        dropdown.style.display = 'none';
    }
});


function fazerLogout() {
    // Criar modal de confirmação fluent design
    mostrarModalLogout();
}

function mostrarModalLogout() {
    // Criar overlay
    const overlay = document.createElement('div');
    overlay.id = 'logout-modal-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.2s ease;
    `;

    // Criar modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: var(--cor-fundo-card, #ffffff);
        border-radius: 12px;
        padding: 24px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        animation: slideUp 0.3s ease;
    `;

    modal.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 48px; color: #f59e0b; margin-bottom: 16px;">
                <i class="fas fa-sign-out-alt"></i>
            </div>
            <h3 style="margin: 0 0 8px 0; font-size: 20px; color: var(--cor-texto, #000);">Deseja realmente sair da conta?</h3>
            <p style="margin: 0 0 24px 0; color: var(--cor-texto-secundario, #666); font-size: 14px;">Você precisará fazer login novamente para acessar sua conta.</p>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button id="btn-cancelar-logout" style="
                    padding: 10px 24px;
                    border: 2px solid var(--cor-primaria, #7c3aed);
                    background: transparent;
                    color: var(--cor-primaria, #7c3aed);
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    transition: all 0.2s;
                ">
                    Cancelar
                </button>
                <button id="btn-confirmar-logout" style="
                    padding: 10px 24px;
                    border: none;
                    background: var(--cor-primaria, #7c3aed);
                    color: white;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    transition: all 0.2s;
                ">
                    Sair da Conta
                </button>
            </div>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Adicionar estilos de animação
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        #btn-cancelar-logout:hover {
            background: var(--cor-primaria, #7c3aed);
            color: white;
        }
        #btn-confirmar-logout:hover {
            background: var(--cor-primaria-hover, #6d28d9);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }
    `;
    document.head.appendChild(style);

    // Event listeners
    document.getElementById('btn-cancelar-logout').addEventListener('click', () => {
        overlay.remove();
        style.remove();
    });

    document.getElementById('btn-confirmar-logout').addEventListener('click', () => {
        overlay.remove();
        style.remove();
        executarLogout();
    });

    // Fechar ao clicar fora
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
            style.remove();
        }
    });
}

function executarLogout() {
    // Limpar TODO o localStorage relacionado à autenticação
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("userName");
    localStorage.removeItem("userFirstName");
    
    // Disparar evento de mudança de autenticação
    window.dispatchEvent(new Event("authChange"));
    
    // Mostrar notificação
    if (typeof showNotification === 'function') {
        showNotification("Você saiu da sua conta com sucesso!", "success");
    }
    
    // Atualizar interface imediatamente
    atualizarEstadoLogin();
    
    // Redirecionar para home após um breve delay
    setTimeout(() => {
        const currentPath = window.location.pathname;
        
        // Determinar o caminho correto para a home
        let homePath = '/';
        if (currentPath.includes('/src/paginas/')) {
            homePath = '../../index.html';
        } else if (currentPath.includes('/paginas/')) {
            homePath = '../index.html';
        }
        
        // Sempre redirecionar para home (não recarregar)
        window.location.href = homePath;
    }, 800);
}


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

