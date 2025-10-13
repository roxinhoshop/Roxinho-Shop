// ======================= GERENCIADOR DE PRODUTOS =======================

// Estrutura de dados de produtos
const CATEGORIAS = {
    'eletronicos': {
        nome: 'Eletrônicos',
        subcategorias: ['Smartphones', 'Notebooks', 'Tablets', 'Smartwatches', 'Fones de Ouvido']
    },
    'informatica': {
        nome: 'Informática',
        subcategorias: ['Computadores', 'Monitores', 'Teclados', 'Mouses', 'Webcams']
    },
    'games': {
        nome: 'Games',
        subcategorias: ['Consoles', 'Jogos', 'Controles', 'Headsets', 'Cadeiras Gamer']
    },
    'hardware': {
        nome: 'Hardware',
        subcategorias: ['Processadores', 'Placas de Vídeo', 'Memória RAM', 'SSDs', 'Fontes']
    },
    'perifericos': {
        nome: 'Periféricos',
        subcategorias: ['Impressoras', 'Scanners', 'Webcams', 'Microfones', 'Caixas de Som']
    },
    'casa-inteligente': {
        nome: 'Casa Inteligente',
        subcategorias: ['Assistentes', 'Câmeras', 'Lâmpadas', 'Tomadas', 'Sensores']
    },
    'audio-video': {
        nome: 'Áudio e Vídeo',
        subcategorias: ['TVs', 'Soundbars', 'Home Theater', 'Projetores', 'Câmeras']
    },
    'redes': {
        nome: 'Redes',
        subcategorias: ['Roteadores', 'Switches', 'Access Points', 'Modems', 'Cabos']
    },
    'armazenamento': {
        nome: 'Armazenamento',
        subcategorias: ['HDs Externos', 'Pendrives', 'Cartões de Memória', 'NAS', 'SSDs Externos']
    },
    'escritorio': {
        nome: 'Escritório',
        subcategorias: ['Cadeiras', 'Mesas', 'Suportes', 'Organizadores', 'Iluminação']
    },
    'acessorios': {
        nome: 'Acessórios',
        subcategorias: ['Capas', 'Películas', 'Carregadores', 'Cabos', 'Adaptadores']
    }
};

// Salvar produto
function salvarProduto(produto) {
    const produtos = obterProdutos();
    
    if (produto.id) {
        // Atualizar produto existente
        const index = produtos.findIndex(p => p.id === produto.id);
        if (index !== -1) {
            produtos[index] = { ...produtos[index], ...produto };
        }
    } else {
        // Novo produto
        produto.id = gerarId();
        produto.dataCriacao = new Date().toISOString();
        produtos.push(produto);
    }
    
    localStorage.setItem('produtos', JSON.stringify(produtos));
    return produto;
}

// Obter todos os produtos
function obterProdutos() {
    const produtos = localStorage.getItem('produtos');
    return produtos ? JSON.parse(produtos) : [];
}

// Obter produto por ID
function obterProdutoPorId(id) {
    const produtos = obterProdutos();
    return produtos.find(p => p.id === id);
}

// Obter produtos por categoria
function obterProdutosPorCategoria(categoria, subcategoria = null) {
    const produtos = obterProdutos();
    
    if (subcategoria) {
        return produtos.filter(p => 
            p.categoria === categoria && p.subcategoria === subcategoria
        );
    }
    
    return produtos.filter(p => p.categoria === categoria);
}

// Excluir produto
async function excluirProduto(id) {
    const confirmado = await confirmarFluent(
        'Excluir Produto',
        'Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.',
        'fas fa-trash-alt'
    );
    
    if (!confirmado) return false;
    
    const produtos = obterProdutos();
    const produtosFiltrados = produtos.filter(p => p.id !== id);
    localStorage.setItem('produtos', JSON.stringify(produtosFiltrados));
    
    return true;
}

// Buscar produtos
function buscarProdutos(termo) {
    const produtos = obterProdutos();
    const termoLower = termo.toLowerCase();
    
    return produtos.filter(p => 
        p.nome.toLowerCase().includes(termoLower) ||
        p.descricao.toLowerCase().includes(termoLower) ||
        p.categoria.toLowerCase().includes(termoLower) ||
        (p.subcategoria && p.subcategoria.toLowerCase().includes(termoLower))
    );
}

// Filtrar produtos
function filtrarProdutos(filtros) {
    let produtos = obterProdutos();
    
    // Filtro de categoria
    if (filtros.categoria) {
        produtos = produtos.filter(p => p.categoria === filtros.categoria);
    }
    
    // Filtro de subcategoria
    if (filtros.subcategoria) {
        produtos = produtos.filter(p => p.subcategoria === filtros.subcategoria);
    }
    
    // Filtro de preço
    if (filtros.precoMin !== undefined) {
        produtos = produtos.filter(p => p.preco >= filtros.precoMin);
    }
    
    if (filtros.precoMax !== undefined) {
        produtos = produtos.filter(p => p.preco <= filtros.precoMax);
    }
    
    // Filtro de origem
    if (filtros.origem) {
        produtos = produtos.filter(p => p.origem === filtros.origem);
    }
    
    // Ordenação
    if (filtros.ordenar) {
        switch (filtros.ordenar) {
            case 'preco-asc':
                produtos.sort((a, b) => a.preco - b.preco);
                break;
            case 'preco-desc':
                produtos.sort((a, b) => b.preco - a.preco);
                break;
            case 'nome-asc':
                produtos.sort((a, b) => a.nome.localeCompare(b.nome));
                break;
            case 'nome-desc':
                produtos.sort((a, b) => b.nome.localeCompare(a.nome));
                break;
            case 'recentes':
                produtos.sort((a, b) => 
                    new Date(b.dataCriacao) - new Date(a.dataCriacao)
                );
                break;
        }
    }
    
    return produtos;
}

// Gerar ID único
function gerarId() {
    return 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Obter estatísticas
function obterEstatisticas() {
    const produtos = obterProdutos();
    
    const stats = {
        total: produtos.length,
        porCategoria: {},
        porOrigem: {
            amazon: produtos.filter(p => p.origem === 'Amazon').length,
            mercadolivre: produtos.filter(p => p.origem === 'Mercado Livre').length
        },
        valorTotal: produtos.reduce((sum, p) => sum + p.preco, 0),
        precoMedio: produtos.length > 0 ? 
            produtos.reduce((sum, p) => sum + p.preco, 0) / produtos.length : 0
    };
    
    // Contar por categoria
    Object.keys(CATEGORIAS).forEach(cat => {
        stats.porCategoria[cat] = produtos.filter(p => p.categoria === cat).length;
    });
    
    return stats;
}

// Limpar todos os produtos
async function limparTodosProdutos() {
    const confirmado = await confirmarFluent(
        'Limpar Todos os Produtos',
        'ATENÇÃO: Isso irá excluir TODOS os produtos cadastrados. Esta ação não pode ser desfeita!',
        'fas fa-exclamation-triangle'
    );
    
    if (!confirmado) return false;
    
    localStorage.removeItem('produtos');
    return true;
}

// Exportar produtos (JSON)
function exportarProdutos() {
    const produtos = obterProdutos();
    const dataStr = JSON.stringify(produtos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `produtos_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// Importar produtos (JSON)
function importarProdutos(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const produtos = JSON.parse(e.target.result);
                
                if (!Array.isArray(produtos)) {
                    reject('Arquivo inválido: deve conter um array de produtos');
                    return;
                }
                
                localStorage.setItem('produtos', JSON.stringify(produtos));
                resolve(produtos.length);
            } catch (error) {
                reject('Erro ao processar arquivo: ' + error.message);
            }
        };
        
        reader.onerror = () => reject('Erro ao ler arquivo');
        reader.readAsText(file);
    });
}

// Tornar funções globais
window.CATEGORIAS = CATEGORIAS;
window.salvarProduto = salvarProduto;
window.obterProdutos = obterProdutos;
window.obterProdutoPorId = obterProdutoPorId;
window.obterProdutosPorCategoria = obterProdutosPorCategoria;
window.excluirProduto = excluirProduto;
window.buscarProdutos = buscarProdutos;
window.filtrarProdutos = filtrarProdutos;
window.obterEstatisticas = obterEstatisticas;
window.limparTodosProdutos = limparTodosProdutos;
window.exportarProdutos = exportarProdutos;
window.importarProdutos = importarProdutos;

