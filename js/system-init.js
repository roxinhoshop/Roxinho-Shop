/**
 * @file system-init.js
 * @description Inicializador do Sistema para a Roxinho Shop.
 * Coordena a inicialização e integração de todos os módulos do sistema (autenticação, API, e-mail, etc.).
 */

class SystemInitializer {
    /**
     * Construtor da classe SystemInitializer.
     * Define a ordem de inicialização dos sistemas e variáveis de estado.
     */
    constructor() {
        /** @type {object} Armazena referências aos sistemas inicializados. */
        this.systems = {};
        /** @type {Array<string>} A ordem em que os sistemas devem ser inicializados. */
        this.initializationOrder = [
            'dataIntegration',
            'authSystem', 
            'apiSystem',
            'emailSystem'
        ];
        /** @type {boolean} Indica se todos os sistemas foram inicializados. */
        this.isInitialized = false;
        /** @type {Promise<void>|null} Promessa que representa o processo de inicialização. */
        this.initPromise = null;
    }

    /**
     * Inicia o processo de inicialização de todos os sistemas.
     * Garante que a inicialização ocorra apenas uma vez.
     * @returns {Promise<void>} Uma promessa que resolve quando todos os sistemas são inicializados.
     */
    async init() {
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = this.performInitialization();
        return this.initPromise;
    }

    /**
     * Executa a sequência de inicialização dos sistemas.
     * Inclui espera pelo DOM, inicialização sequencial, configuração de integrações e verificações pós-inicialização.
     * @private
     * @returns {Promise<void>} Uma promessa que resolve quando a inicialização é concluída.
     * @throws {Error} Se ocorrer um erro crítico durante a inicialização.
     */
    async performInitialization() {
        console.log('🚀 Iniciando sistemas da Roxinho Shop...');
        
        try {
            await this.waitForDOM();
            
            for (const systemName of this.initializationOrder) {
                await this.initializeSystem(systemName);
            }
            
            await this.setupSystemIntegrations();
            
            await this.postInitializationChecks();
            
            this.isInitialized = true;
            console.log('✅ Todos os sistemas inicializados com sucesso!');
            
            this.dispatchSystemReadyEvent();
            
        } catch (error) {
            console.error('❌ Erro na inicialização dos sistemas:', error);
            throw error;
        }
    }

    /**
     * Aguarda o DOM estar completamente carregado.
     * @private
     * @returns {Promise<void>} Uma promessa que resolve quando o DOM está pronto.
     */
    waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    /**
     * Inicializa um sistema específico com base no seu nome.
     * @private
     * @param {string} systemName - O nome do sistema a ser inicializado (ex: 'authSystem').
     * @returns {Promise<void>} Uma promessa que resolve quando o sistema é inicializado.
     * @throws {Error} Se o sistema não puder ser inicializado ou não estiver disponível.
     */
    async initializeSystem(systemName) {
        console.log(`🔄 Inicializando ${systemName}...`);
        
        try {
            switch (systemName) {
                case 'dataIntegration':
                    if (window.DataIntegration && !window.dataIntegration) {
                        window.dataIntegration = new window.DataIntegration();
                    }
                    await this.waitForSystem('dataIntegration');
                    break;
                    
                case 'authSystem':
                    if (window.AuthSystem && !window.authSystem) {
                        window.authSystem = new window.AuthSystem();
                    }
                    await this.waitForSystem('authSystem');
                    break;
                    
                case 'apiSystem':
                    if (window.APISystem && !window.apiSystem) {
                        window.apiSystem = new window.APISystem();
                    }
                    await this.waitForSystem('apiSystem');
                    break;
                    
                case 'emailSystem':
                    if (window.EmailSystem && !window.emailSystem) {
                        window.emailSystem = new window.EmailSystem();
                    }
                    await this.waitForSystem('emailSystem');
                    break;
                    
                default:
                    console.warn(`⚠️ Sistema desconhecido: ${systemName}`);
            }
            
            this.systems[systemName] = window[systemName];
            console.log(`✅ ${systemName} inicializado`);
            
        } catch (error) {
            console.error(`❌ Erro ao inicializar ${systemName}:`, error);
            throw error;
        }
    }

    /**
     * Aguarda até que um sistema específico esteja disponível no objeto `window`.
     * @private
     * @param {string} systemName - O nome do sistema a ser aguardado.
     * @param {number} [maxAttempts=50] - Número máximo de tentativas de verificação.
     * @returns {Promise<object>} Uma promessa que resolve com a instância do sistema quando disponível.
     * @throws {Error} Se o sistema não inicializar no tempo esperado.
     */
    async waitForSystem(systemName, maxAttempts = 50) {
        let attempts = 0;
        
        return new Promise((resolve, reject) => {
            const checkSystem = () => {
                attempts++;
                
                if (window[systemName]) {
                    resolve(window[systemName]);
                } else if (attempts >= maxAttempts) {
                    reject(new Error(`Sistema ${systemName} não inicializou no tempo esperado`));
                } else {
                    setTimeout(checkSystem, 100);
                }
            };
            
            checkSystem();
        });
    }

    /**
     * Configura as integrações e dependências entre os diferentes sistemas.
     * Por exemplo, integra o sistema de autenticação com o sistema de e-mail.
     * @private
     */
    async setupSystemIntegrations() {
        console.log('🔗 Configurando integrações entre sistemas...');
        
        try {
            if (window.authSystem && window.emailSystem) {
                const originalRegister = window.authSystem.registerUser.bind(window.authSystem);
                window.authSystem.registerUser = async function(userData) {
                    const result = await originalRegister(userData);
                    
                    if (result.success) {
                        try {
                            await window.emailSystem.sendWelcomeEmail(userData);
                        } catch (emailError) {
                            console.warn('⚠️ Erro ao enviar e-mail de boas-vindas:', emailError);
                        }
                    }
                    
                    return result;
                };
                
                console.log('✅ Integração Auth + Email configurada');
            }
            
            if (window.apiSystem && window.emailSystem) {
                console.log('ℹ️ Integração API + Email preparada para pedidos');
            }
            
            if (window.dataIntegration && window.authSystem) {
                await window.dataIntegration.syncUsers();
                console.log('✅ Integração Data + Auth configurada');
            }
            
        } catch (error) {
            console.error('❌ Erro ao configurar integrações:', error);
        }
    }

    /**
     * Executa verificações e tarefas pós-inicialização.
     * Inclui verificação de integridade de dados, criação de admin padrão e estatísticas de e-mail.
     * @private
     */
    async postInitializationChecks() {
        console.log('🔍 Executando verificações pós-inicialização...');
        
        try {
            if (window.dataIntegration) {
                const integrityCheck = await window.dataIntegration.verifyDataIntegrity();
                if (integrityCheck.length > 0) {
                    console.warn('⚠️ Problemas de integridade detectados:', integrityCheck);
                }
            }
            
            if (window.authSystem) {
                const adminExists = await window.authSystem.checkAdminExists();
                if (!adminExists) {
                    console.log('👤 Criando usuário administrador padrão...');
                    await window.authSystem.createDefaultAdmin();
                }
            }
            
            if (window.emailSystem) {
                const emailStats = window.emailSystem.getEmailStats();
                console.log('📧 Estatísticas de e-mail:', emailStats);
            }
            
            console.log('✅ Verificações pós-inicialização concluídas');
            
        } catch (error) {
            console.error('❌ Erro nas verificações pós-inicialização:', error);
        }
    }

    /**
     * Dispara um evento personalizado 'systemReady' quando todos os sistemas são inicializados.
     * @private
     */
    dispatchSystemReadyEvent() {
        const event = new CustomEvent('systemReady', {
            detail: {
                systems: Object.keys(this.systems),
                timestamp: new Date().toISOString()
            }
        });
        
        document.dispatchEvent(event);
        console.log('📡 Evento systemReady disparado');
    }

    /**
     * Verifica se todos os sistemas foram inicializados com sucesso.
     * @returns {boolean} True se os sistemas estão prontos, false caso contrário.
     */
    isSystemReady() {
        return this.isInitialized;
    }

    /**
     * Obtém o status atual da inicialização dos sistemas.
     * @returns {object} Um objeto contendo o status de inicialização e os sistemas envolvidos.
     */
    getSystemStatus() {
        return {
            initialized: this.isInitialized,
            systems: Object.keys(this.systems),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Reinicializa um sistema específico.
     * @param {string} systemName - O nome do sistema a ser reinicializado.
     * @returns {Promise<void>} Uma promessa que resolve quando o sistema é reinicializado.
     * @throws {Error} Se ocorrer um erro durante a reinicialização.
     */
    async reinitializeSystem(systemName) {
        console.log(`🔄 Reinicializando ${systemName}...`);
        
        try {
            if (this.systems[systemName]) {
                delete this.systems[systemName];
                delete window[systemName];
            }
            
            await this.initializeSystem(systemName);
            
            console.log(`✅ ${systemName} reinicializado com sucesso`);
            
        } catch (error) {
            console.error(`❌ Erro ao reinicializar ${systemName}:`, error);
            throw error;
        }
    }

    /**
     * Exibe informações de depuração sobre o estado dos sistemas e dados no localStorage.
     */
    debugSystems() {
        console.group('🔧 Debug dos Sistemas');
        
        console.log('Status geral:', this.getSystemStatus());
        
        Object.keys(this.systems).forEach(systemName => {
            const system = this.systems[systemName];
            console.log(`${systemName}:`, system);
        });
        
        console.group('💾 Dados no localStorage');
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('roxinho_')) {
                const data = localStorage.getItem(key);
                try {
                    const parsed = JSON.parse(data);
                    console.log(`${key}:`, Array.isArray(parsed) ? `Array(${parsed.length})` : typeof parsed);
                } catch {
                    console.log(`${key}:`, `String(${data.length} chars)`);
                }
            }
        });
        console.groupEnd();
        
        console.groupEnd();
    }

    /**
     * Limpa todos os dados do sistema armazenados no localStorage (requer confirmação do usuário).
     * Destinado a ambientes de desenvolvimento/teste.
     */
    clearAllData() {
        if (confirm('⚠️ ATENÇÃO: Isso irá apagar todos os dados do sistema. Continuar?')) {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('roxinho_')) {
                    localStorage.removeItem(key);
                }
            });
            
            console.log('🗑️ Todos os dados foram limpos');
            location.reload();
        }
    }

    /**
     * Exporta a configuração atual do sistema para um arquivo JSON.
     * @returns {void}
     */
    exportSystemConfig() {
        const config = {
            version: '1.0.0',
            exported_at: new Date().toISOString(),
            systems: this.initializationOrder,
            status: this.getSystemStatus()
        };
        
        const dataStr = JSON.stringify(config, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `roxinho-shop-config-${Date.now()}.json`;
        link.click();
        
        console.log('📤 Configuração do sistema exportada');
    }
}

/**
 * Função global para aguardar a inicialização completa dos sistemas.
 * @param {Function} callback - A função a ser executada quando os sistemas estiverem prontos.
 */
window.waitForSystems = function(callback) {
    if (window.systemInitializer && window.systemInitializer.isSystemReady()) {
        callback();
    } else {
        document.addEventListener('systemReady', callback, { once: true });
    }
};

/**
 * Função global para depurar os sistemas.
 * Exibe informações detalhadas no console.
 */
window.debugSystems = function() {
    if (window.systemInitializer) {
        window.systemInitializer.debugSystems();
    } else {
        console.log('Sistema ainda não inicializado');
    }
};

/**
 * Função global para limpar todos os dados do sistema (requer confirmação).
 * Destinado a ambientes de desenvolvimento/teste.
 */
window.clearAllData = function() {
    if (window.systemInitializer) {
        window.systemInitializer.clearAllData();
    }
};

// Inicializa o SystemInitializer automaticamente quando o DOM é carregado.
document.addEventListener('DOMContentLoaded', async () => {
    try {
        window.systemInitializer = new SystemInitializer();
        await window.systemInitializer.init();
    } catch (error) {
        console.error('❌ Falha crítica na inicialização:', error);
        

    }
});

console.log('🚀 Inicializador do sistema carregado');
