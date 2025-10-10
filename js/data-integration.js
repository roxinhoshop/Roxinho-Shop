/**
 * @file data-integration.js
 * @description Sistema de Integração de Dados para a Roxinho Shop.
 * Gerencia a migração, sincronização e persistência de dados entre o sistema e o localStorage.
 */

class DataIntegration {
    /**
     * Construtor da classe DataIntegration.
     * Inicializa o sistema de integração de dados.
     */
    constructor() {
        /** @type {boolean} Indica se o sistema de integração foi inicializado. */
        this.isInitialized = false;
        /** @type {string} A versão atual da migração de dados. */
        this.migrationVersion = '1.0.0';
        this.init();
    }

    /**
     * Inicializa o sistema de integração de dados.
     * Realiza a verificação do status da migração, migra dados existentes e sincroniza com o "banco de dados" (localStorage).
     */
    async init() {
        console.log('🔄 Iniciando integração de dados...');
        
        try {
            await this.checkMigrationStatus();
            await this.migrateExistingData();
            await this.syncWithExistingDatabase();
            
            this.isInitialized = true;
            console.log('✅ Integração de dados concluída com sucesso');
        } catch (error) {
            console.error('❌ Erro na integração de dados:', error);
        }
    }

    /**
     * Verifica o status das migrações de dados.
     * Se não houver status, executa a migração inicial. Se houver uma nova versão, executa a migração de versão.
     */
    async checkMigrationStatus() {
        const migrationStatus = localStorage.getItem('roxinho_migration_status');
        
        if (!migrationStatus) {
            console.log('🆕 Primeira execução - preparando migração inicial');
            await this.performInitialMigration();
        } else {
            const status = JSON.parse(migrationStatus);
            if (status.version !== this.migrationVersion) {
                console.log('🔄 Nova versão detectada - executando migração');
                await this.performVersionMigration(status.version);
            }
        }
    }

    /**
     * Executa a migração inicial de dados.
     * Migra produtos do `database.js` global para o novo formato e cria estruturas de dados necessárias.
     */
    async performInitialMigration() {
        console.log('📦 Executando migração inicial...');
        
        await this.migrateProdutos();
        
        await this.createDataStructures();
        
        localStorage.setItem('roxinho_migration_status', JSON.stringify({
            version: this.migrationVersion,
            migrated_at: new Date().toISOString(),
            initial_migration: true
        }));
        
        console.log('✅ Migração inicial concluída');
    }

    /**
     * Migra produtos existentes do `window.produtos` (ou produtos padrão) para o `localStorage`.
     */
    async migrateProdutos() {
        console.log('📦 Migrando produtos existentes...');
        
        const produtosAdmin = localStorage.getItem('roxinho_produtos_admin');
        if (produtosAdmin) {
            console.log('ℹ️ Produtos já migrados anteriormente');
            return;
        }

        let produtosOriginais = [];
        if (window.produtos && Array.isArray(window.produtos)) {
            produtosOriginais = window.produtos;
        } else {
            produtosOriginais = this.getDefaultProducts();
        }

        const produtosMigrados = produtosOriginais.map(produto => ({
            id: produto.id,
            nome: produto.nome,
            marca: produto.marca || 'Sem marca',
            preco: produto.preco || 0,
            precoOriginal: produto.precoOriginal || produto.preco,
            precoPromocional: produto.precoPromocional || null,
            avaliacao: produto.avaliacao || 0,
            avaliacoes: produto.avaliacoes || 0,
            imagem: produto.imagem || './imagens/placeholder.jpg',
            categoria: produto.categoria || 'Sem categoria',
            subcategoria: produto.subcategoria || null,
            emEstoque: produto.emEstoque !== false,
            estoque: produto.estoque || (produto.emEstoque ? 10 : 0),
            freteGratis: produto.freteGratis || false,
            parcelamento: produto.parcelamento || null,
            desconto: produto.desconto || 0,
            destaque: produto.destaque || false,
            tags: produto.tags || [],
            condicao: produto.condicao || 'Novo',
            garantia: produto.garantia || '1 ano',
            descricao: produto.descricao || '',
            descricao_curta: produto.descricao_curta || produto.descricao || '',
            especificacoes: produto.especificacoes || [],
            sku: produto.sku || `SKU-${produto.id}`,
            peso: produto.peso || null,
            dimensoes: produto.dimensoes || null,
            galeria_imagens: produto.galeria_imagens || [],
            ativo: produto.emEstoque !== false,
            data_criacao: new Date().toISOString(),
            data_atualizacao: new Date().toISOString()
        }));

        localStorage.setItem('roxinho_produtos_admin', JSON.stringify(produtosMigrados));
        
        console.log(`✅ ${produtosMigrados.length} produtos migrados com sucesso`);
    }

    /**
     * Cria estruturas de dados padrão no localStorage se ainda não existirem.
     * Inclui categorias padrão, pedidos e configurações.
     */
    async createDataStructures() {
        console.log('🏗️ Criando estruturas de dados...');
        
        if (!localStorage.getItem('roxinho_categorias')) {
            const categoriasDefault = [
                {
                    id: 1,
                    nome: 'Hardware',
                    slug: 'hardware',
                    descricao: 'Componentes para computadores',
                    icone: 'fas fa-microchip',
                    ativo: true,
                    ordem: 1,
                    data_criacao: new Date().toISOString()
                },
                {
                    id: 2,
                    nome: 'Periféricos',
                    slug: 'perifericos',
                    descricao: 'Acessórios e periféricos',
                    icone: 'fas fa-keyboard',
                    ativo: true,
                    ordem: 2,
                    data_criacao: new Date().toISOString()
                },
                {
                    id: 3,
                    nome: 'Computadores',
                    slug: 'computadores',
                    descricao: 'Computadores completos',
                    icone: 'fas fa-desktop',
                    ativo: true,
                    ordem: 3,
                    data_criacao: new Date().toISOString()
                },
                {
                    id: 4,
                    nome: 'Celular & Smartphone',
                    slug: 'celular-smartphone',
                    descricao: 'Smartphones e acessórios',
                    icone: 'fas fa-mobile-alt',
                    ativo: true,
                    ordem: 4,
                    data_criacao: new Date().toISOString()
                }
            ];
            
            localStorage.setItem('roxinho_categorias', JSON.stringify(categoriasDefault));
            console.log('✅ Categorias padrão criadas');
        }

        if (!localStorage.getItem('roxinho_pedidos')) {
            localStorage.setItem('roxinho_pedidos', JSON.stringify([]));
        }

        if (!localStorage.getItem('roxinho_configuracoes')) {
            const configDefault = {
                site_name: 'Roxinho Shop',
                site_description: 'E-commerce de eletrônicos',
                currency: 'BRL',
                timezone: 'America/Sao_Paulo',
                email_notifications: true,
                maintenance_mode: false,
                created_at: new Date().toISOString()
            };
            localStorage.setItem('roxinho_configuracoes', JSON.stringify(configDefault));
        }
    }

    /**
     * Sincroniza os dados com o "banco de dados" existente (localStorage).
     * Garante que usuários e pedidos estejam atualizados.
     */
    async syncWithExistingDatabase() {
        console.log('🔄 Sincronizando com banco de dados existente...');
        
        if (window.dataAccess) {
            try {
                await this.syncUsers();
                await this.syncOrders();
                
                console.log('✅ Sincronização concluída');
            } catch (error) {
                console.warn('⚠️ Erro na sincronização:', error);
            }
        } else {
            console.log('ℹ️ Sistema dataAccess não encontrado - usando apenas localStorage');
        }
    }

    /**
     * Sincroniza os usuários, garantindo a criação de um administrador padrão se nenhum existir.
     */
    async syncUsers() {
        const usuariosExistentes = JSON.parse(localStorage.getItem('roxinho_usuarios') || '[]');
        
        if (usuariosExistentes.length === 0) {
            console.log('👤 Criando usuário administrador padrão...');
            
            if (window.authSystem) {
                await window.authSystem.createDefaultAdmin();
            }
        }
        
        console.log(`👥 ${usuariosExistentes.length} usuários sincronizados`);
    }

    /**
     * Sincroniza os pedidos existentes no localStorage.
     */
    async syncOrders() {
        const pedidosExistentes = JSON.parse(localStorage.getItem('roxinho_pedidos') || '[]');
        console.log(`🛒 ${pedidosExistentes.length} pedidos sincronizados`);
    }

    /**
     * Executa migrações de dados específicas para diferentes versões.
     * @param {string} fromVersion - A versão de onde a migração está sendo feita.
     */
    async performVersionMigration(fromVersion) {
        console.log(`🔄 Migrando da versão ${fromVersion} para ${this.migrationVersion}...`);
        
        switch (fromVersion) {
            case '0.9.0':
                await this.migrateFrom090();
                break;
            default:
                console.log('ℹ️ Nenhuma migração específica necessária');
        }
        
        localStorage.setItem('roxinho_migration_status', JSON.stringify({
            version: this.migrationVersion,
            migrated_at: new Date().toISOString(),
            previous_version: fromVersion
        }));
    }

    /**
     * Migração específica da versão 0.9.0.
     * Adiciona novos campos SEO aos produtos existentes.
     */
    async migrateFrom090() {
        console.log('🔄 Executando migração específica da v0.9.0...');
        
        const produtos = JSON.parse(localStorage.getItem('roxinho_produtos_admin') || '[]');
        const produtosAtualizados = produtos.map(produto => ({
            ...produto,
            seo_title: produto.seo_title || produto.nome,
            seo_description: produto.seo_description || produto.descricao_curta,
            meta_keywords: produto.meta_keywords || produto.tags?.join(', ') || ''
        }));
        
        localStorage.setItem('roxinho_produtos_admin', JSON.stringify(produtosAtualizados));
        console.log('✅ Produtos atualizados com novos campos SEO');
    }

    /**
     * Retorna uma lista de produtos padrão para inicialização do sistema.
     * @returns {Array<object>} Um array de objetos de produtos.
     */
    getDefaultProducts() {
        return [
            {
                id: 1,
                nome: 'Placa de Vídeo RTX 4070 Super 12GB GDDR6X',
                marca: 'NVIDIA',
                preco: 3299.99,
                precoOriginal: 3699.99,
                avaliacao: 0,
                avaliacoes: 0,
                imagem: './imagens/thumbs/produto1.webp',
                categoria: 'Hardware',
                subcategoria: 'Placas de Vídeo',
                emEstoque: true,
                freteGratis: true,
                parcelamento: '12x de R$ 274,99',
                desconto: 11,
                destaque: true,
                tags: ['Gamer', 'Ray Tracing', '12GB VRAM'],
                condicao: 'Novo',
                garantia: '3 anos',
                descricao: 'Placa de vídeo de alto desempenho para games e criação de conteúdo com tecnologia Ray Tracing e 12GB de memória GDDR6X.',
                descricao_curta: 'Placa de vídeo de alto desempenho para games e criação de conteúdo.',
                especificacoes: [
                    { nome: 'Memória', valor: '12GB GDDR6X' },
                    { nome: 'Interface', valor: 'PCI Express 4.0' },
                    { nome: 'Conectores', valor: 'HDMI 2.1, 3x DisplayPort 1.4a' },
                    { nome: 'Refrigeração', valor: 'Dual Fan' }
                ],
                sku: 'SKU-001',
                peso: 1.5,
                dimensoes: '242 x 112 x 40 mm',
                galeria_imagens: [],
                ativo: true,
                data_criacao: new Date().toISOString(),
                data_atualizacao: new Date().toISOString()
            },
            {
                id: 2,
                nome: 'Processador AMD Ryzen 7 7700X 4.5GHz',
                marca: 'AMD',
                preco: 1899.99,
                precoOriginal: 2199.99,
                avaliacao: 0,
                avaliacoes: 0,
                imagem: './imagens/thumbs/produto2.webp',
                categoria: 'Hardware',
                subcategoria: 'Processadores',
                emEstoque: true,
                freteGratis: true,
                parcelamento: '10x de R$ 189,99',
                desconto: 14,
                destaque: true,
                tags: ['8 Cores', 'AM5', 'Gaming'],
                condicao: 'Novo',
                garantia: '3 anos',
                descricao: 'Processador de 8 núcleos e 16 threads para alto desempenho em jogos e tarefas intensivas, com socket AM5 e frequência de 4.5 GHz.',
                descricao_curta: 'Processador de 8 núcleos e 16 threads para alto desempenho.',
                especificacoes: [
                    { nome: 'Cores/Threads', valor: '8/16' },
                    { nome: 'Frequência Base', valor: '4.5 GHz' },
                    { nome: 'Socket', valor: 'AM5' },
                    { nome: 'TDP', valor: '105W' }
                ],
                sku: 'SKU-002',
                peso: 0.3,
                dimensoes: '40 x 40 x 5 mm',
                galeria_imagens: [],
                ativo: true,
                data_criacao: new Date().toISOString(),
                data_atualizacao: new Date().toISOString()
            }
        ];
    }

    /**
     * Cria um backup completo dos dados do localStorage.
     * @returns {Promise<object>} O objeto de backup criado.
     */
    async createBackup() {
        console.log('💾 Criando backup dos dados...');
        
        const backup = {
            timestamp: new Date().toISOString(),
            version: this.migrationVersion,
            data: {
                produtos: JSON.parse(localStorage.getItem('roxinho_produtos_admin') || '[]'),
                usuarios: JSON.parse(localStorage.getItem('roxinho_usuarios') || '[]'),
                pedidos: JSON.parse(localStorage.getItem('roxinho_pedidos') || '[]'),
                categorias: JSON.parse(localStorage.getItem('roxinho_categorias') || '[]'),
                configuracoes: JSON.parse(localStorage.getItem('roxinho_configuracoes') || '{}')
            }
        };
        
        localStorage.setItem('roxinho_backup_' + Date.now(), JSON.stringify(backup));
        
        console.log('✅ Backup criado com sucesso');
        return backup;
    }

    /**
     * Restaura os dados a partir de um objeto de backup.
     * @param {object} backupData - O objeto de backup a ser restaurado.
     * @returns {Promise<boolean>} True se o backup foi restaurado com sucesso, false caso contrário.
     */
    async restoreBackup(backupData) {
        console.log('🔄 Restaurando backup...');
        
        try {
            if (backupData.data.produtos) {
                localStorage.setItem('roxinho_produtos_admin', JSON.stringify(backupData.data.produtos));
            }
            
            if (backupData.data.usuarios) {
                localStorage.setItem('roxinho_usuarios', JSON.stringify(backupData.data.usuarios));
            }
            
            if (backupData.data.pedidos) {
                localStorage.setItem('roxinho_pedidos', JSON.stringify(backupData.data.pedidos));
            }
            
            if (backupData.data.categorias) {
                localStorage.setItem('roxinho_categorias', JSON.stringify(backupData.data.categorias));
            }
            
            if (backupData.data.configuracoes) {
                localStorage.setItem('roxinho_configuracoes', JSON.stringify(backupData.data.configuracoes));
            }
            
            console.log('✅ Backup restaurado com sucesso');
            return true;
        } catch (error) {
            console.error('❌ Erro ao restaurar backup:', error);
            return false;
        }
    }

    /**
     * Limpa dados antigos, como backups excedentes, para manter o localStorage organizado.
     */
    async cleanupOldData() {
        console.log('🧹 Limpando dados antigos...');
        
        const allKeys = Object.keys(localStorage);
        const backupKeys = allKeys.filter(key => key.startsWith('roxinho_backup_')).sort();
        
        if (backupKeys.length > 5) {
            const keysToRemove = backupKeys.slice(0, backupKeys.length - 5);
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
                console.log(`🗑️ Backup antigo removido: ${key}`);
            });
        }
        
        console.log('✅ Limpeza concluída');
    }

    /**
     * Verifica a integridade dos dados armazenados no localStorage.
     * Identifica e reporta possíveis inconsistências ou dados corrompidos.
     * @returns {Promise<Array<string>>} Um array de strings descrevendo os problemas encontrados.
     */
    async verifyDataIntegrity() {
        console.log('🔍 Verificando integridade dos dados...');
        
        const issues = [];
        
        try {
            const produtos = JSON.parse(localStorage.getItem('roxinho_produtos_admin') || '[]');
            if (!Array.isArray(produtos)) {
                issues.push('Produtos: Dados não são um array.');
            }
            produtos.forEach(p => {
                if (!p.id || !p.nome || !p.preco) {
                    issues.push(`Produto ID ${p.id || 'desconhecido'}: Faltando campos essenciais.`);
                }
            });

            const usuarios = JSON.parse(localStorage.getItem('roxinho_usuarios') || '[]');
            if (!Array.isArray(usuarios)) {
                issues.push('Usuários: Dados não são um array.');
            }
            usuarios.forEach(u => {
                if (!u.id || !u.email || !u.senha_hash) {
                    issues.push(`Usuário ID ${u.id || 'desconhecido'}: Faltando campos essenciais.`);
                }
            });

            const pedidos = JSON.parse(localStorage.getItem('roxinho_pedidos') || '[]');
            if (!Array.isArray(pedidos)) {
                issues.push('Pedidos: Dados não são um array.');
            }
            pedidos.forEach(o => {
                if (!o.id || !o.userId || !o.total) {
                    issues.push(`Pedido ID ${o.id || 'desconhecido'}: Faltando campos essenciais.`);
                }
            });

            const categorias = JSON.parse(localStorage.getItem('roxinho_categorias') || '[]');
            if (!Array.isArray(categorias)) {
                issues.push('Categorias: Dados não são um array.');
            }
            categorias.forEach(c => {
                if (!c.id || !c.nome) {
                    issues.push(`Categoria ID ${c.id || 'desconhecido'}: Faltando campos essenciais.`);
                }
            });

            const configuracoes = JSON.parse(localStorage.getItem('roxinho_configuracoes') || '{}');
            if (typeof configuracoes !== 'object' || configuracoes === null) {
                issues.push('Configurações: Dados não são um objeto válido.');
            }

        } catch (error) {
            issues.push(`Erro geral na verificação de integridade: ${error.message}`);
            console.error('Erro na verificação de integridade:', error);
        }
        
        if (issues.length === 0) {
            console.log('✅ Integridade dos dados verificada: Nenhuma inconsistência encontrada.');
        } else {
            console.warn('⚠️ Integridade dos dados verificada: Inconsistências encontradas.', issues);
        }

        return issues;
    }
}

// Instanciar o sistema de integração de dados globalmente
window.dataIntegration = new DataIntegration();

console.log('🔄 data-integration.js carregado');
