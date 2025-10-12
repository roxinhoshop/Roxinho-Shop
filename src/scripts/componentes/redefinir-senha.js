document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get("token");

    const requestForm = document.getElementById("formularioEsqueceuSenha");
    const resetForm = document.getElementById("resetPasswordForm");

    const showMessage = (message, type) => {
        const msgDiv = document.getElementById(`mensagem-${type === \'sucesso\' ? \'sucesso\' : \'erro\'}`);
        if (msgDiv) {
            msgDiv.textContent = message;
            msgDiv.style.display = \'block\';
            setTimeout(() => {
                msgDiv.style.display = \'none\';
            }, 5000);
        }
    };

    if (resetToken) {
        // Modo de redefinição de senha
        if (requestForm) requestForm.style.display = \'none\';
        if (resetForm) resetForm.style.display = \'block\';

        resetForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const newPassword = document.getElementById("newPassword").value;
            const confirmNewPassword = document.getElementById("confirmNewPassword").value;

            if (newPassword !== confirmNewPassword) {
                showMessage("As senhas não coincidem.", "erro");
                return;
            }
            if (newPassword.length < 6) {
                showMessage("A nova senha deve ter pelo menos 6 caracteres.", "erro");
                return;
            }

            try {
                const response = await fetch("/php/api.php/auth/reset-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token: resetToken, new_password: newPassword })
                });
                const result = await response.json();

                if (result.success) {
                    showMessage(result.message + " Você será redirecionado para a página de login.", "sucesso");
                    setTimeout(() => {
                        window.location.href = "entrar.html";
                    }, 3000);
                } else {
                    showMessage(result.error || "Erro ao redefinir senha.", "erro");
                }
            } catch (error) {
                console.error("Erro de rede ao redefinir senha:", error);
                showMessage("Erro de rede ao redefinir senha.", "erro");
            }
        });

    } else {
        // Modo de solicitação de redefinição de senha
        if (requestForm) requestForm.style.display = \'block\';
        if (resetForm) resetForm.style.display = \'none\';

        requestForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value;

            if (!email) {
                showMessage("Por favor, insira seu e-mail.", "erro");
                return;
            }

            try {
                const response = await fetch("/php/api.php/auth/request-password-reset", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: email })
                });
                const result = await response.json();

                if (result.success) {
                    showMessage(result.message, "sucesso");
                } else {
                    showMessage(result.error || "Erro ao solicitar redefinição de senha.", "erro");
                }
            } catch (error) {
                console.error("Erro de rede ao solicitar redefinição de senha:", error);
                showMessage("Erro de rede ao solicitar redefinição de senha.", "erro");
            }
        });
    }
});
