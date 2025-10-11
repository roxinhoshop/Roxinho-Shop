
// auth.js - Sistema de Autenticação para Roxinho Shop

class AuthSystem {
    constructor() {
        this.init();
    }

    init() {
        // Carregar usuário do localStorage ao iniciar
        this.currentUser = JSON.parse(localStorage.getItem("currentUser"));
        console.log("AuthSystem inicializado. Usuário atual:", this.currentUser);
    }

    // Simula o login de um usuário
    async login(email, password) {
        try {
            console.log("AuthSystem: Tentando login com:", { email, password });
            const response = await fetch("php/api.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ action: "auth", sub_action: "login", email, senha: password }),
            });

            console.log("AuthSystem: Resposta da API de login (status):");
            const data = await response.json();
            console.log("AuthSystem: Resposta da API de login (dados):");

            if (data.success) {
                this.currentUser = {
                    id: data.user.id,
                    nome: data.user.nome,
                    email: data.user.email,
                    avatar: data.user.foto_perfil || "imagens/default.png", // Usar foto_perfil do DB ou default
                    isAdmin: data.user.is_admin === 1 // Assumindo que o DB retorna 1 para admin
                };
                localStorage.setItem("currentUser", JSON.stringify(this.currentUser));
                this.showMessage("Login realizado com sucesso!", "success");
                this.dispatchAuthChangeEvent();
                return { success: true, user: this.currentUser };
            } else {
                this.showMessage(data.message || "Erro desconhecido no login.", "error");
                return { success: false, error: data.message || "Erro desconhecido no login." };
            }
        } catch (error) {
            console.error("Erro na chamada da API de login:", error);
            return { success: false, error: "Erro de conexão com o servidor." };
        }
    }

    // Simula o logout de um usuário
    logout() {
        this.currentUser = null;
        localStorage.removeItem("currentUser");
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
    requireAdmin() {
        if (this.currentUser && this.currentUser.isAdmin) {
            return true;
        } else {
            this.showMessage("Acesso negado. Você não tem permissão de administrador.", "error");
            // Redirecionar para a página inicial ou de login, se necessário
            // window.location.href = "index.html";
            return false;
        }
    }

    // Exibe mensagens para o usuário (pode ser substituído por um sistema de notificação real)
    showMessage(message, type = "info") {
        console.log(`[${type.toUpperCase()}] ${message}`);
        // Implementação de UI para mostrar mensagens pode ser adicionada aqui
        // Ex: um toast, um alert, etc.
        const notificationArea = document.getElementById("notification-area");
        if (notificationArea) {
            notificationArea.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
            setTimeout(() => {
                notificationArea.innerHTML = "";
            }, 3000);
        } else {
            alert(message);
        }
    }

    // Dispara um evento personalizado quando o estado de autenticação muda
    dispatchAuthChangeEvent() {
        const event = new Event("authChange");
        window.dispatchEvent(event);
    }
}

// Expor a instância do AuthSystem globalmente
window.authSystem = new AuthSystem();

