document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("senha");
    const loginButton = document.getElementById("botaoLogin");

    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const email = emailInput.value;
        const senha = passwordInput.value;

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
                
                localStorage.setItem("jwtToken", result.token);
                localStorage.setItem("userId", tokenPayload.userId);
                localStorage.setItem("userEmail", tokenPayload.email);
                localStorage.setItem("isAdmin", tokenPayload.isAdmin ? "true" : "false");
                
                showNotification("Login bem-sucedido!", "success");
                
                // Disparar evento de mudança de autenticação
                window.dispatchEvent(new Event("authChange"));
                
                // Redirecionar para a página inicial
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1000);
            } else {
                showNotification(result.message || "Erro ao fazer login.", "error");
            }
        } catch (error) {
            console.error("Erro de rede:", error);
            showNotification("Erro de rede ao tentar fazer login.", "error");
        }
    });

    // Função para alternar visibilidade da senha
    window.togglePasswordVisibility = function(fieldId) {
        const field = document.getElementById(fieldId);
        const icon = field.closest(".form-group").querySelector(".toggle-password i");
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

