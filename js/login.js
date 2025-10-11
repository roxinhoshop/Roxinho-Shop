document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("senha");
    const loginButton = document.getElementById("botaoLogin");
    const twoFactorAuthSection = document.getElementById("two-factor-auth-section");
    const twoFactorCodeInput = document.getElementById("twoFactorCode");
    const resendTwoFactorCodeBtn = document.getElementById("resendTwoFactorCode");
    let currentLoginEmail = "";

    // Função para exibir notificações (simplificada para este contexto)
    function mostrarNotificacao(message, type) {
        console.log(`Notificação (${type}): ${message}`);
        // Implementação real pode usar um elemento HTML para exibir a notificação
        alert(message);
    }

    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const email = emailInput.value;
        const senha = passwordInput.value;

        // Se a seção 2FA estiver visível, significa que o usuário já inseriu e-mail/senha e agora precisa do código 2FA
        if (twoFactorAuthSection.style.display === "block") {
            const twoFactorCode = twoFactorCodeInput.value;
            if (!twoFactorCode) {
                mostrarNotificacao("Por favor, insira o código 2FA.", "erro");
                return;
            }
            
            // Enviar código 2FA para verificação
            try {
                const response = await fetch("/php/api.php/auth/verify-2fa-code", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: currentLoginEmail, code: twoFactorCode })
                });
                const result = await response.json();

                if (result.success) {
                    localStorage.setItem("user_id", result.user.id);
                    localStorage.setItem("user_name", result.user.nome);
                    localStorage.setItem("user_email", result.user.email);
                    mostrarNotificacao("Login bem-sucedido com 2FA!", "sucesso");
                    window.location.href = "index.html"; // Redirecionar para a página inicial
                } else {
                    mostrarNotificacao(result.error || "Código 2FA inválido ou expirado.", "erro");
                }
            } catch (error) {
                console.error("Erro ao verificar código 2FA:", error);
                mostrarNotificacao("Erro de rede ao verificar código 2FA.", "erro");
            }
            return;
        }

        // Lógica de login inicial (sem 2FA)
        try {
            const response = await fetch("/php/api.php/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, senha })
            });
            const result = await response.json();

            if (result.two_factor_required) {
                mostrarNotificacao(result.message, "info");
                twoFactorAuthSection.style.display = "block";
                currentLoginEmail = email; // Armazenar e-mail para reenviar código 2FA
                emailInput.readOnly = true; // Impedir alteração de e-mail
                passwordInput.readOnly = true; // Impedir alteração de senha
                twoFactorCodeInput.focus();
            } else if (result.message === "Login bem-sucedido") {
                localStorage.setItem("user_id", result.user.id);
                localStorage.setItem("user_name", result.user.nome);
                localStorage.setItem("user_email", result.user.email);
                mostrarNotificacao("Login bem-sucedido!", "sucesso");
                window.location.href = "index.html"; // Redirecionar para a página inicial
            } else {
                mostrarNotificacao(result.error || "Erro ao fazer login.", "erro");
            }
        } catch (error) {
            console.error("Erro de rede:", error);
            mostrarNotificacao("Erro de rede ao tentar fazer login.", "erro");
        }
    });

    // Reenviar código 2FA
    if (resendTwoFactorCodeBtn) {
        resendTwoFactorCodeBtn.addEventListener("click", async function() {
            if (!currentLoginEmail) {
                mostrarNotificacao("Nenhum e-mail para reenviar o código.", "erro");
                return;
            }

            try {
                const response = await fetch("/php/api.php/auth/send-2fa-code", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: currentLoginEmail })
                });
                const result = await response.json();

                if (result.success) {
                    mostrarNotificacao(result.message, "info");
                } else {
                    mostrarNotificacao(result.error || "Erro ao reenviar código 2FA.", "erro");
                }
            } catch (error) {
                console.error("Erro ao reenviar código 2FA:", error);
                mostrarNotificacao("Erro de rede ao reenviar código 2FA.", "erro");
            }
        });
    }

    // Função para alternar visibilidade da senha (já existente, apenas garantindo que esteja aqui)
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

