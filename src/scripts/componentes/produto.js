
// ======================= CLIENTE API DE PRODUTOS =======================

// Função para obter a URL da API
function getAPIURL() {
    return window.API_BASE_URL || 'https://roxinho-shop-backend.vercel.app/api';
}

// Estado do produto
let produtoAtual = null;
let ratingAtual = 0;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarProduto();
    configurarEventos();
    loadHeaderFooter(); // Carregar cabeçalho e rodapé
});

// Obter ID do produto da URL
function obterIdProduto() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Carregar dados do produto
async function carregarProduto() {
    const id = obterIdProduto();
    if (!id) {
        window.location.href = '../index.html'; // Redireciona se não houver ID
        return;
    }

    try {
        const response = await fetch(`${getAPIURL()}/produtos/${id}`);
        const data = await response.json();

        if (data.success || data.status === 'success') {
            produtoAtual = data.product;
            renderizarProduto(produtoAtual);
            // carregarComentarios(); // Comentários não fazem parte desta tarefa
        } else {
            throw new Error('Produto não encontrado');
        }
    } catch (error) {
        console.error('Erro ao carregar produto:', error);
        // Redirecionar para uma página de erro ou exibir mensagem
        window.location.href = '../index.html'; // Redireciona em caso de erro
    }
}

// Renderizar o produto na página
function renderizarProduto(produto) {
    // Atualizar título da página
    document.title = `${produto.nome} | Roxinho Shop`;

    document.getElementById("titulo-produto").textContent = produto.nome;
    document.getElementById("descricao-conteudo").innerHTML = produto.descricao; // Descrição curta
    document.getElementById("descricao-longa-conteudo").innerHTML = produto.descricao_longa; // Descrição longa
    document.getElementById("imagem-principal").src = produto.imagem_principal;

    const precoElement = document.getElementById("preco-atual");
    const btnMercadoLivre = document.getElementById("btn-mercado-livre");
    const btnAmazon = document.getElementById("btn-amazon");
    const precoML = document.getElementById("preco-ml");
    const precoAmazon = document.getElementById("preco-amazon");

    // Lógica para exibir preços e botões
    let precoPrincipal = produto.preco; // Preço padrão

    if (produto.link_mercado_livre && produto.preco_mercado_livre) {
        btnMercadoLivre.href = produto.link_mercado_livre;
        precoML.textContent = `R$ ${produto.preco_mercado_livre.toFixed(2)}`;
        btnMercadoLivre.style.display = "inline-block";
        precoPrincipal = produto.preco_mercado_livre; // Define o ML como preço principal se disponível
    } else {
        btnMercadoLivre.style.display = "none";
    }

    if (produto.link_amazon && produto.preco_amazon) {
        btnAmazon.href = produto.link_amazon;
        precoAmazon.textContent = `R$ ${produto.preco_amazon.toFixed(2)}`;
        btnAmazon.style.display = "inline-block";
        if (!produto.link_mercado_livre) { // Se ML não estiver disponível, Amazon é o principal
            precoPrincipal = produto.preco_amazon;
        }
    } else {
        btnAmazon.style.display = "none";
    }

    precoElement.textContent = `R$ ${precoPrincipal.toFixed(2)}`;

    // Galeria de miniaturas (se houver)
    const galeriaMiniaturas = document.getElementById('galeria-miniaturas');
    if (galeriaMiniaturas) {
        galeriaMiniaturas.innerHTML = ''; // Limpa miniaturas existentes
        // Adicionar a imagem principal como primeira miniatura
        const mainThumbnail = document.createElement('img');
        mainThumbnail.src = produto.imagem_principal;
        mainThumbnail.alt = `Miniatura de ${produto.nome}`;
        mainThumbnail.className = 'miniatura ativa';
        mainThumbnail.onclick = () => trocarImagemPrincipal(mainThumbnail);
        galeriaMiniaturas.appendChild(mainThumbnail);

        // Se houver outras imagens (ex: em um array produto.imagens_secundarias), adicione-as aqui
        // Exemplo: produto.imagens_secundarias.forEach(imgUrl => {
        //     const thumbnail = document.createElement('img');
        //     thumbnail.src = imgUrl;
        //     thumbnail.alt = `Miniatura de ${produto.nome}`;
        //     thumbnail.className = 'miniatura';
        //     thumbnail.onclick = () => trocarImagemPrincipal(thumbnail);
        //     galeriaMiniaturas.appendChild(thumbnail);
        // });
    }
}

// Função para trocar imagem principal na galeria
function trocarImagemPrincipal(element) {
    document.getElementById('imagem-principal').src = element.src;
    document.querySelectorAll('.miniatura').forEach(img => img.classList.remove('ativa'));
    element.classList.add('ativa');
}

// Configurar eventos (apenas os necessários para a página de produto)
function configurarEventos() {
    // Não há eventos de comentário nesta tarefa, então esta função pode ser vazia ou removida se não houver outros eventos.
}

window.trocarImagemPrincipal = trocarImagemPrincipal;
window.getAPIURL = getAPIURL;
window.listarProdutos = listarProdutos;
window.buscarProduto = buscarProduto;



