// ===== Roxinho Shop - E-COMMERCE DE ELETRÔNICOS =====
// Desenvolvido por Gabriel (gabwvr)
// Este arquivo contém funções para gerenciar [FUNCIONALIDADE]
// Comentários didáticos para facilitar o entendimento


// ===== CONFIGURAÇÃO DE BANCO DE DADOS - Roxinho Shop =====

/**
 * Configuração para integração com banco de dados
 * Este arquivo prepara a estrutura para futuras integrações com BD
 */

// ===== CONFIGURAÇÕES DE CONEXÃO =====
const DB_CONFIG = {
  // Configurações para desenvolvimento local
  development: {
    host: 'localhost',
    port: 3306,
    database: 'roxinhoshop_store',
    username: 'root',
    password: '',
    dialect: 'mysql',
    logging: true
  },
  
  // Configurações para produção
  production: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'roxinhoshop_store',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};

// ===== ESTRUTURA DAS TABELAS =====
const DB_SCHEMA = {
  // Tabela de usuários
  usuarios: {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    nome: 'VARCHAR(100) NOT NULL',
    sobrenome: 'VARCHAR(100) NOT NULL',
    email: 'VARCHAR(150) UNIQUE NOT NULL',
    senha_hash: 'VARCHAR(255) NOT NULL',
    telefone: 'VARCHAR(20)',
    data_nascimento: 'DATE',
    cpf: 'VARCHAR(14)',
    email_verificado: 'BOOLEAN DEFAULT FALSE',
    ativo: 'BOOLEAN DEFAULT TRUE',
    data_criacao: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    data_atualizacao: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    

  },

  // Tabela de endereços
  enderecos: {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    usuario_id: 'INT NOT NULL',
    nome: 'VARCHAR(100) NOT NULL',
    cep: 'VARCHAR(10) NOT NULL',
    rua: 'VARCHAR(200) NOT NULL',
    numero: 'VARCHAR(20) NOT NULL',
    complemento: 'VARCHAR(100)',
    bairro: 'VARCHAR(100) NOT NULL',
    cidade: 'VARCHAR(100) NOT NULL',
    estado: 'VARCHAR(2) NOT NULL',
    principal: 'BOOLEAN DEFAULT FALSE',
    data_criacao: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    
    // Chaves estrangeiras
    'FOREIGN KEY (usuario_id)': 'REFERENCES usuarios(id) ON DELETE CASCADE'
  },

  // Tabela de categorias
  categorias: {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    nome: 'VARCHAR(100) NOT NULL',
    slug: 'VARCHAR(100) UNIQUE NOT NULL',
    descricao: 'TEXT',
    icone: 'VARCHAR(50)',
    categoria_pai_id: 'INT',
    ativo: 'BOOLEAN DEFAULT TRUE',
    ordem: 'INT DEFAULT 0',
    data_criacao: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    
    // Chaves estrangeiras
    'FOREIGN KEY (categoria_pai_id)': 'REFERENCES categorias(id) ON DELETE SET NULL'
  },

  // Tabela de produtos
  produtos: {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    nome: 'VARCHAR(200) NOT NULL',
    slug: 'VARCHAR(200) UNIQUE NOT NULL',
    descricao: 'TEXT',
    descricao_curta: 'VARCHAR(500)',
    categoria_id: 'INT NOT NULL',
    marca: 'VARCHAR(100)',
    modelo: 'VARCHAR(100)',
    sku: 'VARCHAR(50) UNIQUE',
    preco: 'DECIMAL(10,2) NOT NULL',
    preco_promocional: 'DECIMAL(10,2)',
    estoque: 'INT DEFAULT 0',
    peso: 'DECIMAL(8,3)',
    dimensoes: 'VARCHAR(100)',
    imagem_principal: 'VARCHAR(255)',
    galeria_imagens: 'JSON',
    especificacoes: 'JSON',
    ativo: 'BOOLEAN DEFAULT TRUE',
    destaque: 'BOOLEAN DEFAULT FALSE',
    data_criacao: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    data_atualizacao: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    
    // Chaves estrangeiras
    'FOREIGN KEY (categoria_id)': 'REFERENCES categorias(id)'
  },

  // Tabela de pedidos
  pedidos: {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    numero_pedido: 'VARCHAR(50) UNIQUE NOT NULL',
    usuario_id: 'INT NOT NULL',
    status: 'ENUM("pendente", "confirmado", "processando", "enviado", "entregue", "cancelado") DEFAULT "pendente"',
    subtotal: 'DECIMAL(10,2) NOT NULL',
    desconto: 'DECIMAL(10,2) DEFAULT 0',
    frete: 'DECIMAL(10,2) DEFAULT 0',
    total: 'DECIMAL(10,2) NOT NULL',
    
    // Dados de entrega
    endereco_entrega: 'JSON NOT NULL',
    
    // Dados de pagamento
    forma_pagamento: 'VARCHAR(50) NOT NULL',
    status_pagamento: 'ENUM("pendente", "aprovado", "rejeitado", "cancelado") DEFAULT "pendente"',

    
    // Timestamps
    data_pedido: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    data_confirmacao: 'TIMESTAMP NULL',
    data_envio: 'TIMESTAMP NULL',
    data_entrega: 'TIMESTAMP NULL',
    
    // Chaves estrangeiras
    'FOREIGN KEY (usuario_id)': 'REFERENCES usuarios(id)'
  },

  // Tabela de itens do pedido
  itens_pedido: {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    pedido_id: 'INT NOT NULL',
    produto_id: 'INT NOT NULL',
    quantidade: 'INT NOT NULL',
    preco_unitario: 'DECIMAL(10,2) NOT NULL',
    preco_total: 'DECIMAL(10,2) NOT NULL',
    
    // Chaves estrangeiras
    'FOREIGN KEY (pedido_id)': 'REFERENCES pedidos(id) ON DELETE CASCADE',
    'FOREIGN KEY (produto_id)': 'REFERENCES produtos(id)'
  },



  // Tabela de lista de desejos
  lista_desejos: {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    usuario_id: 'INT NOT NULL',
    produto_id: 'INT NOT NULL',
    data_adicao: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    
    // Chaves estrangeiras e índices únicos
    'FOREIGN KEY (usuario_id)': 'REFERENCES usuarios(id) ON DELETE CASCADE',
    'FOREIGN KEY (produto_id)': 'REFERENCES produtos(id) ON DELETE CASCADE',
    'UNIQUE KEY unique_wishlist': '(usuario_id, produto_id)'
  },

  // Tabela de carrinho (opcional, pode usar localStorage)
  carrinho: {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    usuario_id: 'INT',
    sessao_id: 'VARCHAR(100)',
    produto_id: 'INT NOT NULL',
    quantidade: 'INT NOT NULL',
    data_adicao: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    data_atualizacao: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    
    // Chaves estrangeiras
    'FOREIGN KEY (usuario_id)': 'REFERENCES usuarios(id) ON DELETE CASCADE',
    'FOREIGN KEY (produto_id)': 'REFERENCES produtos(id) ON DELETE CASCADE'
  }
};

// ===== DADOS INICIAIS (SEEDS) =====
const INITIAL_DATA = {
  // Categorias iniciais
  categorias: [
    {
      nome: 'Hardware',
      slug: 'hardware',
      descricao: 'Componentes para computadores',
      icone: 'fas fa-microchip',
      ordem: 1
    },
    {
      nome: 'Periféricos',
      slug: 'perifericos',
      descricao: 'Acessórios e periféricos',
      icone: 'fas fa-keyboard',
      ordem: 2
    },
    {
      nome: 'Computadores',
      slug: 'computadores',
      descricao: 'Computadores completos',
      icone: 'fas fa-desktop',
      ordem: 3
    }
  ],

  // Usuário administrador padrão
  admin_user: {
    nome: 'Administrador',
    sobrenome: 'Roxinho Shop',
    email: 'admin@roxinhoshop.com',
    senha: 'admin123', // Será hasheada
    email_verificado: true
  }
};

// ===== FUNÇÕES DE MIGRAÇÃO =====
class DatabaseMigration {
  constructor() {
    this.isInitialized = false;
  }

  // Simular criação de tabelas (para desenvolvimento frontend)
  async createTables() {
    console.log('🗄️ Criando estrutura do banco de dados...');
    
    // Simular criação das tabelas
    for (const [tableName, schema] of Object.entries(DB_SCHEMA)) {
      console.log(`📋 Criando tabela: ${tableName}`);
      
      // Em produção, aqui seria executado o SQL real
      // CREATE TABLE ${tableName} (${this.generateSQL(schema)})
    }
    
    console.log('✅ Estrutura do banco criada com sucesso!');
    return true;
  }

  // Inserir dados iniciais
  async seedDatabase() {
    console.log('🌱 Inserindo dados iniciais...');
    
    // Simular inserção de dados
    console.log('📂 Inserindo categorias...');
    console.log('👤 Criando usuário administrador...');
    
    console.log('✅ Dados iniciais inseridos com sucesso!');
    return true;
  }

  // Verificar se o banco está configurado
  async checkConnection() {
    console.log('🔌 Verificando conexão com banco de dados...');
    
    // Em produção, aqui seria testada a conexão real
    // Simular verificação
    const isConnected = true; // Simular sucesso
    
    if (isConnected) {
      console.log('✅ Conexão estabelecida com sucesso!');
      this.isInitialized = true;
    } else {
      console.error('❌ Falha na conexão com banco de dados');
    }
    
    return isConnected;
  }

  // Gerar SQL a partir do schema (helper)
  generateSQL(schema) {
    return Object.entries(schema)
      .map(([field, definition]) => `${field} ${definition}`)
      .join(', ');
  }
}

// ===== CLASSE DE ACESSO A DADOS =====
class DataAccess {
  constructor() {
    this.migration = new DatabaseMigration();
  }

  // Inicializar banco (para desenvolvimento)
  async initialize() {
    if (!this.migration.isInitialized) {
      await this.migration.checkConnection();
      await this.migration.createTables();
      await this.migration.seedDatabase();
    }
    
    console.log('🎯 Sistema de banco de dados pronto para uso!');
    return true;
  }

  // Métodos simulados para desenvolvimento (usando localStorage)
  
  // Usuários
  async createUser(userData) {
    const users = JSON.parse(localStorage.getItem('db_usuarios') || '[]');
    const newUser = {
      id: users.length + 1,
      ...userData,
      data_criacao: new Date().toISOString(),
      xp_total: 0,
      nivel_atual: 1,
      titulo_nivel: 'Novato'
    };
    
    users.push(newUser);
    localStorage.setItem('db_usuarios', JSON.stringify(users));
    
    console.log('👤 Usuário criado:', newUser);
    return newUser;
  }

  async getUserByEmail(email) {
    const users = JSON.parse(localStorage.getItem('db_usuarios') || '[]');
    return users.find(user => user.email === email);
  }

  // Pedidos
  async createOrder(orderData) {
    const orders = JSON.parse(localStorage.getItem('db_pedidos') || '[]');
    const newOrder = {
      id: orders.length + 1,
      numero_pedido: `ROX-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`,
      ...orderData,
      data_pedido: new Date().toISOString()
    };
    
    orders.push(newOrder);
    localStorage.setItem('db_pedidos', JSON.stringify(orders));
    
    console.log('🛒 Pedido criado:', newOrder);
    return newOrder;
  }


}

// ===== EXPORTAR PARA USO GLOBAL =====
window.DB_CONFIG = DB_CONFIG;
window.DB_SCHEMA = DB_SCHEMA;
window.INITIAL_DATA = INITIAL_DATA;
window.DatabaseMigration = DatabaseMigration;
window.DataAccess = DataAccess;

// Inicializar sistema de dados
const dataAccess = new DataAccess();
window.dataAccess = dataAccess;

// Auto-inicializar em desenvolvimento
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Inicializando sistema de banco de dados...');
  await dataAccess.initialize();
});

console.log('📊 Configuração de banco de dados carregada');

// ===== INSTRUÇÕES PARA PRODUÇÃO =====
/*
PARA INTEGRAR COM BANCO DE DADOS REAL:

1. Instalar dependências:
   npm install mysql2 sequelize
   
2. Configurar variáveis de ambiente:
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=roxinhoshop_store
   DB_USER=root
   DB_PASS=senha123
   
3. Executar migrações:
   - Usar as definições em DB_SCHEMA para criar as tabelas
   - Executar os seeds em INITIAL_DATA
   
4. Substituir localStorage por queries reais:
   - Usar Sequelize ORM ou queries SQL diretas
   - Implementar validações e sanitização
   - Adicionar índices para performance
   
5. Implementar autenticação:
   - JWT tokens
   - Hash de senhas com bcrypt
   - Validação de sessões
   
6. Configurar backup e monitoramento:
   - Backup automático diário
   - Logs de auditoria
   - Monitoramento de performance

Este arquivo já está preparado para facilitar a migração!
*/

