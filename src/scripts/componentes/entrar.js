/**
 * Sistema de Login Melhorado
 * Com mensagens interativas e redirecionamento inteligente
 */

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("senha");
    const loginButton = document.getElementById("botaoLogin");

    // Verificar se já está logado
    const token = localStorage.getItem("jwtToken");
    if (token) {
        // Já está logado, redirecionar para home
        if (typeof showNotification === 'function') {
            showNotification("Você já está logado!", "info");
        }
        setTimeout(() => {
            window.location.href = "../../index.html";
        }, 1000);
        return;
    }

    // Verificar se há redirecionamento pendente
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirect');

    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const email = emailInput.value.trim();
        const senha = passwordInput.value;

        // Validação básica
        if (!email || !senha) {
            if (typeof showNotification === 'function') {
                showNotification("⚠️ Por favor, preencha todos os campos.", "warning");
            } else {
                alert("Por favor, preencha todos os campos.");
            }
            return;
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            if (typeof showNotification === 'function') {
                showNotification("⚠️ Por favor, insira um e-mail válido.", "warning");
            } else {
                alert("Por favor, insira um e-mail válido.");
            }
            return;
        }

        // Adicionar loading no botão
        if (typeof addButtonLoading === 'function') {
            addButtonLoading(loginButton);
        } else {
            loginButton.disabled = true;
            loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
        }

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
                localStorage.setItem("token", result.token); // Alias
                localStorage.setItem("userId", tokenPayload.userId);
                localStorage.setItem("userEmail", tokenPayload.email);
                localStorage.setItem("isAdmin", tokenPayload.isAdmin ? "true" : "false");
                
                // Se não tiver o primeiro nome salvo, extrair do email
                if (!localStorage.getItem("userFirstName")) {
                    const userName = tokenPayload.email.split('@')[0];
                    localStorage.setItem("userFirstName", userName);
                }
                
                // Disparar evento de mudança de autenticação
                window.dispatchEvent(new Event("authChange"));
                
                // Preparar mensagem de boas-vindas
                const userName = tokenPayload.email.split('@')[0];
                const userType = tokenPayload.isAdmin ? "Administrador" : "Usuário";
                
                // Determinar URL de redirecionamento
                let targetUrl = "../../index.html";
                if (redirectUrl) {
                    targetUrl = decodeURIComponent(redirectUrl);
                }
                
                // Mostrar mensagem de sucesso
                if (typeof showNotification === 'function') {
                    showNotification(
                        `✅ Login realizado com sucesso!\n👋 Bem-vindo, ${userName}!`,
                        "success"
                    );
                }
                
                // Animação de sucesso se disponível
                if (typeof showSuccessAnimation === 'function') {
                    showSuccessAnimation(
                        "🎉 Login Realizado!",
                        `Bem-vindo, ${userName}! (${userType})`,
                        targetUrl,
                        1500
                    );
                } else {
                    // Redirecionar após 1.5 segundos
                    setTimeout(() => {
                        window.location.href = targetUrl;
                    }, 1500);
                }
            } else {
                // Erro no login
                if (typeof removeButtonLoading === 'function') {
                    removeButtonLoading(loginButton);
                } else {
                    loginButton.disabled = false;
                    loginButton.innerHTML = '<span>Entrar</span>';
                }
                
                // Mensagens de erro específicas
                let errorMessage = "❌ Erro ao fazer login.";
                
                if (result.message) {
                    if (result.message.includes("não encontrado") || result.message.includes("não existe")) {
                        errorMessage = "❌ E-mail não cadastrado. Deseja criar uma conta?";
                    } else if (result.message.includes("senha") || result.message.includes("incorreta")) {
                        errorMessage = "❌ Senha incorreta. Tente novamente.";
                    } else if (result.message.includes("verificado")) {
                        errorMessage = "⚠️ Por favor, verifique seu e-mail antes de fazer login.";
                    } else {
                        errorMessage = `❌ ${result.message}`;
                    }
                }
                
                if (typeof showNotification === 'function') {
                    showNotification(errorMessage, "error");
                } else {
                    alert(errorMessage);
                }
                
                // Limpar senha
                passwordInput.value = "";
                passwordInput.focus();
            }
        } catch (error) {
            // Erro de conexão
            if (typeof removeButtonLoading === 'function') {
                removeButtonLoading(loginButton);
            } else {
                loginButton.disabled = false;
                loginButton.innerHTML = '<span>Entrar</span>';
            }
            
            console.error("Erro de rede:", error);
            
            if (typeof showNotification === 'function') {
                showNotification(
                    "🔌 Erro de conexão. Verifique sua internet e tente novamente.",
                    "error"
                );
            } else {
                alert("Erro de conexão. Tente novamente mais tarde.");
            }
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

    // Adicionar feedback visual nos inputs
    [emailInput, passwordInput].forEach(input => {
        if (!input) return;
        
        input.addEventListener('focus', function() {
            this.closest('.form-group').classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.closest('.form-group').classList.remove('focused');
            }
        });
        
        input.addEventListener('input', function() {
            if (this.value) {
                this.closest('.form-group').classList.add('has-value');
            } else {
                this.closest('.form-group').classList.remove('has-value');
            }
        });
    });
});

