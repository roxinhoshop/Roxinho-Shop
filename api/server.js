const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { pool, testarConexao, criarTabelas, inserirCategoriasPadrao } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ======================= ROTAS DE PRODUTOS =======================

// Listar todos os produtos
app.get('/api/produtos', async (req, res) => {
    try {
        const { categoria, subcategoria, busca, ordenar, limite, pagina } = req.query;
        
        let query = 'SELECT * FROM produtos WHERE ativo = true';
        const params = [];
        
        if (categoria) {
            query += ' AND categoria = ?';
            params.push(categoria);
        }
        
        if (subcategoria) {
            query += ' AND subcategoria = ?';
            params.push(subcategoria);
        }
        
        if (busca) {
            query += ' AND (nome LIKE ? OR descricao LIKE ?)';
            params.push(`%${busca}%`, `%${busca}%`);
        }
        
        // Ordenação
        switch (ordenar) {
            case 'preco-asc':
                query += ' ORDER BY preco ASC';
                break;
            case 'preco-desc':
                query += ' ORDER BY preco DESC';
                break;
            case 'nome-asc':
                query += ' ORDER BY nome ASC';
                break;
            case 'nome-desc':
                query += ' ORDER BY nome DESC';
                break;
            case 'recentes':
                query += ' ORDER BY data_criacao DESC';
                break;
            default:
                query += ' ORDER BY data_criacao DESC';
        }
        
        // Paginação
        if (limite) {
            const lim = parseInt(limite);
            const pag = parseInt(pagina || 1);
            const offset = (pag - 1) * lim;
            query += ' LIMIT ? OFFSET ?';
            params.push(lim, offset);
        }
        
        const [produtos] = await pool.query(query, params);
        
        res.json({
            success: true,
            total: produtos.length,
            produtos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar produtos',
            error: error.message
        });
    }
});

// Buscar produto por ID
app.get('/api/produtos/:id', async (req, res) => {
    try {
        const [produtos] = await pool.query(
            'SELECT * FROM produtos WHERE id = ?',
            [req.params.id]
        );
        
        if (produtos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Produto não encontrado'
            });
        }
        
        res.json({
            success: true,
            produto: produtos[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar produto',
            error: error.message
        });
    }
});

// Criar novo produto
app.post('/api/produtos', async (req, res) => {
    try {
        const {
            nome,
            descricao,
            preco,
            imagem,
            categoria,
            subcategoria,
            origem,
            link_original,
            estoque
        } = req.body;
        
        // Validações
        if (!nome || !preco || !categoria) {
            return res.status(400).json({
                success: false,
                message: 'Nome, preço e categoria são obrigatórios'
            });
        }
        
        // Gerar ID único
        const id = 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        await pool.query(
            `INSERT INTO produtos 
            (id, nome, descricao, preco, imagem, categoria, subcategoria, origem, link_original, estoque)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, nome, descricao, preco, imagem, categoria, subcategoria, origem, link_original, estoque || 0]
        );
        
        res.status(201).json({
            success: true,
            message: 'Produto criado com sucesso',
            id
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao criar produto',
            error: error.message
        });
    }
});

// Atualizar produto
app.put('/api/produtos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nome,
            descricao,
            preco,
            imagem,
            categoria,
            subcategoria,
            origem,
            link_original,
            estoque,
            ativo
        } = req.body;
        
        const campos = [];
        const valores = [];
        
        if (nome !== undefined) { campos.push('nome = ?'); valores.push(nome); }
        if (descricao !== undefined) { campos.push('descricao = ?'); valores.push(descricao); }
        if (preco !== undefined) { campos.push('preco = ?'); valores.push(preco); }
        if (imagem !== undefined) { campos.push('imagem = ?'); valores.push(imagem); }
        if (categoria !== undefined) { campos.push('categoria = ?'); valores.push(categoria); }
        if (subcategoria !== undefined) { campos.push('subcategoria = ?'); valores.push(subcategoria); }
        if (origem !== undefined) { campos.push('origem = ?'); valores.push(origem); }
        if (link_original !== undefined) { campos.push('link_original = ?'); valores.push(link_original); }
        if (estoque !== undefined) { campos.push('estoque = ?'); valores.push(estoque); }
        if (ativo !== undefined) { campos.push('ativo = ?'); valores.push(ativo); }
        
        if (campos.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Nenhum campo para atualizar'
            });
        }
        
        valores.push(id);
        
        const [result] = await pool.query(
            `UPDATE produtos SET ${campos.join(', ')} WHERE id = ?`,
            valores
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Produto não encontrado'
            });
        }
        
        res.json({
            success: true,
            message: 'Produto atualizado com sucesso'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar produto',
            error: error.message
        });
    }
});

// Excluir produto (soft delete)
app.delete('/api/produtos/:id', async (req, res) => {
    try {
        const [result] = await pool.query(
            'UPDATE produtos SET ativo = false WHERE id = ?',
            [req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Produto não encontrado'
            });
        }
        
        res.json({
            success: true,
            message: 'Produto excluído com sucesso'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao excluir produto',
            error: error.message
        });
    }
});

// Excluir produto permanentemente
app.delete('/api/produtos/:id/permanente', async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM produtos WHERE id = ?',
            [req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Produto não encontrado'
            });
        }
        
        res.json({
            success: true,
            message: 'Produto excluído permanentemente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao excluir produto',
            error: error.message
        });
    }
});

// ======================= ROTAS DE CATEGORIAS =======================

// Listar categorias
app.get('/api/categorias', async (req, res) => {
    try {
        const [categorias] = await pool.query(
            'SELECT * FROM categorias WHERE ativo = true ORDER BY nome'
        );
        
        res.json({
            success: true,
            categorias
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar categorias',
            error: error.message
        });
    }
});

// Listar subcategorias de uma categoria
app.get('/api/categorias/:slug/subcategorias', async (req, res) => {
    try {
        const [subcategorias] = await pool.query(
            'SELECT * FROM subcategorias WHERE categoria_slug = ? AND ativo = true ORDER BY nome',
            [req.params.slug]
        );
        
        res.json({
            success: true,
            subcategorias
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar subcategorias',
            error: error.message
        });
    }
});

// ======================= ROTAS DE ESTATÍSTICAS =======================

// Estatísticas gerais
app.get('/api/estatisticas', async (req, res) => {
    try {
        const [totalResult] = await pool.query(
            'SELECT COUNT(*) as total FROM produtos WHERE ativo = true'
        );
        
        const [porCategoria] = await pool.query(
            'SELECT categoria, COUNT(*) as total FROM produtos WHERE ativo = true GROUP BY categoria'
        );
        
        const [porOrigem] = await pool.query(
            'SELECT origem, COUNT(*) as total FROM produtos WHERE ativo = true GROUP BY origem'
        );
        
        const [valorTotal] = await pool.query(
            'SELECT SUM(preco) as total, AVG(preco) as media FROM produtos WHERE ativo = true'
        );
        
        res.json({
            success: true,
            estatisticas: {
                total: totalResult[0].total,
                porCategoria: porCategoria.reduce((acc, item) => {
                    acc[item.categoria] = item.total;
                    return acc;
                }, {}),
                porOrigem: porOrigem.reduce((acc, item) => {
                    acc[item.origem] = item.total;
                    return acc;
                }, {}),
                valorTotal: valorTotal[0].total || 0,
                precoMedio: valorTotal[0].media || 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar estatísticas',
            error: error.message
        });
    }
});

// ======================= INICIALIZAÇÃO =======================

async function iniciarServidor() {
    try {
        // Testar conexão
        await testarConexao();
        
        // Criar tabelas
        await criarTabelas();
        
        // Inserir categorias padrão
        await inserirCategoriasPadrao();
        
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`🚀 API rodando em http://localhost:${PORT}`);
            console.log(`📊 Endpoints disponíveis:`);
            console.log(`   GET    /api/produtos`);
            console.log(`   GET    /api/produtos/:id`);
            console.log(`   POST   /api/produtos`);
            console.log(`   PUT    /api/produtos/:id`);
            console.log(`   DELETE /api/produtos/:id`);
            console.log(`   GET    /api/categorias`);
            console.log(`   GET    /api/categorias/:slug/subcategorias`);
            console.log(`   GET    /api/estatisticas`);
        });
    } catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

iniciarServidor();

