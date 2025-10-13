
// autenticacao.js - Sistema de Autenticação para Roxinho Shop

class AuthSystem {
    constructor() {
        this.init();
    }

    init() {
        // Carregar usuário do localStorage ao iniciar
        const jwtToken = localStorage.getItem("jwtToken");
        const userId = localStorage.getItem("userId");
        const userName = localStorage.getItem("userName");
        const userEmail = localStorage.getItem("userEmail");
        const isAdmin = localStorage.getItem("isAdmin") === "true";

        if (jwtToken && userId && userName && userEmail) {
            this.currentUser = {
                id: userId,
                nome: userName,
                email: userEmail,
                token: jwtToken,
                isAdmin: isAdmin
            };

        } else {
            this.currentUser = null;
        }
    }

    // Simula o login de um usuário
    async login(email, password) {
        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, senha: password }),
            });

            const data = await response.json();

            if (data.status === "success") {
                this.currentUser = {
                    id: data.user.id,
                    nome: data.user.nome,
                    email: data.user.email,
                    avatar: data.user.foto_perfil || "../recursos/imagens/default.png", // Usar foto_perfil do DB ou default
                    isAdmin: data.user.is_admin === 1 // Assumindo que o DB retorna 1 para admin
                };
                localStorage.setItem("jwtToken", data.token);
                localStorage.setItem("userId", data.user.id);
                localStorage.setItem("userName", data.user.nome);
                localStorage.setItem("userEmail", data.user.email);
                localStorage.setItem("isAdmin", data.user.is_admin === 1 ? "true" : "false");
                this.showMessage("Login realizado com sucesso!", "success");
                this.dispatchAuthChangeEvent();
                return { success: true, user: this.currentUser };
            } else {
                this.showMessage(data.message || "Erro desconhecido no login.", "error");
                return { success: false, error: data.message || "Erro desconhecido no login." };
            }
        } catch (error) {
            console.error("Erro na chamada da API de login:", error);
            this.showMessage("Erro de conexão com o servidor.", "error");
            return { success: false, error: "Erro de conexão com o servidor." };
        }
    }

    // Simula o logout de um usuário
    logout() {
        this.currentUser = null;
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("isAdmin");
        this.showMessage("Logout realizado com sucesso.", "info");
        this.dispatchAuthChangeEvent();
    }

    // Retorna o usuário atualmente logado
    getCurrentUser() {
        return this.currentUser;
    }

    // Verifica se o usuário está logado
    isLoggedIn() {
        return !!this.currentUser;
    }

    // Verifica se o usuário é administrador
    isAdmin() {
        return this.currentUser && this.currentUser.isAdmin;
    }

    // Exibe mensagens para o usuário usando o sistema de notificação pop-up
    showMessage(message, type = "info") {
        if (typeof showNotification === "function") {
            showNotification(message, type);
        } else {
            alert(message); // Fallback se showNotification não estiver disponível
        }
    }

    // Dispara um evento personalizado quando o estado de autenticação muda
    dispatchAuthChangeEvent() {
        const event = new Event("authChange");
        window.dispatchEvent(event);
    }

    // Método para fazer requisições autenticadas
    async authenticatedRequest(url, options = {}) {
        if (!this.isLoggedIn()) {
            this.showMessage("Você precisa estar logado para realizar esta ação.", "error");
            window.location.href = "entrar.html";
            return { status: "error", message: "Não autenticado." };
        }

        const token = localStorage.getItem("jwtToken");
        const headers = options.headers || {};

        // Se o body for FormData, não defina Content-Type, o navegador fará isso
        if (!(options.body instanceof FormData)) {
            headers["Content-Type"] = "application/json";
        }
        headers["Authorization"] = `Bearer ${token}`;

        try {
            const response = await fetch(url, {
                ...options,
                headers: headers,
            });

            if (response.status === 401 || response.status === 403) {
                this.logout();
                this.showMessage("Sessão expirada ou acesso negado. Faça login novamente.", "error");
                window.location.href = "entrar.html";
                return { status: "error", message: "Sessão expirada ou acesso negado." };
            }

            return await response.json();
        } catch (error) {
            console.error("Erro na requisição autenticada:", error);
            this.showMessage("Erro de conexão com o servidor.", "error");
            return { status: "error", message: "Erro de conexão com o servidor." };
        }
    }
}

// Expor a instância do AuthSystem globalmente
window.authSystem = new AuthSystem();


