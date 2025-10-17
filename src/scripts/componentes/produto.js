
        // Configuração da API
        window.API_BASE_URL = 'https://roxinho-shop-backend.vercel.app/api';
        
        // Estado do produto
        let produtoAtual = null;
        
        // Inicialização
        document.addEventListener('DOMContentLoaded', () => {
            carregarProduto();
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
                window.location.href = '../index.html';
                return;
            }
            
            try {
                const response = await fetch(`${window.API_BASE_URL}/produtos/${id}`);
                const data = await response.json();
                
                if (data.success || data.status === 'success') {
                    produtoAtual = data.product;
                    renderizarProduto(produtoAtual);
                } else {
                    throw new Error('Produto não encontrado');
                }
            } catch (error) {
                console.error('Erro ao carregar produto:', error);
            }
        }

        // Renderizar o produto na página
        function renderizarProduto(produto) {
            // Atualiza o título da página com o nome do produto
            document.title = `${produto.nome} | Roxinho Shop`;

            document.getElementById("titulo-produto").textContent = produto.nome;
            document.getElementById("descricao-conteudo").innerHTML = produto.descricao;
            document.getElementById("imagem-principal").src = produto.imagem || 'https://via.placeholder.com/600x400?text=Sem+Imagem';

            const precoAtualElement = document.getElementById("preco-atual");
            const btnMercadoLivre = document.getElementById("btn-mercado-livre");
            const btnAmazon = document.getElementById("btn-amazon");
            const precoMLSpan = document.getElementById("preco-ml");
            const precoAmazonSpan = document.getElementById("preco-amazon");

            // Determinar o preço a ser exibido como principal
            let precoPrincipal = produto.preco;
            if (produto.preco_mercado_livre) {
                precoPrincipal = produto.preco_mercado_livre;
            } else if (produto.preco_amazon) {
                precoPrincipal = produto.preco_amazon;
            }
            precoAtualElement.textContent = `R$ ${precoPrincipal.toFixed(2).replace(".", ",")}`;

            // Configurar botões Mercado Livre
            if (produto.link_mercado_livre && produto.preco_mercado_livre) {
                btnMercadoLivre.href = produto.link_mercado_livre;
                precoMLSpan.textContent = `R$ ${produto.preco_mercado_livre.toFixed(2).replace(".", ",")}`;
                btnMercadoLivre.style.display = "inline-flex"; // Usar inline-flex para alinhar ícone e texto
            } else {
                btnMercadoLivre.style.display = "none";
            }

            // Configurar botões Amazon
            if (produto.link_amazon && produto.preco_amazon) {
                btnAmazon.href = produto.link_amazon;
                precoAmazonSpan.textContent = `R$ ${produto.preco_amazon.toFixed(2).replace(".", ",")}`;
                btnAmazon.style.display = "inline-flex";
            } else {
                btnAmazon.style.display = "none";
            }

            // Renderizar miniaturas
            const galeriaMiniaturas = document.getElementById("galeria-miniaturas");
            if (galeriaMiniaturas) {
                galeriaMiniaturas.innerHTML = ''; // Limpar miniaturas existentes
                if (produto.imagens_secundarias && produto.imagens_secundarias.length > 0) {
                    produto.imagens_secundarias.forEach(imgUrl => {
                        const miniatura = document.createElement('img');
                        miniatura.src = imgUrl;
                        miniatura.alt = `Miniatura de ${produto.nome}`;
                        miniatura.className = 'miniatura';
                        miniatura.addEventListener('click', () => trocarImagemPrincipal(miniatura));
                        galeriaMiniaturas.appendChild(miniatura);
                    });
                } else {
                    // Se não houver imagens secundárias, adicionar a imagem principal como miniatura
                    const miniatura = document.createElement('img');
                    miniatura.src = produto.imagem || 'https://via.placeholder.com/600x400?text=Sem+Imagem';
                    miniatura.alt = `Miniatura de ${produto.nome}`;
                    miniatura.className = 'miniatura ativa';
                    miniatura.addEventListener('click', () => trocarImagemPrincipal(miniatura));
                    galeriaMiniaturas.appendChild(miniatura);
                }
            }

            // Atualizar breadcrumb (se existir)
            const categoriaLink = document.getElementById("categoria-link");
            const produtoBreadcrumb = document.getElementById("produto-breadcrumb");
            if (categoriaLink && produtoBreadcrumb) {
                categoriaLink.textContent = produto.categoria;
                categoriaLink.href = `produtos.html?categoria=${encodeURIComponent(produto.categoria)}`;
                produtoBreadcrumb.textContent = produto.nome;
            }
        }

        // Tornar funções globais
        window.trocarImagemPrincipal = function(element) {
            document.getElementById('imagem-principal').src = element.src;
            document.querySelectorAll('.miniatura').forEach(img => img.classList.remove('ativa'));
            element.classList.add('ativa');
        }

