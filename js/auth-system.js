/**
 * @file auth-system.js
 * @description Sistema de autenticação e autorização para a Roxinho Shop.
 * Gerencia o registro, login, logout, sessões de usuário e controle de acesso.
 * Utiliza localStorage para persistência de dados e simula hash de senhas.
 */

class AuthSystem {
    /**
     * Construtor da classe AuthSystem.
     * Inicializa o sistema de autenticação, carrega sessões e configura a verificação de sessão.
     */
    constructor() {
        /** @type {object|null} */
        this.currentUser = null;
        /** @type {string|null} */
        this.sessionToken = null;
        /** @type {number} Tempo de expiração da sessão em milissegundos (24 horas). */
        this.sessionTimeout = 24 * 60 * 60 * 1000; 
        
        this.initializeSystem();
    }

    /**
     * Inicializa o sistema de autenticação.
     * Carrega a sessão armazenada e configura a verificação periódica de sessão.
     */
    initializeSystem() {
        this.loadStoredSession();
        this.setupSessionCheck();
        console.log("🔐 Sistema de autenticação inicializado");
    }

    /**
     * Carrega a sessão do usuário a partir do localStorage.
     * Verifica a validade da sessão e a restaura se for válida.
     */
    loadStoredSession() {
        const storedSession = localStorage.getItem("roxinho_session");
        if (storedSession) {
            try {
                const sessionData = JSON.parse(storedSession);
                
                if (new Date().getTime() - sessionData.timestamp < this.sessionTimeout) {
                    this.currentUser = sessionData.user;
                    this.sessionToken = sessionData.token;
                    console.log("✅ Sessão restaurada para:", this.currentUser.nome);
                } else {
                    this.clearSession();
                    console.log("⏰ Sessão expirada, removida automaticamente");
                }
            } catch (error) {
                console.error("❌ Erro ao carregar sessão:", error);
                this.clearSession();
            }
        }
    }

    /**
     * Configura uma verificação periódica para sessões expiradas.
     * A verificação ocorre a cada minuto.
     */
    setupSessionCheck() {
        setInterval(() => {
            if (this.isAuthenticated()) {
                const storedSession = localStorage.getItem("roxinho_session");
                if (storedSession) {
                    const sessionData = JSON.parse(storedSession);
                    if (new Date().getTime() - sessionData.timestamp >= this.sessionTimeout) {
                        this.logout();
                        this.showMessage("Sua sessão expirou. Faça login novamente.", "warning");
                    }
                }
            }
        }, 60000); // Verificar a cada minuto
    }

    /**
     * Gera um hash da senha usando uma implementação simples (simulada).
     * Em um ambiente de produção, uma biblioteca de hash de senha robusta seria usada no backend.
     * @param {string} password - A senha a ser hashada.
     * @returns {Promise<string>} O hash da senha.
     */
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + "roxinho_salt_2024");
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    }

    /**
     * Gera um token de sessão único.
     * @returns {string} O token de sessão gerado.
     */
    generateSessionToken() {
        return "rox_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Registra um novo usuário no sistema.
     * @param {object} userData - Dados do usuário a ser registrado.
     * @param {string} userData.nome - Nome do usuário.
     * @param {string} userData.sobrenome - Sobrenome do usuário.
     * @param {string} userData.email - E-mail do usuário (deve ser único).
     * @param {string} userData.senha - Senha do usuário (será hashada).
     * @param {string} [userData.telefone] - Telefone do usuário.
     * @param {string} [userData.data_nascimento] - Data de nascimento do usuário.
     * @param {string} [userData.cpf] - CPF do usuário.
     * @returns {Promise<object>} Objeto com `success` (boolean) e `user` (objeto do usuário sanitizado) ou `error` (string).
     */
    async registerUser(userData) {
        try {
            if (!this.validateUserData(userData)) {
                throw new Error("Dados de usuário inválidos");
            }

            const existingUser = await this.getUserByEmail(userData.email);
            if (existingUser) {
                throw new Error("Este e-mail já está cadastrado");
            }

            const hashedPassword = await this.hashPassword(userData.senha);

            const newUser = {
                id: this.generateUserId(),
                nome: userData.nome.trim(),
                sobrenome: userData.sobrenome.trim(),
                email: userData.email.toLowerCase().trim(),
                senha_hash: hashedPassword,
                telefone: userData.telefone || null,
                data_nascimento: userData.data_nascimento || null,
                cpf: userData.cpf || null,
                email_verificado: false,
                ativo: true,
                tipo_usuario: "cliente",
                data_criacao: new Date().toISOString(),
                data_atualizacao: new Date().toISOString(),
                xp_total: 0,
                nivel_atual: 1,
                titulo_nivel: "Novato"
            };

            await this.saveUser(newUser);
            
            // Se o emailSystem estiver disponível, enviar e-mail de boas-vindas
            if (window.emailSystem) {
                await window.emailSystem.sendWelcomeEmail(newUser);
            }

            console.log("✅ Usuário registrado com sucesso:", newUser.email);
            return { success: true, user: this.sanitizeUser(newUser) };

        } catch (error) {
            console.error("❌ Erro no registro:", error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Realiza o login de um usuário.
     * @param {string} email - E-mail do usuário.
     * @param {string} senha - Senha do usuário.
     * @returns {Promise<object>} Objeto com `success` (boolean) e `user` (objeto do usuário sanitizado) ou `error` (string).
     */
    async loginUser(email, senha) {
        try {
            const user = await this.getUserByEmail(email.toLowerCase().trim());
            if (!user) {
                throw new Error("E-mail ou senha incorretos");
            }

            if (!user.ativo) {
                throw new Error("Conta desativada. Entre em contato com o suporte.");
            }

            const hashedInputPassword = await this.hashPassword(senha);
            if (hashedInputPassword !== user.senha_hash) {
                throw new Error("E-mail ou senha incorretos");
            }

            this.sessionToken = this.generateSessionToken();
            this.currentUser = user;

            this.saveSession();

            user.ultimo_login = new Date().toISOString();
            await this.updateUser(user);

            console.log("✅ Login realizado com sucesso:", user.email);
            return { success: true, user: this.sanitizeUser(user) };

        } catch (error) {
            console.error("❌ Erro no login:", error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Realiza o logout do usuário, limpando a sessão e redirecionando para a página de login.
     */
    logout() {
        this.currentUser = null;
        this.sessionToken = null;
        this.clearSession();
        console.log("👋 Logout realizado com sucesso");
        
        if (!window.location.pathname.includes("home.html") && 
            !window.location.pathname.includes("index.html") &&
            window.location.pathname !== "/") {
            window.location.href = "login.html";
        }
    }

    /**
     * Verifica se o usuário atual está autenticado.
     * @returns {boolean} True se o usuário estiver logado, false caso contrário.
     */
    isAuthenticated() {
        return this.currentUser !== null && this.sessionToken !== null;
    }

    /**
     * Verifica se o usuário atual é um administrador.
     * @returns {boolean} True se o usuário for administrador e estiver logado, false caso contrário.
     */
    isAdmin() {
        return this.isAuthenticated() && this.currentUser.tipo_usuario === "admin";
    }

    /**
     * Retorna o objeto do usuário atualmente logado, com dados sensíveis removidos.
     * @returns {object|null} O objeto do usuário logado ou null se não houver sessão.
     */
    getCurrentUser() {
        return this.currentUser ? this.sanitizeUser(this.currentUser) : null;
    }

    /**
     * Requer que o usuário seja um administrador para acessar a página.
     * Redireciona para a página de login ou inicial se o usuário não tiver permissão.
     * @returns {boolean} True se o usuário for administrador, false se redirecionado.
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
     * Requer que o usuário esteja logado para acessar a página.
     * Redireciona para a página de login se o usuário não estiver autenticado.
     * @returns {boolean} True se o usuário estiver logado, false se redirecionado.
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
     * Valida os dados fornecidos para registro de usuário.
     * @param {object} userData - Dados do usuário a serem validados.
     * @returns {boolean} True se os dados forem válidos, false caso contrário.
     */
    validateUserData(userData) {
        if (!userData.nome || userData.nome.trim().length < 2) return false;
        if (!userData.sobrenome || userData.sobrenome.trim().length < 2) return false;
        if (!userData.email || !/^[^
        if (!userData.senha || userData.senha.length < 8) return false;
        return true;
    }

    /**
     * Gera um ID único para um novo usuário.
     * @returns {number} O próximo ID disponível para um usuário.
     */
    generateUserId() {
        const users = JSON.parse(localStorage.getItem("roxinho_usuarios") || "[]");
        return users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    }

    /**
     * Busca um usuário pelo seu endereço de e-mail.
     * @param {string} email - O e-mail do usuário a ser buscado.
     * @returns {Promise<object|undefined>} O objeto do usuário se encontrado, ou undefined.
     */
    async getUserByEmail(email) {
        const users = JSON.parse(localStorage.getItem("roxinho_usuarios") || "[]");
        return users.find(user => user.email === email.toLowerCase());
    }

    /**
     * Salva um novo usuário no localStorage.
     * @param {object} user - O objeto do usuário a ser salvo.
     */
    async saveUser(user) {
        const users = JSON.parse(localStorage.getItem("roxinho_usuarios") || "[]");
        users.push(user);
        localStorage.setItem("roxinho_usuarios", JSON.stringify(users));
    }

    /**
     * Atualiza um usuário existente no localStorage.
     * @param {object} updatedUser - O objeto do usuário com os dados atualizados.
     */
    async updateUser(updatedUser) {
        const users = JSON.parse(localStorage.getItem("roxinho_usuarios") || "[]");
        const index = users.findIndex(user => user.id === updatedUser.id);
        if (index !== -1) {
            users[index] = { ...users[index], ...updatedUser, data_atualizacao: new Date().toISOString() };
            localStorage.setItem("roxinho_usuarios", JSON.stringify(users));
        }
    }

    /**
     * Salva os dados da sessão atual (usuário e token) no localStorage.
     */
    saveSession() {
        const sessionData = {
            user: this.currentUser,
            token: this.sessionToken,
            timestamp: new Date().getTime()
        };
        localStorage.setItem("roxinho_session", JSON.stringify(sessionData));
    }

    /**
     * Limpa os dados da sessão do localStorage.
     */
    clearSession() {
        localStorage.removeItem("roxinho_session");
    }

    /**
     * Remove dados sensíveis (como o hash da senha) de um objeto de usuário.
     * @param {object} user - O objeto do usuário original.
     * @returns {object} Um novo objeto de usuário sem o hash da senha.
     */
    sanitizeUser(user) {
        const { senha_hash, ...sanitizedUser } = user;
        return sanitizedUser;
    }

    /**
     * Cria um usuário administrador padrão se não houver nenhum.
     * Este método é chamado na inicialização do sistema para garantir que sempre haja um admin.
     */
    async createDefaultAdmin() {
        const adminEmail = "admin@roxinhoshop.com";
        const existingAdmin = await this.getUserByEmail(adminEmail);
        
        if (!existingAdmin) {
            const adminData = {
                nome: "Administrador",
                sobrenome: "Roxinho Shop",
                email: adminEmail,
                senha: "admin123"
            };

            const hashedPassword = await this.hashPassword(adminData.senha);
            
            const adminUser = {
                id: this.generateUserId(),
                nome: adminData.nome,
                sobrenome: adminData.sobrenome,
                email: adminData.email,
                senha_hash: hashedPassword,
                telefone: null,
                data_nascimento: null,
                cpf: null,
                email_verificado: true,
                ativo: true,
                tipo_usuario: "admin",
                data_criacao: new Date().toISOString(),
                data_atualizacao: new Date().toISOString(),
                xp_total: 10000,
                nivel_atual: 10,
                titulo_nivel: "ROXINHO VIP"
            };

            await this.saveUser(adminUser);
            console.log("👑 Usuário administrador padrão criado:", adminEmail);
        }
    }

    /**
     * Exibe uma mensagem de notificação temporária para o usuário.
     * @param {string} message - A mensagem a ser exibida.
     * @param {("success"|"error"|"info"|"warning")} [type="info"] - O tipo da mensagem para estilização.
     */
    showMessage(message, type = "info") {
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
                }
                .auth-success { background: #d4edda; border-left: 4px solid #28a745; color: #155724; }
                .auth-error { background: #f8d7da; border-left: 4px solid #dc3545; color: #721c24; }
                .auth-warning { background: #fff3cd; border-left: 4px solid #ffc107; color: #856404; }
                .auth-info { background: #d1ecf1; border-left: 4px solid #17a2b8; color: #0c5460; }
                .auth-notification-content { display: flex; align-items: center; gap: 10px; }
                .auth-notification-text { flex: 1; }
                .auth-notification-close { background: none; border: none; font-size: 18px; cursor: pointer; opacity: 0.7; }
                .auth-notification-close:hover { opacity: 1; }
                @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Instanciar o sistema de autenticação globalmente
window.authSystem = new AuthSystem();

// Criar administrador padrão quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", async () => {
    await window.authSystem.createDefaultAdmin();
});

// Exportar para uso em outros arquivos
window.AuthSystem = AuthSystem;

console.log("🔐 Sistema de autenticação carregado");
