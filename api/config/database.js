const mysql = require('mysql2/promise');
require('dotenv').config();

// Criar pool de conexões
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Testar conexão
async function testarConexao() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conectado ao MySQL Railway com sucesso!');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Erro ao conectar ao MySQL:', error.message);
        return false;
    }
}

// Criar tabelas se não existirem
async function criarTabelas() {
    try {
        const connection = await pool.getConnection();
        
        // Tabela de produtos
        await connection.query(`
            CREATE TABLE IF NOT EXISTS produtos (
                id VARCHAR(50) PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                descricao TEXT,
                preco DECIMAL(10, 2) NOT NULL,
                imagem VARCHAR(500),
                categoria VARCHAR(100),
                subcategoria VARCHAR(100),
                origem VARCHAR(50),
                link_original VARCHAR(500),
                estoque INT DEFAULT 0,
                ativo BOOLEAN DEFAULT true,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        // Tabela de categorias
        await connection.query(`
            CREATE TABLE IF NOT EXISTS categorias (
                id INT AUTO_INCREMENT PRIMARY KEY,
                slug VARCHAR(100) UNIQUE NOT NULL,
                nome VARCHAR(100) NOT NULL,
                descricao TEXT,
                icone VARCHAR(50),
                ativo BOOLEAN DEFAULT true
            )
        `);
        
        // Tabela de subcategorias
        await connection.query(`
            CREATE TABLE IF NOT EXISTS subcategorias (
                id INT AUTO_INCREMENT PRIMARY KEY,
                categoria_slug VARCHAR(100) NOT NULL,
                nome VARCHAR(100) NOT NULL,
                ativo BOOLEAN DEFAULT true,
                FOREIGN KEY (categoria_slug) REFERENCES categorias(slug) ON DELETE CASCADE
            )
        `);
        
        console.log('✅ Tabelas criadas/verificadas com sucesso!');
        connection.release();
    } catch (error) {
        console.error('❌ Erro ao criar tabelas:', error.message);
    }
}

// Inserir categorias padrão
async function inserirCategoriasPadrao() {
    try {
        const connection = await pool.getConnection();
        
        const categorias = [
            { slug: 'eletronicos', nome: 'Eletrônicos', icone: 'fas fa-mobile-alt' },
            { slug: 'informatica', nome: 'Informática', icone: 'fas fa-laptop' },
            { slug: 'games', nome: 'Games', icone: 'fas fa-gamepad' },
            { slug: 'hardware', nome: 'Hardware', icone: 'fas fa-microchip' },
            { slug: 'perifericos', nome: 'Periféricos', icone: 'fas fa-keyboard' },
            { slug: 'casa-inteligente', nome: 'Casa Inteligente', icone: 'fas fa-home' },
            { slug: 'audio-video', nome: 'Áudio e Vídeo', icone: 'fas fa-tv' },
            { slug: 'redes', nome: 'Redes', icone: 'fas fa-wifi' },
            { slug: 'armazenamento', nome: 'Armazenamento', icone: 'fas fa-hdd' },
            { slug: 'escritorio', nome: 'Escritório', icone: 'fas fa-chair' },
            { slug: 'acessorios', nome: 'Acessórios', icone: 'fas fa-plug' }
        ];
        
        for (const cat of categorias) {
            await connection.query(
                'INSERT IGNORE INTO categorias (slug, nome, icone) VALUES (?, ?, ?)',
                [cat.slug, cat.nome, cat.icone]
            );
        }
        
        // Subcategorias
        const subcategorias = [
            // Eletrônicos
            { categoria_slug: 'eletronicos', nome: 'Smartphones' },
            { categoria_slug: 'eletronicos', nome: 'Tablets' },
            { categoria_slug: 'eletronicos', nome: 'Smartwatches' },
            { categoria_slug: 'eletronicos', nome: 'Fones de Ouvido' },
            // Informática
            { categoria_slug: 'informatica', nome: 'Notebooks' },
            { categoria_slug: 'informatica', nome: 'Computadores' },
            { categoria_slug: 'informatica', nome: 'Monitores' },
            { categoria_slug: 'informatica', nome: 'Teclados' },
            { categoria_slug: 'informatica', nome: 'Mouses' },
            // Games
            { categoria_slug: 'games', nome: 'Consoles' },
            { categoria_slug: 'games', nome: 'Jogos' },
            { categoria_slug: 'games', nome: 'Controles' },
            { categoria_slug: 'games', nome: 'Headsets' },
            { categoria_slug: 'games', nome: 'Cadeiras Gamer' },
            // Hardware
            { categoria_slug: 'hardware', nome: 'Processadores' },
            { categoria_slug: 'hardware', nome: 'Placas de Vídeo' },
            { categoria_slug: 'hardware', nome: 'Memória RAM' },
            { categoria_slug: 'hardware', nome: 'SSDs' },
            { categoria_slug: 'hardware', nome: 'Fontes' },
            // Periféricos
            { categoria_slug: 'perifericos', nome: 'Impressoras' },
            { categoria_slug: 'perifericos', nome: 'Webcams' },
            { categoria_slug: 'perifericos', nome: 'Microfones' },
            // Casa Inteligente
            { categoria_slug: 'casa-inteligente', nome: 'Assistentes' },
            { categoria_slug: 'casa-inteligente', nome: 'Câmeras' },
            { categoria_slug: 'casa-inteligente', nome: 'Lâmpadas' },
            // Áudio e Vídeo
            { categoria_slug: 'audio-video', nome: 'TVs' },
            { categoria_slug: 'audio-video', nome: 'Soundbars' },
            { categoria_slug: 'audio-video', nome: 'Projetores' },
            // Redes
            { categoria_slug: 'redes', nome: 'Roteadores' },
            { categoria_slug: 'redes', nome: 'Switches' },
            { categoria_slug: 'redes', nome: 'Access Points' },
            // Armazenamento
            { categoria_slug: 'armazenamento', nome: 'HDs Externos' },
            { categoria_slug: 'armazenamento', nome: 'Pendrives' },
            { categoria_slug: 'armazenamento', nome: 'SSDs Externos' },
            // Escritório
            { categoria_slug: 'escritorio', nome: 'Cadeiras' },
            { categoria_slug: 'escritorio', nome: 'Mesas' },
            { categoria_slug: 'escritorio', nome: 'Suportes' },
            // Acessórios
            { categoria_slug: 'acessorios', nome: 'Capas' },
            { categoria_slug: 'acessorios', nome: 'Carregadores' },
            { categoria_slug: 'acessorios', nome: 'Cabos' }
        ];
        
        for (const sub of subcategorias) {
            await connection.query(
                'INSERT IGNORE INTO subcategorias (categoria_slug, nome) VALUES (?, ?)',
                [sub.categoria_slug, sub.nome]
            );
        }
        
        console.log('✅ Categorias e subcategorias inseridas!');
        connection.release();
    } catch (error) {
        console.error('❌ Erro ao inserir categorias:', error.message);
    }
}

module.exports = {
    pool,
    testarConexao,
    criarTabelas,
    inserirCategoriasPadrao
};

