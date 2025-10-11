/**
 * @file cadastro.js
 * @description Script para gerenciar a lógica de cadastro na página de cadastro da Roxinho Shop.
 */

document.addEventListener("DOMContentLoaded", () => {
    const cadastroForm = document.getElementById("cadastroForm");
    if (!cadastroForm) return;

    const nomeInput = document.getElementById("nome");
    const sobrenomeInput = document.getElementById("sobrenome");
    const emailInput = document.getElementById("email");
    const telefoneInput = document.getElementById("telefone");
    const dataNascimentoInput = document.getElementById("dataNascimento");
    const senhaInput = document.getElementById("senha");
    const confirmarSenhaInput = document.getElementById("confirmarSenha");
    const termosCheckbox = document.getElementById("termos");
    const botaoCadastro = document.getElementById("botaoCadastro");

    // Elementos de feedback de senha
    const progressoSenha = document.getElementById("progresso-senha");
    const nivelSenha = document.getElementById("nivel-senha");
    const avisoSenhaCurta = document.getElementById("aviso-senha-curta");

    // Adicionar event listeners para validação em tempo real
    nomeInput.addEventListener("input", () => validarCampo(nomeInput, "Nome é obrigatório.", "Nome deve ter pelo menos 2 caracteres.", /^[a-zA-Záàâãéèêíïóôõöúçñ\s]+$/i, "Nome deve conter apenas letras."));
    sobrenomeInput.addEventListener("input", () => validarCampo(sobrenomeInput, "Sobrenome é obrigatório.", "Sobrenome deve ter pelo menos 2 caracteres.", /^[a-zA-Záàâãéèêíïóôõöúçñ\s]+$/i, "Sobrenome deve conter apenas letras."));
    emailInput.addEventListener("input", () => validarCampo(emailInput, "E-mail é obrigatório.", null, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, "E-mail inválido."));
        telefoneInput.addEventListener("input", () => validarCampo(telefoneInput, "Telefone é obrigatório.", "Telefone inválido.", /^\d{10,11}$/, "Telefone inválido."));
    dataNascimentoInput.addEventListener("change", validarDataNascimento);
    senhaInput.addEventListener("input", () => {
        validarCampo(senhaInput, "Senha é obrigatória.", "A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais.", /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais.", 8);
        verificarForcaSenha();
        if (confirmarSenhaInput.value) validarConfirmacaoSenha();
    });
    confirmarSenhaInput.addEventListener("input", validarConfirmacaoSenha);
    termosCheckbox.addEventListener("change", validarTermos);

    function validarCampo(inputElement, msgObrigatorio, msgMinLength, regex, msgRegex, minLength = 0) {
        const id = inputElement.id;
        const value = inputElement.value.trim();
        let valido = true;

        if (!value) {
            mostrarErro(id, msgObrigatorio);
            valido = false;
        } else if (minLength > 0 && value.length < minLength) {
            mostrarErro(id, msgMinLength);
            valido = false;
        } else if (regex && !regex.test(value)) {
            mostrarErro(id, msgRegex);
            valido = false;
        } else {
            limparErro(id);
        }
        return valido;
    }

    function validarDataNascimento() {
        const dataNascimento = new Date(dataNascimentoInput.value);
        const hoje = new Date();
        let idade = hoje.getFullYear() - dataNascimento.getFullYear();
        const m = hoje.getMonth() - dataNascimento.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < dataNascimento.getDate())) {
            idade--;
        }
        if (isNaN(dataNascimento.getTime()) || !dataNascimentoInput.value) {
            mostrarErro("dataNascimento", "Data de Nascimento é obrigatória.");
            return false;
        } else if (idade < 18) {
            mostrarErro("dataNascimento", "Você deve ser maior de 18 anos para se cadastrar.");
            return false;
        } else {
            limparErro("dataNascimento");
            return true;
        }
    }

    function validarConfirmacaoSenha() {
        const senha = senhaInput.value;
        const confirmacao = confirmarSenhaInput.value;
        if (!confirmacao) {
            mostrarErro("confirmarSenha", "Confirmação de senha é obrigatória.");
            return false;
        } else if (senha !== confirmacao) {
            mostrarErro("confirmarSenha", "As senhas não coincidem.");
            return false;
        } else {
            limparErro("confirmarSenha");
            return true;
        }
    }

    function validarTermos() {
        if (!termosCheckbox.checked) {
            mostrarErro("termos", "Você deve aceitar os termos e condições.");
            return false;
        } else {
            limparErro("termos");
            return true;
        }
    }

    function verificarForcaSenha() {
        const senha = senhaInput.value;
        let forca = 0;
        let nivel = "";
        let cor = "";

        // Critérios de força
        const temMinuscula = /[a-z]/.test(senha);
        const temMaiuscula = /[A-Z]/.test(senha);
        const temNumero = /[0-9]/.test(senha);
        const temEspecial = /[^a-zA-Z0-9]/.test(senha);

        // Pontuação baseada no comprimento
        if (senha.length >= 8) forca += 20;
        if (senha.length >= 12) forca += 20;

        // Pontuação baseada na variedade de caracteres
        let tiposCaracteres = 0;
        if (temMinuscula) tiposCaracteres++;
        if (temMaiuscula) tiposCaracteres++;
        if (temNumero) tiposCaracteres++;
        if (temEspecial) tiposCaracteres++;

        if (tiposCaracteres >= 3) forca += 30;
        if (tiposCaracteres >= 4) forca += 30;

        // Ajustar forca máxima para 100
        forca = Math.min(forca, 100);

        // Definir nível e cor
        if (senha.length === 0) {
            nivel = "";
            cor = "";
            forca = 0;
        } else if (forca < 40) {
            nivel = "Fraca";
            cor = "#ef4444"; // Vermelho
        } else if (forca < 70) {
            nivel = "Média";
            cor = "#f59e0b"; // Laranja
        } else {
            nivel = "Forte";
            cor = "#10b981"; // Verde
        }

        // Atualizar UI
        if (progressoSenha) {
            progressoSenha.style.width = forca + "%";
            progressoSenha.style.backgroundColor = cor;
            progressoSenha.className = `progresso-forca-senha ${nivel.toLowerCase()}`;
        }

        if (nivelSenha) {
            nivelSenha.textContent = nivel;
            nivelSenha.className = `nivel-forca ${nivel.toLowerCase()}`;
        }

        if (avisoSenhaCurta) {
            if (senha.length > 0 && senha.length < 8) {
                avisoSenhaCurta.style.display = "flex";
            } else {
                avisoSenhaCurta.style.display = "none";
            }
        }

        // Exibir/ocultar o indicador de força da senha
        const indicadorSenhaContainer = document.getElementById("indicador-senha-container");
        if (indicadorSenhaContainer) {
            if (senha.length > 0) {
                indicadorSenhaContainer.classList.add("visivel");
            } else {
                indicadorSenhaContainer.classList.remove("visivel");
            }
        }
    }

    cadastroForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!validarFormularioCompleto()) return;

        const data = {
            nome: nomeInput.value,
            sobrenome: sobrenomeInput.value,
            email: emailInput.value,
            telefone: telefoneInput.value,
            data_nascimento: dataNascimentoInput.value,
            senha: senhaInput.value
        };

        try {
            const response = await fetch("/php/api.php/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                alert("Cadastro realizado com sucesso! Verifique seu e-mail para ativar sua conta.");
                window.location.href = "login.html";
            } else {
                    console.error(`Erro: ${result.error}`);
            }
        } catch (error) {
            console.error("Erro ao cadastrar:", error);
            alert("Ocorreu um erro. Tente novamente.");
        }
    });

    function validarFormularioCompleto() {
        let isValid = true;
        let nomeValido = validarCampo(nomeInput, "Nome é obrigatório.", "Nome deve ter pelo menos 2 caracteres.", /^[a-zA-Záàâãéèêíïóôõöúçñ\s]+$/i, "Nome deve conter apenas letras.");
        let sobrenomeValido = validarCampo(sobrenomeInput, "Sobrenome é obrigatório.", "Sobrenome deve ter pelo menos 2 caracteres.", /^[a-zA-Záàâãéèêíïóôõöúçñ\s]+$/i, "Sobrenome deve conter apenas letras.");
        let emailValido = validarCampo(emailInput, "E-mail é obrigatório.", null, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, "E-mail inválido.");
        let telefoneValido = validarCampo(telefoneInput, "Telefone é obrigatório.", "Telefone inválido.", /^\d{10,11}$/, "Telefone inválido.");
        let dataNascimentoValida = validarDataNascimento();
        let senhaValida = validarCampo(senhaInput, "Senha é obrigatória.", "A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais.", /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais.", 8);
        let confirmarSenhaValida = validarConfirmacaoSenha();
        let termosValidos = validarTermos();

        return nomeValido && sobrenomeValido && emailValido && telefoneValido && dataNascimentoValida && senhaValida && confirmarSenhaValida && termosValidos;
    }

    function mostrarErro(campo, mensagem) {
        console.log(`Mostrando erro para o campo: ${campo}, mensagem: ${mensagem}`);
        const erroDiv = document.getElementById(`erro-${campo}`);
        if (!erroDiv) {
            console.error(`Elemento de erro com ID 'erro-${campo}' não encontrado.`);
            return;
        }
        erroDiv.textContent = mensagem;
        erroDiv.style.display = "block";
    }

    function limparErro(campo) {
        console.log(`Limpando erro para o campo: ${campo}`);
        const erroDiv = document.getElementById(`erro-${campo}`);
        if (!erroDiv) {
            console.error(`Elemento de erro com ID 'erro-${campo}' não encontrado.`);
            return;
        }
        erroDiv.textContent = "";
        erroDiv.style.display = "none";
    }

});

function togglePasswordVisibility(fieldId) {
    const field = document.getElementById(fieldId);
    const icon = field.closest(".floating-label-container").querySelector(".toggle-password i");
    if (field.type === "password") {
        field.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        field.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}

