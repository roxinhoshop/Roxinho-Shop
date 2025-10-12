/**
 * @file auth-system-api.js
 * @description Sistema de autenticação integrado com API backend para a Roxinho Shop.
 * Substitui o sistema localStorage por chamadas reais à API do servidor.
 */

class AuthSystemAPI {
    constructor() {
        this.currentUser = null;
        this.token = null;
        this.apiBaseUrl = '/api';
        
        this.initializeSystem();
    }

    /**
     * Inicializa o sistema de autenticação
     */
    initializeSystem() {
        this.loadStoredSession();
        console.log("🔐 Sistema de autenticação API inicializado");
    }

    /**
     * Carrega a sessão armazenada do localStorage
     */
    loadStoredSession() {
        const storedToken = localStorage.getItem("roxinho_token");
        if (storedToken) {
            this.token = storedToken;
            this.verifyToken();
        }
    }

    /**
     * Verifica se o token ainda é válido
     */
    async verifyToken() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                this.currentUser = data.user;
                console.log("✅ Sessão restaurada para:", this.currentUser.nome);
                this.updateUIForLoggedUser();
            } else {
                this.clearSession();
                console.log("⏰ Token inválido, sessão removida");
            }
        } catch (error) {
            console.error("❌ Erro ao verificar token:", error);
            this.clearSession();
        }
    }

    /**
     * Registra um novo usuário
     */
    async registerUser(userData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok || response.status === 201) {
                console.log("✅ Usuário registrado com sucesso:", userData.email);
                this.showMessage("Cadastro realizado com sucesso! Faça login para continuar.", "success");
                return { success: true, message: data.message };
            } else {
                this.showMessage(data.message || "Erro no cadastro", "error");
                return { success: false, error: data.message };
            }

        } catch (error) {
            console.error("❌ Erro no registro:", error);
            this.showMessage("Erro de conexão. Tente novamente.", "error");
            return { success: false, error: "Erro de conexão" };
        }
    }

    /**
     * Realiza o login do usuário
     */
    async loginUser(email, senha) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, senha })
            });

            const data = await response.json();

            if (response.ok && data.token) {
                // Decodificar o token para obter informações do usuário
                const tokenPayload = this.decodeToken(data.token);
                this.currentUser = {
                    id: tokenPayload.userId,
                    email: tokenPayload.email,
                    isAdmin: tokenPayload.isAdmin,
                    tipo_usuario: tokenPayload.isAdmin ? "admin" : "user"
                };
                this.token = data.token;
                
                localStorage.setItem("roxinho_token", this.token);
                
                console.log("✅ Login realizado com sucesso:", email);
                this.showMessage(`Bem-vindo!`, "success");
                this.updateUIForLoggedUser();
                
                return { success: true, user: this.currentUser };
            } else {
                this.showMessage(data.message || "Erro no login", "error");
                return { success: false, error: data.message };
            }

        } catch (error) {
            console.error("❌ Erro no login:", error);
            this.showMessage("Erro de conexão. Tente novamente.", "error");
            return { success: false, error: "Erro de conexão" };
        }
    }

    /**
     * Realiza o logout do usuário
     */
    logout() {
        this.currentUser = null;
        this.token = null;
        this.clearSession();
        this.updateUIForLoggedOut();
        
        console.log("👋 Logout realizado com sucesso");
        this.showMessage("Logout realizado com sucesso!", "info");
        
        // Redirecionar se não estiver na página inicial
        if (!window.location.pathname.includes("home.html") && 
            !window.location.pathname.includes("index.html") &&
            window.location.pathname !== "/") {
            setTimeout(() => {
                window.location.href = "/";
            }, 1500);
        }
    }

    /**
     * Verifica se o usuário está autenticado
     */
    isAuthenticated() {
        return this.currentUser !== null && this.token !== null;
    }

    /**
     * Verifica se o usuário é administrador
     */
    isAdmin() {
        return this.isAuthenticated() && this.currentUser.tipo_usuario === "admin";
    }

    /**
     * Retorna o usuário atual
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Requer autenticação de administrador
     */
    requireAdmin() {
        if (!this.isAuthenticated()) {
            this.showMessage("Você precisa fazer login para acessar esta área.", "error");
            window.location.href = "login.html";
            return false;
        }

        if (!this.isAdmin()) {
            this.showMessage("Acesso negado. Área restrita para administradores.", "error");
            window.location.href = "/";
            return false;
        }
        return true;
    }

    /**
     * Requer autenticação
     */
    requireAuth() {
        if (!this.isAuthenticated()) {
            this.showMessage("Você precisa fazer login para acessar esta área.", "error");
            window.location.href = "login.html";
            return false;
        }
        return true;
    }

    /**
     * Limpa a sessão
     */
    clearSession() {
        localStorage.removeItem("roxinho_token");
    }

    /**
     * Atualiza a interface para usuário logado
     */
    updateUIForLoggedUser() {
        // Atualizar botões de login/logout
        const loginButtons = document.querySelectorAll('.btn-login, .login-link');
        const logoutButtons = document.querySelectorAll('.btn-logout, .logout-link');
        const userInfo = document.querySelectorAll('.user-info, .user-name');

        loginButtons.forEach(btn => {
            btn.style.display = 'none';
        });

        logoutButtons.forEach(btn => {
            btn.style.display = 'inline-block';
            btn.onclick = () => this.logout();
        });

        userInfo.forEach(info => {
            info.textContent = this.currentUser.nome;
            info.style.display = 'inline-block';
        });

        // Mostrar/ocultar elementos baseado no tipo de usuário
        if (this.isAdmin()) {
            const adminElements = document.querySelectorAll('.admin-only');
            adminElements.forEach(el => el.style.display = 'block');
        }
    }

    /**
     * Atualiza a interface para usuário deslogado
     */
    updateUIForLoggedOut() {
        const loginButtons = document.querySelectorAll('.btn-login, .login-link');
        const logoutButtons = document.querySelectorAll('.btn-logout, .logout-link');
        const userInfo = document.querySelectorAll('.user-info, .user-name');
        const adminElements = document.querySelectorAll('.admin-only');

        loginButtons.forEach(btn => {
            btn.style.display = 'inline-block';
        });

        logoutButtons.forEach(btn => {
            btn.style.display = 'none';
        });

        userInfo.forEach(info => {
            info.style.display = 'none';
        });

        adminElements.forEach(el => {
            el.style.display = 'none';
        });
    }

    /**
     * Faz uma requisição autenticada à API
     */
    async authenticatedRequest(url, options = {}) {
        const defaultHeaders = {
            'Authorization': `Bearer ${this.token}`
        };

        // Não adicionar Content-Type se for FormData (o navegador faz isso automaticamente)
        if (!(options.body instanceof FormData)) {
            defaultHeaders['Content-Type'] = 'application/json';
        }

        const mergedOptions = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };

        try {
            const response = await fetch(`${this.apiBaseUrl}${url}`, mergedOptions);
            const data = await response.json();

            // Se o token expirou, fazer logout
            if (response.status === 401 || response.status === 403) {
                this.showMessage("Sessão expirada. Faça login novamente.", "warning");
                this.logout();
                return null;
            }

            return data;
        } catch (error) {
            console.error("❌ Erro na requisição autenticada:", error);
            this.showMessage("Erro de conexão. Tente novamente.", "error");
            return null;
        }
    }

    /**
     * Exibe mensagem de notificação
     */
    showMessage(message, type = "info") {
        // Remover notificações existentes
        const existingNotifications = document.querySelectorAll('.auth-notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement("div");
        notification.className = `auth-notification auth-${type}`;
        notification.innerHTML = `
            <div class="auth-notification-content">
                <span class="auth-notification-icon">
                    ${type === "success" ? "✅" : type === "error" ? "❌" : type === "warning" ? "⚠️" : "ℹ️"}
                </span>
                <span class="auth-notification-text">${message}</span>
                <button class="auth-notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Adicionar estilos se não existirem
        if (!document.getElementById("auth-notification-styles")) {
            const styles = document.createElement("style");
            styles.id = "auth-notification-styles";
            styles.textContent = `
                .auth-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    max-width: 400px;
                    padding: 15px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    animation: slideInRight 0.3s ease-out;
                    font-family: 'Nunito Sans', sans-serif;
                }
                .auth-success { 
                    background: #d4edda; 
                    border: 1px solid #c3e6cb; 
                    color: #155724; 
                }
                .auth-error { 
                    background: #f8d7da; 
                    border: 1px solid #f5c6cb; 
                    color: #721c24; 
                }
                .auth-warning { 
                    background: #fff3cd; 
                    border: 1px solid #ffeaa7; 
                    color: #856404; 
                }
                .auth-info { 
                    background: #d1ecf1; 
                    border: 1px solid #bee5eb; 
                    color: #0c5460; 
                }
                .auth-notification-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .auth-notification-icon {
                    font-size: 18px;
                }
                .auth-notification-text {
                    flex: 1;
                    font-size: 14px;
                    font-weight: 500;
                }
                .auth-notification-close {
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0.7;
                }
                .auth-notification-close:hover {
                    opacity: 1;
                }
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Remover automaticamente após 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    /**
     * Decodifica um token JWT
     */
    decodeToken(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Erro ao decodificar token:', error);
            return null;
        }
    }

    /**
     * Valida dados do usuário
     */
    validateUserData(userData) {
        if (!userData.nome || userData.nome.trim().length < 2) {
            this.showMessage("Nome deve ter pelo menos 2 caracteres", "error");
            return false;
        }
        if (!userData.sobrenome || userData.sobrenome.trim().length < 2) {
            this.showMessage("Sobrenome deve ter pelo menos 2 caracteres", "error");
            return false;
        }
        if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
            this.showMessage("Email inválido", "error");
            return false;
        }
        if (!userData.senha || userData.senha.length < 8) {
            this.showMessage("Senha deve ter pelo menos 8 caracteres", "error");
            return false;
        }
        return true;
    }
}

// Criar instância global
window.authAPI = new AuthSystemAPI();

// Compatibilidade com o sistema antigo
window.authSystem = window.authAPI;

console.log("🔐 Sistema de autenticação API carregado");
