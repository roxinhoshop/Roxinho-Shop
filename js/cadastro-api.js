/**
 * @file cadastro-api.js
 * @description Script para página de cadastro integrado com API backend
 */

document.addEventListener('DOMContentLoaded', function() {
    // Verificar se já está logado
    if (window.authAPI && window.authAPI.isAuthenticated()) {
        window.location.href = '/';
        return;
    }

    const cadastroForm = document.getElementById('cadastroForm');
    const nomeInput = document.getElementById('nome');
    const sobrenomeInput = document.getElementById('sobrenome');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const confirmarSenhaInput = document.getElementById('confirmarSenha');
    const telefoneInput = document.getElementById('telefone');
    const dataNascimentoInput = document.getElementById('dataNascimento');
    const cpfInput = document.getElementById('cpf');
    const submitButton = cadastroForm ? cadastroForm.querySelector('button[type="submit"]') : null;

    // Adicionar event listeners
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', handleCadastro);
    }

    // Validação em tempo real
    if (nomeInput) {
        nomeInput.addEventListener('blur', () => validateField(nomeInput, 'nome'));
        nomeInput.addEventListener('input', () => clearFieldError(nomeInput));
    }

    if (sobrenomeInput) {
        sobrenomeInput.addEventListener('blur', () => validateField(sobrenomeInput, 'sobrenome'));
        sobrenomeInput.addEventListener('input', () => clearFieldError(sobrenomeInput));
    }

    if (emailInput) {
        emailInput.addEventListener('blur', () => validateField(emailInput, 'email'));
        emailInput.addEventListener('input', () => clearFieldError(emailInput));
    }

    if (senhaInput) {
        senhaInput.addEventListener('blur', () => validateField(senhaInput, 'senha'));
        senhaInput.addEventListener('input', () => {
            clearFieldError(senhaInput);
            if (confirmarSenhaInput && confirmarSenhaInput.value) {
                validateField(confirmarSenhaInput, 'confirmarSenha');
            }
        });
    }

    if (confirmarSenhaInput) {
        confirmarSenhaInput.addEventListener('blur', () => validateField(confirmarSenhaInput, 'confirmarSenha'));
        confirmarSenhaInput.addEventListener('input', () => clearFieldError(confirmarSenhaInput));
    }

    if (telefoneInput) {
        telefoneInput.addEventListener('input', formatTelefone);
    }

    if (cpfInput) {
        cpfInput.addEventListener('input', formatCPF);
    }

    /**
     * Manipula o envio do formulário de cadastro
     */
    async function handleCadastro(event) {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        const userData = {
            nome: nomeInput.value.trim(),
            sobrenome: sobrenomeInput.value.trim(),
            email: emailInput.value.trim().toLowerCase(),
            senha: senhaInput.value,
            telefone: telefoneInput ? telefoneInput.value.trim() : null,
            data_nascimento: dataNascimentoInput ? dataNascimentoInput.value : null,
            cpf: cpfInput ? cpfInput.value.replace(/\D/g, '') : null
        };

        // Desabilitar botão durante o processo
        setLoadingState(true);

        try {
            const result = await window.authAPI.registerUser(userData);

            if (result.success) {
                // Limpar formulário
                cadastroForm.reset();
                
                // Redirecionar para login após cadastro bem-sucedido
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }
        } catch (error) {
            console.error('Erro no cadastro:', error);
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

        // Validar todos os campos obrigatórios
        const fieldsToValidate = [
            { input: nomeInput, type: 'nome' },
            { input: sobrenomeInput, type: 'sobrenome' },
            { input: emailInput, type: 'email' },
            { input: senhaInput, type: 'senha' },
            { input: confirmarSenhaInput, type: 'confirmarSenha' }
        ];

        fieldsToValidate.forEach(field => {
            if (field.input && !validateField(field.input, field.type)) {
                isValid = false;
            }
        });

        return isValid;
    }

    /**
     * Valida um campo específico
     */
    function validateField(field, type) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (type) {
            case 'nome':
            case 'sobrenome':
                if (!value) {
                    errorMessage = `${type.charAt(0).toUpperCase() + type.slice(1)} é obrigatório`;
                    isValid = false;
                } else if (value.length < 2) {
                    errorMessage = `${type.charAt(0).toUpperCase() + type.slice(1)} deve ter pelo menos 2 caracteres`;
                    isValid = false;
                }
                break;

            case 'email':
                if (!value) {
                    errorMessage = 'Email é obrigatório';
                    isValid = false;
                } else if (!isValidEmail(value)) {
                    errorMessage = 'Email inválido';
                    isValid = false;
                }
                break;

            case 'senha':
                if (!value) {
                    errorMessage = 'Senha é obrigatória';
                    isValid = false;
                } else if (value.length < 8) {
                    errorMessage = 'Senha deve ter pelo menos 8 caracteres';
                    isValid = false;
                } else if (!isStrongPassword(value)) {
                    errorMessage = 'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número';
                    isValid = false;
                }
                break;

            case 'confirmarSenha':
                if (!value) {
                    errorMessage = 'Confirmação de senha é obrigatória';
                    isValid = false;
                } else if (value !== senhaInput.value) {
                    errorMessage = 'Senhas não coincidem';
                    isValid = false;
                }
                break;
        }

        if (!isValid) {
            showFieldError(field, errorMessage);
        } else {
            clearFieldError(field);
        }

        return isValid;
    }

    /**
     * Verifica se o email é válido
     */
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Verifica se a senha é forte
     */
    function isStrongPassword(password) {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        return hasUpperCase && hasLowerCase && hasNumbers;
    }

    /**
     * Formata o telefone
     */
    function formatTelefone(event) {
        let value = event.target.value.replace(/\D/g, '');
        
        if (value.length <= 11) {
            if (value.length <= 10) {
                value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
            } else {
                value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            }
        }
        
        event.target.value = value;
    }

    /**
     * Formata o CPF
     */
    function formatCPF(event) {
        let value = event.target.value.replace(/\D/g, '');
        
        if (value.length <= 11) {
            value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
        
        event.target.value = value;
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
                '<i class="fas fa-spinner fa-spin"></i> Cadastrando...' : 
                'Criar Conta';
        }

        // Desabilitar todos os campos durante carregamento
        const allInputs = cadastroForm.querySelectorAll('input');
        allInputs.forEach(input => {
            input.disabled = loading;
        });
    }

    /**
     * Adiciona indicador de força da senha
     */
    if (senhaInput) {
        const strengthIndicator = document.createElement('div');
        strengthIndicator.className = 'password-strength';
        strengthIndicator.innerHTML = `
            <div class="strength-bar">
                <div class="strength-fill"></div>
            </div>
            <div class="strength-text">Digite uma senha</div>
        `;
        senhaInput.parentNode.appendChild(strengthIndicator);

        senhaInput.addEventListener('input', function() {
            updatePasswordStrength(this.value, strengthIndicator);
        });
    }

    /**
     * Atualiza o indicador de força da senha
     */
    function updatePasswordStrength(password, indicator) {
        const strengthFill = indicator.querySelector('.strength-fill');
        const strengthText = indicator.querySelector('.strength-text');
        
        let strength = 0;
        let text = 'Muito fraca';
        let color = '#dc3545';

        if (password.length >= 8) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;

        switch (strength) {
            case 0:
            case 1:
                text = 'Muito fraca';
                color = '#dc3545';
                break;
            case 2:
                text = 'Fraca';
                color = '#fd7e14';
                break;
            case 3:
                text = 'Média';
                color = '#ffc107';
                break;
            case 4:
                text = 'Forte';
                color = '#20c997';
                break;
            case 5:
                text = 'Muito forte';
                color = '#28a745';
                break;
        }

        strengthFill.style.width = `${(strength / 5) * 100}%`;
        strengthFill.style.backgroundColor = color;
        strengthText.textContent = text;
        strengthText.style.color = color;
    }

    // Adicionar estilos para validação e indicador de senha
    if (!document.getElementById('cadastro-validation-styles')) {
        const styles = document.createElement('style');
        styles.id = 'cadastro-validation-styles';
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
            
            .password-strength {
                margin-top: 0.5rem;
            }
            
            .strength-bar {
                height: 4px;
                background-color: #e9ecef;
                border-radius: 2px;
                overflow: hidden;
            }
            
            .strength-fill {
                height: 100%;
                width: 0%;
                background-color: #dc3545;
                transition: all 0.3s ease;
            }
            
            .strength-text {
                font-size: 0.75rem;
                margin-top: 0.25rem;
                font-weight: 500;
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

    console.log('✅ Sistema de cadastro API inicializado');
});
