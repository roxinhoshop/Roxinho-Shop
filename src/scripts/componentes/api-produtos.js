// ======================= CLIENTE API DE PRODUTOS =======================

const API_URL = window.API_BASE_URL || 'https://roxinho-shop-backend.vercel.app/api';

// ======================= PRODUTOS =======================

// Listar produtos
async function listarProdutos(filtros = {}) {
    try {
        const params = new URLSearchParams();
        
        if (filtros.categoria) params.append('categoria', filtros.categoria);
        if (filtros.subcategoria) params.append('subcategoria', filtros.subcategoria);
        if (filtros.busca) params.append('busca', filtros.busca);
        if (filtros.ordenar) params.append('ordenar', filtros.ordenar);
        if (filtros.limite) params.append('limite', filtros.limite);
        if (filtros.pagina) params.append('pagina', filtros.pagina);
        
        const response = await fetch(`${API_URL}/produtos?${params}`);
        const data = await response.json();
        
        if (!data.success && data.status !== 'success' && !data.products && !data.produtos) {
            throw new Error(data.message || 'Erro ao carregar produtos');
        }
        
        // A API pode retornar 'products' ou 'produtos'
        const produtos = data.produtos || data.products || [];
        console.log('Produtos carregados:', produtos.length);
        return produtos;
    } catch (error) {
        console.error('Erro ao listar produtos:', error);
        await alertaFluent('Erro', 'Não foi possível carregar os produtos', 'fas fa-exclamation-triangle');
        return [];
    }
}

// Buscar produto por ID
async function buscarProduto(id) {
    try {
        const response = await fetch(`${API_URL}/produtos/${id}`);
        const data = await response.json();
        
        if (!data.success && data.status !== 'success') {
            throw new Error(data.message || 'Erro ao buscar produto');
        }
        
        // A API pode retornar 'product' ou 'produto'
        return data.produto || data.product || null;
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        return null;
    }
}

// Criar produto
async function criarProduto(produto) {
    try {
        const response = await fetch(`${API_URL}/produtos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(produto)
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message);
        }
        
        await alertaFluent('Sucesso!', 'Produto adicionado com sucesso', 'fas fa-check-circle');
        return data.id;
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        await alertaFluent('Erro', 'Não foi possível adicionar o produto', 'fas fa-exclamation-triangle');
        return null;
    }
}

// Atualizar produto
async function atualizarProduto(id, dados) {
    try {
        const response = await fetch(`${API_URL}/produtos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message);
        }
        
        await alertaFluent('Sucesso!', 'Produto atualizado com sucesso', 'fas fa-check-circle');
        return true;
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        await alertaFluent('Erro', 'Não foi possível atualizar o produto', 'fas fa-exclamation-triangle');
        return false;
    }
}

// Excluir produto
async function excluirProdutoAPI(id) {
    try {
        const confirmado = await confirmarFluent(
            'Excluir Produto',
            'Tem certeza que deseja excluir este produto?',
            'fas fa-trash-alt'
        );
        
        if (!confirmado) return false;
        
        const response = await fetch(`${API_URL}/produtos/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message);
        }
        
        await alertaFluent('Sucesso!', 'Produto excluído com sucesso', 'fas fa-check-circle');
        return true;
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        await alertaFluent('Erro', 'Não foi possível excluir o produto', 'fas fa-exclamation-triangle');
        return false;
    }
}

// ======================= CATEGORIAS =======================

// Listar categorias
async function listarCategorias() {
    try {
        const response = await fetch(`${API_URL}/categorias`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message);
        }
        
        return data.categorias;
    } catch (error) {
        console.error('Erro ao listar categorias:', error);
        return [];
    }
}

// Listar subcategorias
async function listarSubcategorias(categoriaSlug) {
    try {
        const response = await fetch(`${API_URL}/categorias/${categoriaSlug}/subcategorias`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message);
        }
        
        return data.subcategorias;
    } catch (error) {
        console.error('Erro ao listar subcategorias:', error);
        return [];
    }
}

// ======================= ESTATÍSTICAS =======================

// Obter estatísticas
async function obterEstatisticasAPI() {
    try {
        const response = await fetch(`${API_URL}/estatisticas`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message);
        }
        
        return data.estatisticas;
    } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        return null;
    }
}

// Tornar funções globais
window.listarProdutos = listarProdutos;
window.buscarProduto = buscarProduto;
window.criarProduto = criarProduto;
window.atualizarProduto = atualizarProduto;
window.excluirProdutoAPI = excluirProdutoAPI;
window.listarCategorias = listarCategorias;
window.listarSubcategorias = listarSubcategorias;
window.obterEstatisticasAPI = obterEstatisticasAPI;

