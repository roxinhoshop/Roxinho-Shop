/**
 */

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("senha");
    const loginButton = document.getElementById("botaoLogin");

    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const email = emailInput.value.trim();
        const senha = passwordInput.value;

        // Validação básica
        if (!email || !senha) {
            showNotification("Por favor, preencha todos os campos.", "error");
            return;
        }

        // Adicionar loading no botão
        addButtonLoading(loginButton);

        try {
            const response = await fetch("https://roxinho-shop-backend.vercel.app/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, senha })
            });
            
            const result = await response.json();

            if (result.token) {
                // Decodificar o token JWT para obter informações do usuário
                const tokenPayload = JSON.parse(atob(result.token.split('.')[1]));
                
                // Salvar dados no localStorage
                localStorage.setItem("jwtToken", result.token);
                localStorage.setItem("userId", tokenPayload.userId);
                localStorage.setItem("userEmail", tokenPayload.email);
                localStorage.setItem("isAdmin", tokenPayload.isAdmin ? "true" : "false");
                
                // Disparar evento de mudança de autenticação
                window.dispatchEvent(new Event("authChange"));
                
                // Redirecionar para página inicial
                const userName = tokenPayload.email.split('@')[0];
                const userType = tokenPayload.isAdmin ? "Administrador" : "Usuário";
                
                // Mostrar animação de sucesso e redirecionar para home
                if (typeof showSuccessAnimation === 'function') {
                    showSuccessAnimation(
                        "Login Realizado!",
                        `Bem-vindo, ${userName}!`,
                        "index.html",
                        2000
                    );
                } else {
                    showNotification(`Login bem-sucedido! Bem-vindo!`, "success");
                    setTimeout(() => {
                        window.location.href = "../../index.html";
                    }, 1000);
                }
            } else {
                // Remover loading do botão
                removeButtonLoading(loginButton);
                showNotification(result.message || "Erro ao fazer login. Verifique suas credenciais.", "error");
            }
        } catch (error) {
            // Remover loading do botão
            removeButtonLoading(loginButton);
            console.error("Erro de rede:", error);
            showNotification("Erro de conexão. Tente novamente mais tarde.", "error");
        }
    });

    // Função para alternar visibilidade da senha
    window.togglePasswordVisibility = function(fieldId) {
        const field = document.getElementById(fieldId);
        const icon = field.closest(".form-group").querySelector(".toggle-password i");
        
        if (!field || !icon) return;
        
        if (field.type === "password") {
            field.type = "text";
            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");
        } else {
            field.type = "password";
            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");
        }
    };
});

