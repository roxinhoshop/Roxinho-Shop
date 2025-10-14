/**
 * Sistema de Detecção Automática de Categoria
 * Analisa nome e descrição do produto para determinar categoria e subcategoria
 */

// Mapeamento de palavras-chave para categorias
const categoriasMap = {
    'Hardware': {
        keywords: ['processador', 'cpu', 'placa de video', 'gpu', 'memoria ram', 'ram', 'placa mae', 'motherboard', 'fonte', 'cooler', 'gabinete', 'ssd', 'hd', 'nvme', 'placa de som'],
        subcategorias: {
            'Processadores': ['processador', 'cpu', 'ryzen', 'intel', 'core i', 'threadripper'],
            'Placas de Vídeo': ['placa de video', 'gpu', 'geforce', 'radeon', 'rtx', 'gtx'],
            'Memórias RAM': ['memoria', 'ram', 'ddr4', 'ddr5', 'dimm'],
            'Placas Mãe': ['placa mae', 'motherboard', 'chipset'],
            'Fontes': ['fonte', 'psu', 'power supply'],
            'Coolers': ['cooler', 'water cooler', 'refrigeracao'],
            'Gabinetes': ['gabinete', 'case', 'tower'],
            'Armazenamento': ['ssd', 'hd', 'nvme', 'm.2', 'armazenamento'],
            'Placas de Som': ['placa de som', 'sound card', 'audio card']
        }
    },
    'Periféricos': {
        keywords: ['teclado', 'mouse', 'headset', 'webcam', 'microfone', 'mousepad', 'controle', 'caixa de som', 'monitor'],
        subcategorias: {
            'Teclados': ['teclado', 'keyboard', 'mecanico'],
            'Mouses': ['mouse', 'mice'],
            'Headsets': ['headset', 'fone', 'headphone'],
            'Webcams': ['webcam', 'camera web'],
            'Microfones': ['microfone', 'mic', 'microphone'],
            'Mousepads': ['mousepad', 'mouse pad'],
            'Controles': ['controle', 'joystick', 'gamepad'],
            'Caixas de Som': ['caixa de som', 'speaker', 'alto-falante'],
            'Monitores': ['monitor', 'display', 'tela']
        }
    },
    'Computadores': {
        keywords: ['pc gamer', 'workstation', 'all-in-one', 'mini pc', 'notebook', 'laptop', 'chromebook', 'ultrabook', 'tablet'],
        subcategorias: {
            'PCs Gamer': ['pc gamer', 'gaming pc'],
            'Workstations': ['workstation', 'estacao de trabalho'],
            'All-in-One': ['all-in-one', 'aio'],
            'Mini PCs': ['mini pc', 'nuc'],
            'Notebooks': ['notebook', 'laptop'],
            'Chromebooks': ['chromebook'],
            'Ultrabooks': ['ultrabook'],
            'Tablets': ['tablet', 'ipad']
        }
    },
    'Games': {
        keywords: ['console', 'playstation', 'xbox', 'nintendo', 'jogo', 'game', 'cadeira gamer', 'mesa gamer', 'volante'],
        subcategorias: {
            'Consoles': ['console', 'playstation', 'xbox', 'nintendo', 'switch'],
            'Jogos PC': ['jogo pc', 'game pc'],
            'Jogos Console': ['jogo console', 'game console'],
            'Acessórios Gaming': ['acessorio', 'gaming'],
            'Cadeiras Gamer': ['cadeira gamer', 'gaming chair'],
            'Mesas Gamer': ['mesa gamer', 'gaming desk'],
            'Controles': ['controle', 'controller'],
            'Volantes': ['volante', 'steering wheel']
        }
    },
    'Celular & Smartphone': {
        keywords: ['celular', 'smartphone', 'iphone', 'galaxy', 'capa', 'pelicula', 'carregador', 'fone', 'power bank', 'suporte', 'smartwatch'],
        subcategorias: {
            'Smartphones': ['smartphone', 'celular', 'iphone', 'galaxy'],
            'Capas e Películas': ['capa', 'pelicula', 'case', 'protetor'],
            'Carregadores': ['carregador', 'charger'],
            'Fones de Ouvido': ['fone', 'earphone', 'earbud'],
            'Power Banks': ['power bank', 'bateria externa'],
            'Suportes': ['suporte', 'holder'],
            'Smartwatches': ['smartwatch', 'relogio inteligente']
        }
    },
    'TV & Áudio': {
        keywords: ['tv', 'smart tv', '4k', '8k', 'suporte tv', 'conversor', 'antena', 'soundbar', 'home theater'],
        subcategorias: {
            'Smart TVs': ['smart tv', 'tv smart'],
            'TVs 4K': ['4k', 'uhd'],
            'TVs 8K': ['8k'],
            'Suportes TV': ['suporte tv', 'suporte para tv'],
            'Conversores': ['conversor', 'decoder'],
            'Antenas': ['antena', 'antenna'],
            'Soundbars': ['soundbar', 'barra de som'],
            'Home Theater': ['home theater', 'cinema em casa']
        }
    },
    'Áudio': {
        keywords: ['fone', 'caixa de som', 'soundbar', 'amplificador', 'microfone', 'interface de audio', 'monitor de referencia'],
        subcategorias: {
            'Fones de Ouvido': ['fone', 'headphone', 'earphone'],
            'Caixas de Som': ['caixa de som', 'speaker'],
            'Soundbars': ['soundbar'],
            'Amplificadores': ['amplificador', 'amplifier'],
            'Microfones': ['microfone', 'mic'],
            'Interfaces de Áudio': ['interface de audio', 'audio interface'],
            'Monitores de Referência': ['monitor de referencia', 'studio monitor']
        }
    },
    'Espaço Gamer': {
        keywords: ['cadeira gamer', 'mesa gamer', 'suporte monitor', 'iluminacao rgb', 'decoracao', 'organizador', 'tapete'],
        subcategorias: {
            'Cadeiras Gamer': ['cadeira gamer'],
            'Mesas Gamer': ['mesa gamer'],
            'Suportes Monitor': ['suporte monitor', 'suporte para monitor'],
            'Iluminação RGB': ['iluminacao rgb', 'led rgb', 'rgb'],
            'Decoração': ['decoracao', 'poster', 'quadro'],
            'Organizadores': ['organizador', 'suporte'],
            'Tapetes': ['tapete', 'mousepad grande']
        }
    },
    'Casa Inteligente': {
        keywords: ['assistente virtual', 'alexa', 'google home', 'camera', 'lampada smart', 'tomada smart', 'sensor', 'fechadura', 'termostato'],
        subcategorias: {
            'Assistentes Virtuais': ['assistente virtual', 'alexa', 'google home'],
            'Câmeras Segurança': ['camera', 'camera de seguranca'],
            'Lâmpadas Smart': ['lampada smart', 'lampada inteligente'],
            'Tomadas Smart': ['tomada smart', 'tomada inteligente'],
            'Sensores': ['sensor'],
            'Fechaduras Digitais': ['fechadura digital', 'smart lock'],
            'Termostatos': ['termostato', 'thermostat']
        }
    },
    'Energia': {
        keywords: ['nobreak', 'estabilizador', 'filtro de linha', 'bateria', 'inversor', 'carregador', 'cabo de forca'],
        subcategorias: {
            'No-breaks': ['nobreak', 'no-break', 'ups'],
            'Estabilizadores': ['estabilizador', 'stabilizer'],
            'Filtros de Linha': ['filtro de linha', 'power strip'],
            'Baterias': ['bateria', 'battery'],
            'Inversores': ['inversor', 'inverter'],
            'Carregadores': ['carregador', 'charger'],
            'Cabos de Força': ['cabo de forca', 'power cable']
        }
    }
};

/**
 * Detecta categoria e subcategoria baseado no nome e descrição do produto
 * @param {string} nome - Nome do produto
 * @param {string} descricao - Descrição do produto
 * @returns {Object} - {categoria: string, subcategoria: string}
 */
function detectarCategoria(nome, descricao = '') {
    const texto = `${nome} ${descricao}`.toLowerCase();
    
    let categoriaEncontrada = null;
    let subcategoriaEncontrada = null;
    let maxScore = 0;
    
    // Procurar categoria
    for (const [categoria, config] of Object.entries(categoriasMap)) {
        let score = 0;
        
        // Verificar keywords da categoria
        for (const keyword of config.keywords) {
            if (texto.includes(keyword)) {
                score += 10;
            }
        }
        
        if (score > maxScore) {
            maxScore = score;
            categoriaEncontrada = categoria;
        }
    }
    
    // Se encontrou categoria, procurar subcategoria
    if (categoriaEncontrada) {
        const subcategorias = categoriasMap[categoriaEncontrada].subcategorias;
        let maxSubScore = 0;
        
        for (const [subcategoria, keywords] of Object.entries(subcategorias)) {
            let score = 0;
            
            for (const keyword of keywords) {
                if (texto.includes(keyword)) {
                    score += 10;
                }
            }
            
            if (score > maxSubScore) {
                maxSubScore = score;
                subcategoriaEncontrada = subcategoria;
            }
        }
    }
    
    return {
        categoria: categoriaEncontrada,
        subcategoria: subcategoriaEncontrada
    };
}

/**
 * Busca ID da categoria no banco
 * @param {string} nomeCategoria - Nome da categoria
 * @returns {Promise<number|null>} - ID da categoria ou null
 */
async function buscarIdCategoria(nomeCategoria) {
    try {
        const response = await fetch(`${window.API_BASE_URL}/categories`);
        const data = await response.json();
        
        if (data.success || data.status === 'success') {
            const categorias = data.categorias || data.categories || [];
            const categoria = categorias.find(c => c.nome === nomeCategoria);
            return categoria ? categoria.id : null;
        }
    } catch (error) {
        console.error('Erro ao buscar ID da categoria:', error);
    }
    return null;
}

// Exportar funções
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { detectarCategoria, buscarIdCategoria };
}

