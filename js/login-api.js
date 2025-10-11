/**
 * @file login-api.js
 * @description Script para página de login integrado com API backend
 */

document.addEventListener('DOMContentLoaded', function() {
    // Verificar se já está logado
    if (window.authAPI && window.authAPI.isAuthenticated()) {
        window.location.href = '/';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const submitButton = loginForm ? loginForm.querySelector('button[type="submit"]') : null;

    // Adicionar event listeners
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Adicionar validação em tempo real
    if (emailInput) {
        emailInput.addEventListener('blur', validateEmail);
        emailInput.addEventListener('input', clearFieldError);
    }

    if (senhaInput) {
        senhaInput.addEventListener('input', clearFieldError);
    }

    /**
     * Manipula o envio do formulário de login
     */
    async function handleLogin(event) {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        const email = emailInput.value.trim();
        const senha = senhaInput.value;

        // Desabilitar botão durante o processo
        setLoadingState(true);

        try {
            const result = await window.authAPI.loginUser(email, senha);

            if (result.success) {
                // Redirecionar após login bem-sucedido
                setTimeout(() => {
                    const redirectUrl = getRedirectUrl();
                    window.location.href = redirectUrl;
                }, 1500);
            }
        } catch (error) {
            console.error('Erro no login:', error);
            window.authAPI.showMessage('Erro inesperado. Tente novamente.', 'error');
        } finally {
            setLoadingState(false);
        }
    }

    /**
     * Valida o formulário completo
     */
    function validateForm() {
        let isValid = true;

        // Validar email
        if (!emailInput.value.trim()) {
            showFieldError(emailInput, 'Email é obrigatório');
            isValid = false;
        } else if (!isValidEmail(emailInput.value.trim())) {
            showFieldError(emailInput, 'Email inválido');
            isValid = false;
        }

        // Validar senha
        if (!senhaInput.value) {
            showFieldError(senhaInput, 'Senha é obrigatória');
            isValid = false;
        }

        return isValid;
    }

    /**
     * Valida email em tempo real
     */
    function validateEmail() {
        const email = emailInput.value.trim();
        
        if (email && !isValidEmail(email)) {
            showFieldError(emailInput, 'Email inválido');
        } else {
            clearFieldError(emailInput);
        }
    }

    /**
     * Verifica se o email é válido
     */
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Mostra erro em um campo específico
     */
    function showFieldError(field, message) {
        clearFieldError(field);
        
        field.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    }

    /**
     * Remove erro de um campo específico
     */
    function clearFieldError(field) {
        if (typeof field === 'object' && field.target) {
            field = field.target;
        }
        
        field.classList.remove('error');
        
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    /**
     * Define o estado de carregamento
     */
    function setLoadingState(loading) {
        if (submitButton) {
            submitButton.disabled = loading;
            submitButton.innerHTML = loading ? 
                '<i class="fas fa-spinner fa-spin"></i> Entrando...' : 
                'Entrar';
        }

        // Desabilitar campos durante carregamento
        if (emailInput) emailInput.disabled = loading;
        if (senhaInput) senhaInput.disabled = loading;
    }

    /**
     * Obtém a URL de redirecionamento
     */
    function getRedirectUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect');
        
        if (redirect && redirect.startsWith('/')) {
            return redirect;
        }
        
        return '/';
    }

    /**
     * Adiciona funcionalidade de "Esqueci minha senha"
     */
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.authAPI.showMessage('Funcionalidade em desenvolvimento. Entre em contato com o suporte.', 'info');
        });
    }

    /**
     * Adiciona funcionalidade de login social (placeholder)
     */
    const socialLoginButtons = document.querySelectorAll('.social-login-btn');
    socialLoginButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            window.authAPI.showMessage('Login social em desenvolvimento.', 'info');
        });
    });

    // Adicionar estilos para validação de campos
    if (!document.getElementById('login-validation-styles')) {
        const styles = document.createElement('style');
        styles.id = 'login-validation-styles';
        styles.textContent = `
            .form-group input.error {
                border-color: #dc3545;
                box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
            }
            
            .field-error {
                color: #dc3545;
                font-size: 0.875rem;
                margin-top: 0.25rem;
                display: block;
            }
            
            .form-group {
                margin-bottom: 1rem;
            }
            
            .btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            
            .fa-spinner {
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(styles);
    }

    console.log('✅ Sistema de login API inicializado');
});

// Função global para login rápido (para testes)
window.quickLogin = function(email = 'admin@roxinhoshop.com', senha = 'admin123') {
    if (window.authAPI) {
        window.authAPI.loginUser(email, senha);
    }
};
