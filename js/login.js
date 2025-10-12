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
            const response = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, senha })
            });
            const result = await response.json();

            if (result.status === "success") {
                localStorage.setItem("token", result.token);
                localStorage.setItem("user_id", result.user.id);
                localStorage.setItem("user_name", result.user.nome);
                localStorage.setItem("user_email", result.user.email);
                showNotification("Login bem-sucedido!", "success");
                window.location.href = "index.html"; // Redirecionar para a página inicial
            } else {
                showNotification(result.message || "Erro ao fazer login.", "error");
            }
        } catch (error) {
            console.error("Erro de rede:", error);
            showNotification("Erro de rede ao tentar fazer login.", "error");
        }
    });

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

