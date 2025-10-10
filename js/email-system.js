/**
 * @file email-system.js
 * @description Sistema de E-mail para a Roxinho Shop.
 * Gerencia o envio de e-mails transacionais e de marketing, utilizando templates e uma fila de processamento.
 */

class EmailSystem {
    /**
     * Construtor da classe EmailSystem.
     * Inicializa as configurações de e-mail, templates e a fila de processamento.
     */
    constructor() {
        /**
         * @property {object} emailConfig - Configurações gerais do sistema de e-mail.
         * @property {object} emailConfig.smtp - Configurações SMTP (simuladas).
         * @property {string} emailConfig.smtp.host - Host SMTP.
         * @property {number} emailConfig.smtp.port - Porta SMTP.
         * @property {boolean} emailConfig.smtp.secure - Indica se a conexão é segura (SSL/TLS).
         * @property {object} emailConfig.smtp.auth - Credenciais de autenticação SMTP.
         * @property {string} emailConfig.smtp.auth.user - Usuário SMTP.
         * @property {string} emailConfig.smtp.auth.pass - Senha SMTP.
         * @property {object} emailConfig.from - Informações do remetente padrão.
         * @property {string} emailConfig.from.name - Nome do remetente.
         * @property {string} emailConfig.from.email - Endereço de e-mail do remetente.
         * @property {string} emailConfig.baseUrl - URL base do site para links nos e-mails.
         * @property {string} emailConfig.logoUrl - URL do logo do site para uso nos e-mails.
         */
        this.emailConfig = {
            smtp: {
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: 'noreply@roxinhoshop.com',
                    pass: 'sua_senha_de_app'
                }
            },
            from: {
                name: 'Roxinho Shop',
                email: 'noreply@roxinhoshop.com'
            },
            baseUrl: window.location.origin,
            logoUrl: window.location.origin + '/imagens/logo.png'
        };
        
        /** @type {object} Armazena os templates de e-mail carregados. */
        this.templates = {};
        /** @type {Array<object>} Fila de e-mails a serem processados. */
        this.emailQueue = [];
        /** @type {boolean} Indica se a fila de e-mails está sendo processada. */
        this.isProcessing = false;
        
        this.init();
    }

    /**
     * Inicializa o sistema de e-mail, carregando templates e iniciando o processador de fila.
     */
    async init() {
        await this.loadEmailTemplates();
        this.startEmailProcessor();
        console.log('📧 Sistema de e-mail inicializado');
    }

    /**
     * Carrega os templates de e-mail padrão do sistema.
     * Define templates para boas-vindas, confirmação de pedido, redefinição de senha, atualização de pedido e newsletter.
     */
    async loadEmailTemplates() {
        this.templates.welcome = {
            subject: 'Bem-vindo à Roxinho Shop! 🎉',
            html: this.getWelcomeTemplate(),
            text: this.getWelcomeTextTemplate()
        };

        this.templates.orderConfirmation = {
            subject: 'Pedido confirmado - #{orderNumber}',
            html: this.getOrderConfirmationTemplate(),
            text: this.getOrderConfirmationTextTemplate()
        };

        this.templates.passwordReset = {
            subject: 'Redefinir sua senha - Roxinho Shop',
            html: this.getPasswordResetTemplate(),
            text: this.getPasswordResetTextTemplate()
        };

        this.templates.orderUpdate = {
            subject: 'Atualização do seu pedido - #{orderNumber}',
            html: this.getOrderUpdateTemplate(),
            text: this.getOrderUpdateTextTemplate()
        };

        this.templates.newsletter = {
            subject: 'Novidades da Roxinho Shop 📱💻',
            html: this.getNewsletterTemplate(),
            text: this.getNewsletterTextTemplate()
        };

        console.log('📄 Templates de e-mail carregados');
    }

    /**
     * Inicia o processador de fila de e-mails, que verifica e envia e-mails periodicamente.
     */
    startEmailProcessor() {
        setInterval(() => {
            if (!this.isProcessing && this.emailQueue.length > 0) {
                this.processEmailQueue();
            }
        }, 5000); // Processar a cada 5 segundos
    }

    /**
     * Processa a fila de e-mails, enviando um e-mail por vez com um pequeno atraso.
     * Em caso de falha, o e-mail é recolocado na fila para até 3 tentativas.
     */
    async processEmailQueue() {
        if (this.emailQueue.length === 0) return;

        this.isProcessing = true;
        console.log(`📤 Processando ${this.emailQueue.length} e-mails na fila...`);

        while (this.emailQueue.length > 0) {
            const emailData = this.emailQueue.shift();
            try {
                await this.sendEmailDirect(emailData);
                await this.delay(1000); // Delay de 1 segundo entre envios
            } catch (error) {
                console.error('❌ Erro ao enviar e-mail:', error);
                if (emailData.attempts < 3) {
                    emailData.attempts = (emailData.attempts || 0) + 1;
                    this.emailQueue.push(emailData);
                }
            }
        }

        this.isProcessing = false;
        console.log('✅ Processamento da fila de e-mails concluído');
    }

    /**
     * Envia um e-mail de boas-vindas para um novo usuário.
     * @param {object} userData - Dados do usuário (nome, sobrenome, email).
     * @returns {Promise<object>} Resultado da operação de enfileiramento do e-mail.
     */
    async sendWelcomeEmail(userData) {
        console.log(`📧 Preparando e-mail de boas-vindas para: ${userData.email}`);

        const emailData = {
            to: userData.email,
            template: 'welcome',
            variables: {
                userName: userData.nome,
                userFullName: `${userData.nome} ${userData.sobrenome}`,
                loginUrl: `${this.emailConfig.baseUrl}/login.html`,
                supportEmail: 'suporte@roxinhoshop.com',
                unsubscribeUrl: `${this.emailConfig.baseUrl}/unsubscribe?email=${encodeURIComponent(userData.email)}`
            }
        };

        return this.queueEmail(emailData);
    }

    /**
     * Envia um e-mail de confirmação de pedido.
     * @param {object} orderData - Dados do pedido (numero_pedido, data_pedido, total, itens).
     * @param {object} userData - Dados do usuário que fez o pedido (nome, email).
     * @returns {Promise<object>} Resultado da operação de enfileiramento do e-mail.
     */
    async sendOrderConfirmationEmail(orderData, userData) {
        console.log(`📧 Preparando e-mail de confirmação de pedido: ${orderData.numero_pedido}`);

        const emailData = {
            to: userData.email,
            template: 'orderConfirmation',
            variables: {
                userName: userData.nome,
                orderNumber: orderData.numero_pedido,
                orderDate: new Date(orderData.data_pedido).toLocaleDateString('pt-BR'),
                orderTotal: this.formatCurrency(orderData.total),
                orderItems: orderData.itens || [],
                trackingUrl: `${this.emailConfig.baseUrl}/rastrear-pedido?numero=${orderData.numero_pedido}`,
                supportEmail: 'suporte@roxinhoshop.com'
            }
        };

        return this.queueEmail(emailData);
    }

    /**
     * Envia um e-mail para redefinição de senha.
     * @param {string} email - Endereço de e-mail do usuário.
     * @param {string} resetToken - Token de redefinição de senha.
     * @returns {Promise<object>} Resultado da operação de enfileiramento do e-mail.
     */
    async sendPasswordResetEmail(email, resetToken) {
        console.log(`📧 Preparando e-mail de redefinição de senha para: ${email}`);

        const emailData = {
            to: email,
            template: 'passwordReset',
            variables: {
                resetUrl: `${this.emailConfig.baseUrl}/redefinir-senha?token=${resetToken}`,
                expirationTime: '24 horas',
                supportEmail: 'suporte@roxinhoshop.com'
            }
        };

        return this.queueEmail(emailData);
    }

    /**
     * Envia um e-mail de atualização de status de pedido.
     * @param {object} orderData - Dados do pedido.
     * @param {object} userData - Dados do usuário.
     * @param {string} newStatus - Novo status do pedido.
     * @returns {Promise<object>} Resultado da operação de enfileiramento do e-mail.
     */
    async sendOrderUpdateEmail(orderData, userData, newStatus) {
        console.log(`📧 Preparando e-mail de atualização de pedido: ${orderData.numero_pedido}`);

        const statusMessages = {
            'confirmado': 'Seu pedido foi confirmado e está sendo preparado para envio.',
            'processando': 'Seu pedido está sendo processado em nosso centro de distribuição.',
            'enviado': 'Seu pedido foi enviado e está a caminho!',
            'entregue': 'Seu pedido foi entregue com sucesso.',
            'cancelado': 'Seu pedido foi cancelado conforme solicitado.'
        };

        const emailData = {
            to: userData.email,
            template: 'orderUpdate',
            variables: {
                userName: userData.nome,
                orderNumber: orderData.numero_pedido,
                newStatus: this.formatOrderStatus(newStatus),
                statusMessage: statusMessages[newStatus] || 'Status do pedido atualizado.',
                trackingUrl: `${this.emailConfig.baseUrl}/rastrear-pedido?numero=${orderData.numero_pedido}`,
                supportEmail: 'suporte@roxinhoshop.com'
            }
        };

        return this.queueEmail(emailData);
    }

    /**
     * Envia uma newsletter para uma lista de destinatários.
     * @param {Array<string>} emailList - Lista de endereços de e-mail.
     * @param {object} newsletterData - Dados da newsletter (título, conteúdo, etc.).
     * @returns {Promise<Array<object>>} Resultados das operações de enfileiramento dos e-mails.
     */
    async sendNewsletter(emailList, newsletterData) {
        console.log(`📧 Preparando newsletter para ${emailList.length} destinatários`);

        const promises = emailList.map(email => {
            const emailData = {
                to: email,
                template: 'newsletter',
                variables: {
                    ...newsletterData,
                    unsubscribeUrl: `${this.emailConfig.baseUrl}/unsubscribe?email=${encodeURIComponent(email)}`
                }
            };
            return this.queueEmail(emailData);
        });

        return Promise.all(promises);
    }

    /**
     * Adiciona um e-mail à fila de processamento.
     * @param {object} emailData - Dados do e-mail a ser enviado (to, template, variables).
     * @returns {object} Objeto com sucesso, mensagem e posição na fila.
     */
    async queueEmail(emailData) {
        emailData.queuedAt = new Date().toISOString();
        emailData.attempts = 0;
        this.emailQueue.push(emailData);
        
        console.log(`📬 E-mail adicionado à fila: ${emailData.to}`);
        
        return {
            success: true,
            message: 'E-mail adicionado à fila de envio',
            queuePosition: this.emailQueue.length
        };
    }

    /**
     * Simula o envio direto de um e-mail.
     * Em um ambiente de produção, esta função faria a integração com um serviço de envio de e-mail real.
     * @param {object} emailData - Dados do e-mail a ser enviado.
     * @returns {Promise<object>} Objeto com sucesso, ID da mensagem e data de envio.
     * @throws {Error} Se o template de e-mail não for encontrado.
     */
    async sendEmailDirect(emailData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const template = this.templates[emailData.template];
                    if (!template) {
                        throw new Error(`Template ${emailData.template} não encontrado`);
                    }

                    const processedSubject = this.processTemplate(template.subject, emailData.variables);
                    const processedHtml = this.processTemplate(template.html, emailData.variables);
                    const processedText = this.processTemplate(template.text, emailData.variables);

                    console.log(`📧 E-mail enviado para: ${emailData.to}`);
                    console.log(`📋 Assunto: ${processedSubject}`);
                    console.log(`📄 Conteúdo HTML processado (${processedHtml.length} caracteres)`);
                    
                    this.logEmailSent({
                        to: emailData.to,
                        subject: processedSubject,
                        template: emailData.template,
                        sentAt: new Date().toISOString(),
                        success: true
                    });

                    resolve({
                        success: true,
                        messageId: 'msg_' + Math.random().toString(36).substr(2, 9),
                        sentAt: new Date().toISOString()
                    });
                } catch (error) {
                    console.error(`❌ Erro ao enviar e-mail para ${emailData.to}:`, error);
                    
                    this.logEmailSent({
                        to: emailData.to,
                        template: emailData.template,
                        sentAt: new Date().toISOString(),
                        success: false,
                        error: error.message
                    });
                    
                    reject(error);
                }
            }, Math.random() * 2000 + 500); // Simular delay de rede
        });
    }

    /**
     * Processa um template de string, substituindo variáveis por seus valores.
     * @param {string} template - A string do template com placeholders `{{variableName}}`.
     * @param {object} variables - Um objeto onde as chaves são os nomes das variáveis e os valores são seus substitutos.
     * @returns {string} O template processado com as variáveis substituídas.
     */
    processTemplate(template, variables) {
        let processed = template;
        
        Object.keys(variables).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            processed = processed.replace(regex, variables[key] || '');
        });
        
        processed = processed.replace(/{{currentYear}}/g, new Date().getFullYear());
        processed = processed.replace(/{{siteName}}/g, 'Roxinho Shop');
        processed = processed.replace(/{{siteUrl}}/g, this.emailConfig.baseUrl);
        processed = processed.replace(/{{logoUrl}}/g, this.emailConfig.logoUrl);
        
        return processed;
    }

    /**
     * Salva um log de e-mail enviado no localStorage.
     * Mantém um histórico dos últimos 1000 logs de e-mail.
     * @param {object} logData - Dados do log (to, subject, template, sentAt, success, error).
     */
    logEmailSent(logData) {
        const emailLogs = JSON.parse(localStorage.getItem('roxinho_email_logs') || '[]');
        emailLogs.push(logData);
        
        if (emailLogs.length > 1000) {
            emailLogs.splice(0, emailLogs.length - 1000);
        }
        
        localStorage.setItem('roxinho_email_logs', JSON.stringify(emailLogs));
    }

    /**
     * Obtém estatísticas de e-mail, incluindo total, sucesso, falha e por template.
     * @returns {object} Objeto contendo as estatísticas de e-mail.
     */
    getEmailStats() {
        const emailLogs = JSON.parse(localStorage.getItem('roxinho_email_logs') || '[]');
        const today = new Date().toDateString();
        const thisWeek = new Date();
        thisWeek.setDate(thisWeek.getDate() - 7);
        
        const stats = {
            total: emailLogs.length,
            successful: emailLogs.filter(log => log.success).length,
            failed: emailLogs.filter(log => !log.success).length,
            today: emailLogs.filter(log => new Date(log.sentAt).toDateString() === today).length,
            thisWeek: emailLogs.filter(log => new Date(log.sentAt) > thisWeek).length,
            byTemplate: {}
        };
        
        emailLogs.forEach(log => {
            if (!stats.byTemplate[log.template]) {
                stats.byTemplate[log.template] = { sent: 0, successful: 0, failed: 0 };
            }
            stats.byTemplate[log.template].sent++;
            if (log.success) {
                stats.byTemplate[log.template].successful++;
            } else {
                stats.byTemplate[log.template].failed++;
            }
        });
        
        return stats;
    }

    /**
     * Formata um valor numérico como moeda brasileira (BRL).
     * @param {number} value - O valor a ser formatado.
     * @returns {string} O valor formatado como string de moeda.
     */
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }

    /**
     * Formata o status de um pedido para exibição amigável.
     * @param {string} status - O status do pedido (ex: 'confirmado', 'enviado').
     * @returns {string} O status formatado.
     */
    formatOrderStatus(status) {
        const statusMap = {
            'pendente': 'Pendente',
            'confirmado': 'Confirmado',
            'processando': 'Processando',
            'enviado': 'Enviado',
            'entregue': 'Entregue',
            'cancelado': 'Cancelado',
            'devolvido': 'Devolvido'
        };
        return statusMap[status] || status;
    }

    /**
     * Cria um atraso (delay) em milissegundos.
     * @param {number} ms - O tempo de atraso em milissegundos.
     * @returns {Promise<void>} Uma promessa que resolve após o tempo especificado.
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Templates HTML

    /**
     * Retorna o template HTML para o e-mail de boas-vindas.
     * @returns {string} O conteúdo HTML do template.
     */
    getWelcomeTemplate() {
        return `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bem-vindo à Roxinho Shop</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                .header { text-align: center; padding: 20px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
                .logo { max-width: 150px; height: auto; }
                .welcome-text { font-size: 24px; margin: 10px 0; }
                .content { padding: 20px 0; }
                .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; margin-top: 30px; color: #666; font-size: 14px; }
                .social-links { margin: 20px 0; }
                .social-links a { margin: 0 10px; color: #667eea; text-decoration: none; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="{{logoUrl}}" alt="Roxinho Shop" class="logo">
                    <h1 class="welcome-text">Bem-vindo, {{userName}}! 🎉</h1>
                </div>
                
                <div class="content">
                    <p>Olá <strong>{{userFullName}}</strong>,</p>
                    
                    <p>É com grande alegria que damos as boas-vindas à <strong>Roxinho Shop</strong>! Sua conta foi criada com sucesso e você já pode aproveitar todas as vantagens de ser nosso cliente.</p>
                    
                    <h3>🎯 O que você pode fazer agora:</h3>
                    <ul>
                        <li>🛒 Explorar nosso catálogo completo de produtos</li>
                        <li>💰 Aproveitar ofertas exclusivas para novos clientes</li>
                        <li>🚚 Receber frete grátis em compras acima de R$ 100</li>
                        <li>⭐ Acumular pontos XP a cada compra</li>
                        <li>📱 Acompanhar seus pedidos em tempo real</li>
                    </ul>
                    
                    <p>Para começar suas compras, clique no botão abaixo:</p>
                    
                    <div style="text-align: center;">
                        <a href="{{loginUrl}}" class="button">Fazer Login e Começar a Comprar</a>
                    </div>
                    
                    <h3>🎁 Oferta Especial de Boas-vindas!</h3>
                    <p>Como novo cliente, você recebe <strong>10% de desconto</strong> na sua primeira compra! Use o cupom <strong>BEMVINDO10</strong> no checkout.</p>
                    
                    <p>Se tiver alguma dúvida, não hesite em nos contatar através do e-mail <a href="mailto:{{supportEmail}}">{{supportEmail}}</a>.</p>
                    
                    <p>Boas compras!</p>
                    <p>Atenciosamente,<br>A Equipe Roxinho Shop</p>
                </div>
                
                <div class="footer">
                    <p>&copy; {{currentYear}} {{siteName}}. Todos os direitos reservados.</p>
                    <p><a href="{{unsubscribeUrl}}" style="color: #666;">Cancelar inscrição</a></p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Retorna o template de texto simples para o e-mail de boas-vindas.
     * @returns {string} O conteúdo de texto simples do template.
     */
    getWelcomeTextTemplate() {
        return `
        Bem-vindo(a) à Roxinho Shop, {{userName}}!

        Olá {{userFullName}},

        É com grande alegria que damos as boas-vindas à Roxinho Shop! Sua conta foi criada com sucesso e você já pode aproveitar todas as vantagens de ser nosso cliente.

        O que você pode fazer agora:
        - Explorar nosso catálogo completo de produtos
        - Aproveitar ofertas exclusivas para novos clientes
        - Receber frete grátis em compras acima de R$ 100
        - Acumular pontos XP a cada compra
        - Acompanhar seus pedidos em tempo real

        Para começar suas compras, acesse:
        {{loginUrl}}

        Oferta Especial de Boas-vindas!
        Como novo cliente, você recebe 10% de desconto na sua primeira compra! Use o cupom BEMVINDO10 no checkout.

        Se tiver alguma dúvida, não hesite em nos contatar através do e-mail {{supportEmail}}.

        Boas compras!

        Atenciosamente,
        A Equipe Roxinho Shop

        © {{currentYear}} {{siteName}}. Todos os direitos reservados.
        Para cancelar sua inscrição, acesse: {{unsubscribeUrl}}
        `;
    }

    /**
     * Retorna o template HTML para o e-mail de confirmação de pedido.
     * @returns {string} O conteúdo HTML do template.
     */
    getOrderConfirmationTemplate() {
        return `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirmação de Pedido - Roxinho Shop</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                .header { text-align: center; padding: 20px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
                .logo { max-width: 150px; height: auto; }
                .title { font-size: 24px; margin: 10px 0; }
                .content { padding: 20px 0; }
                .order-details { background-color: #f9f9f9; border: 1px solid #eee; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
                .order-details p { margin: 5px 0; }
                .item-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                .item-table th, .item-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .item-table th { background-color: #f2f2f2; }
                .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
                .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="{{logoUrl}}" alt="Roxinho Shop" class="logo">
                    <h1 class="title">Seu Pedido #{{orderNumber}} Foi Confirmado! 🎉</h1>
                </div>
                
                <div class="content">
                    <p>Olá <strong>{{userName}}</strong>,</p>
                    
                    <p>Agradecemos por sua compra na <strong>Roxinho Shop</strong>! Seu pedido <strong>#{{orderNumber}}</strong>, realizado em {{orderDate}}, foi confirmado e está sendo processado.</p>
                    
                    <h3>Detalhes do Pedido:</h3>
                    <div class="order-details">
                        <p><strong>Número do Pedido:</strong> {{orderNumber}}</p>
                        <p><strong>Data do Pedido:</strong> {{orderDate}}</p>
                        <p><strong>Total:</strong> {{orderTotal}}</p>
                    </div>

                    <h3>Itens do Pedido:</h3>
                    <table class="item-table">
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Quantidade</th>
                                <th>Preço Unitário</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {{#each orderItems}}
                            <tr>
                                <td>{{this.nome}}</td>
                                <td>{{this.quantidade}}</td>
                                <td>{{formatCurrency this.precoUnitario}}</td>
                                <td>{{formatCurrency this.subtotal}}</td>
                            </tr>
                            {{/each}}
                        </tbody>
                    </table>
                    
                    <div class="total">
                        Total do Pedido: {{orderTotal}}
                    </div>

                    <p>Você pode acompanhar o status do seu pedido a qualquer momento clicando no botão abaixo:</p>
                    
                    <div style="text-align: center;">
                        <a href="{{trackingUrl}}" class="button">Acompanhar Meu Pedido</a>
                    </div>
                    
                    <p>Se tiver alguma dúvida, entre em contato com nosso suporte: <a href="mailto:{{supportEmail}}">{{supportEmail}}</a>.</p>
                    
                    <p>Atenciosamente,<br>A Equipe Roxinho Shop</p>
                </div>
                
                <div class="footer">
                    <p>&copy; {{currentYear}} {{siteName}}. Todos os direitos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Retorna o template de texto simples para o e-mail de confirmação de pedido.
     * @returns {string} O conteúdo de texto simples do template.
     */
    getOrderConfirmationTextTemplate() {
        return `
        Seu Pedido #{{orderNumber}} Foi Confirmado! 🎉

        Olá {{userName}},

        Agradecemos por sua compra na Roxinho Shop! Seu pedido #{{orderNumber}}, realizado em {{orderDate}}, foi confirmado e está sendo processado.

        Detalhes do Pedido:
        Número do Pedido: {{orderNumber}}
        Data do Pedido: {{orderDate}}
        Total: {{orderTotal}}

        Itens do Pedido:
        {{#each orderItems}}
        - {{this.nome}} (x{{this.quantidade}}) - {{formatCurrency this.precoUnitario}} cada - Subtotal: {{formatCurrency this.subtotal}}
        {{/each}}

        Total do Pedido: {{orderTotal}}

        Você pode acompanhar o status do seu pedido a qualquer momento acessando:
        {{trackingUrl}}

        Se tiver alguma dúvida, entre em contato com nosso suporte: {{supportEmail}}.

        Atenciosamente,
        A Equipe Roxinho Shop

        © {{currentYear}} {{siteName}}. Todos os direitos reservados.
        `;
    }

    /**
     * Retorna o template HTML para o e-mail de redefinição de senha.
     * @returns {string} O conteúdo HTML do template.
     */
    getPasswordResetTemplate() {
        return `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Redefinir Senha - Roxinho Shop</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                .header { text-align: center; padding: 20px 0; background: linear-gradient(135deg, #ff6b6b 0%, #ee4d4d 100%); color: white; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
                .logo { max-width: 150px; height: auto; }
                .title { font-size: 24px; margin: 10px 0; }
                .content { padding: 20px 0; }
                .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #ff6b6b 0%, #ee4d4d 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="{{logoUrl}}" alt="Roxinho Shop" class="logo">
                    <h1 class="title">Redefinição de Senha</h1>
                </div>
                
                <div class="content">
                    <p>Olá,</p>
                    
                    <p>Recebemos uma solicitação para redefinir a senha da sua conta na <strong>Roxinho Shop</strong>.</p>
                    
                    <p>Para redefinir sua senha, clique no link abaixo:</p>
                    
                    <div style="text-align: center;">
                        <a href="{{resetUrl}}" class="button">Redefinir Minha Senha</a>
                    </div>
                    
                    <p>Este link de redefinição de senha é válido por {{expirationTime}}. Se você não solicitou esta redefinição, por favor, ignore este e-mail ou entre em contato com nosso suporte.</p>
                    
                    <p>Se tiver alguma dúvida, entre em contato com nosso suporte: <a href="mailto:{{supportEmail}}">{{supportEmail}}</a>.</p>
                    
                    <p>Atenciosamente,<br>A Equipe Roxinho Shop</p>
                </div>
                
                <div class="footer">
                    <p>&copy; {{currentYear}} {{siteName}}. Todos os direitos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Retorna o template de texto simples para o e-mail de redefinição de senha.
     * @returns {string} O conteúdo de texto simples do template.
     */
    getPasswordResetTextTemplate() {
        return `
        Redefinição de Senha - Roxinho Shop

        Olá,

        Recebemos uma solicitação para redefinir a senha da sua conta na Roxinho Shop.

        Para redefinir sua senha, clique no link abaixo:
        {{resetUrl}}

        Este link de redefinição de senha é válido por {{expirationTime}}. Se você não solicitou esta redefinição, por favor, ignore este e-mail ou entre em contato com nosso suporte.

        Se tiver alguma dúvida, entre em contato com nosso suporte: {{supportEmail}}.

        Atenciosamente,
        A Equipe Roxinho Shop

        © {{currentYear}} {{siteName}}. Todos os direitos reservados.
        `;
    }

    /**
     * Retorna o template HTML para o e-mail de atualização de pedido.
     * @returns {string} O conteúdo HTML do template.
     */
    getOrderUpdateTemplate() {
        return `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Atualização do seu Pedido - Roxinho Shop</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                .header { text-align: center; padding: 20px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
                .logo { max-width: 150px; height: auto; }
                .title { font-size: 24px; margin: 10px 0; }
                .content { padding: 20px 0; }
                .order-details { background-color: #f9f9f9; border: 1px solid #eee; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
                .order-details p { margin: 5px 0; }
                .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="{{logoUrl}}" alt="Roxinho Shop" class="logo">
                    <h1 class="title">Atualização do seu Pedido #{{orderNumber}}</h1>
                </div>
                
                <div class="content">
                    <p>Olá <strong>{{userName}}</strong>,</p>
                    
                    <p>Temos uma atualização importante sobre o seu pedido <strong>#{{orderNumber}}</strong> na <strong>Roxinho Shop</strong>.</p>
                    
                    <h3>Novo Status do Pedido:</h3>
                    <div class="order-details">
                        <p><strong>Status Atual:</strong> {{newStatus}}</p>
                        <p>{{statusMessage}}</p>
                    </div>

                    <p>Você pode acompanhar o status detalhado do seu pedido a qualquer momento clicando no botão abaixo:</p>
                    
                    <div style="text-align: center;">
                        <a href="{{trackingUrl}}" class="button">Acompanhar Meu Pedido</a>
                    </div>
                    
                    <p>Se tiver alguma dúvida, entre em contato com nosso suporte: <a href="mailto:{{supportEmail}}">{{supportEmail}}</a>.</p>
                    
                    <p>Atenciosamente,<br>A Equipe Roxinho Shop</p>
                </div>
                
                <div class="footer">
                    <p>&copy; {{currentYear}} {{siteName}}. Todos os direitos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Retorna o template de texto simples para o e-mail de atualização de pedido.
     * @returns {string} O conteúdo de texto simples do template.
     */
    getOrderUpdateTextTemplate() {
        return `
        Atualização do seu Pedido #{{orderNumber}} - Roxinho Shop

        Olá {{userName}},

        Temos uma atualização importante sobre o seu pedido #{{orderNumber}} na Roxinho Shop.

        Novo Status do Pedido:
        Status Atual: {{newStatus}}
        {{statusMessage}}

        Você pode acompanhar o status detalhado do seu pedido a qualquer momento acessando:
        {{trackingUrl}}

        Se tiver alguma dúvida, entre em contato com nosso suporte: {{supportEmail}}.

        Atenciosamente,
        A Equipe Roxinho Shop

        © {{currentYear}} {{siteName}}. Todos os direitos reservados.
        `;
    }

    /**
     * Retorna o template HTML para a newsletter.
     * @returns {string} O conteúdo HTML do template.
     */
    getNewsletterTemplate() {
        return `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Novidades da Roxinho Shop</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                .header { text-align: center; padding: 20px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
                .logo { max-width: 150px; height: auto; }
                .title { font-size: 24px; margin: 10px 0; }
                .content { padding: 20px 0; }
                .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; margin-top: 30px; color: #666; font-size: 14px; }
                .social-links { margin: 20px 0; }
                .social-links a { margin: 0 10px; color: #667eea; text-decoration: none; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="{{logoUrl}}" alt="Roxinho Shop" class="logo">
                    <h1 class="title">{{newsletterTitle}}</h1>
                </div>
                
                <div class="content">
                    <p>Olá,</p>
                    
                    <p>{{newsletterContent}}</p>
                    
                    {{#if callToActionUrl}}
                    <div style="text-align: center;">
                        <a href="{{callToActionUrl}}" class="button">{{callToActionText}}</a>
                    </div>
                    {{/if}}
                    
                    <p>Fique por dentro das últimas novidades e ofertas da <strong>Roxinho Shop</strong>!</p>
                    
                    <p>Atenciosamente,<br>A Equipe Roxinho Shop</p>
                </div>
                
                <div class="footer">
                    <p>&copy; {{currentYear}} {{siteName}}. Todos os direitos reservados.</p>
                    <p><a href="{{unsubscribeUrl}}" style="color: #666;">Cancelar inscrição</a></p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Retorna o template de texto simples para a newsletter.
     * @returns {string} O conteúdo de texto simples do template.
     */
    getNewsletterTextTemplate() {
        return `
        {{newsletterTitle}}

        Olá,

        {{newsletterContent}}

        {{#if callToActionUrl}}
        {{callToActionText}}: {{callToActionUrl}}
        {{/if}}

        Fique por dentro das últimas novidades e ofertas da Roxinho Shop!

        Atenciosamente,
        A Equipe Roxinho Shop

        © {{currentYear}} {{siteName}}. Todos os direitos reservados.
        Para cancelar sua inscrição, acesse: {{unsubscribeUrl}}
        `;
    }
}

// Instanciar o sistema de e-mail globalmente
window.emailSystem = new EmailSystem();

console.log('📧 email-system.js carregado');
