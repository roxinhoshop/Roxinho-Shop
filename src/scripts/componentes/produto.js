
        // Configuração da API
        window.API_BASE_URL = 'https://roxinho-shop-backend.vercel.app/api';
        
        // Estado do produto
        let produtoAtual = null;
        let ratingAtual = 0;
        
        // Inicialização
        document.addEventListener('DOMContentLoaded', () => {
            carregarProduto();
            configurarEventos();
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
                const response = await fetch(`${window.API_BASE_URL}/products/${id}`);
                const data = await response.json();
                
                if (data.success || data.status === 'success') {
                    produtoAtual = data.product;
                    renderizarProduto(produtoAtual);
                    carregarComentarios();
                    carregarProdutosRelacionados();
                } else {
                    throw new Error('Produto não encontrado');
                }
            } catch (error) {
                console.error('Erro ao carregar produto:', error);
            }
        }

        // Renderizar o produto na página
        function renderizarProduto(produto) {
            document.getElementById('titulo-produto').textContent = produto.name;
            document.getElementById('preco-atual').textContent = `R$ ${produto.price_ml.toFixed(2)}`;
            document.getElementById('descricao-conteudo').innerHTML = produto.description;
            document.getElementById('imagem-principal').src = produto.image_url;
            
            // Atualizar links de compra
            document.getElementById('btn-mercado-livre').href = produto.link_ml;
            document.getElementById('btn-amazon').href = produto.link_amazon;
            document.getElementById('preco-ml').textContent = `R$ ${produto.price_ml.toFixed(2)}`;
            document.getElementById('preco-amazon').textContent = `R$ ${produto.price_amazon.toFixed(2)}`;

            // Breadcrumb
            document.getElementById('categoria-link').textContent = produto.category;
            document.getElementById('produto-breadcrumb').textContent = produto.name;
        }

        // Configurar eventos
        function configurarEventos() {
            document.getElementById('btn-adicionar-comentario').addEventListener('click', () => {
                document.getElementById('form-comentario').style.display = 'block';
            });
            
            document.getElementById('cancelar-comentario').addEventListener('click', () => {
                document.getElementById('form-comentario').style.display = 'none';
            });

            document.getElementById('enviar-comentario').addEventListener('click', enviarComentario);

            document.querySelectorAll('.rating-star').forEach(star => {
                star.addEventListener('click', () => {
                    ratingAtual = parseInt(star.dataset.rating);
                    atualizarEstrelas(ratingAtual);
                });
            });
        }

        function atualizarEstrelas(rating) {
            document.querySelectorAll('.rating-star').forEach(star => {
                if (parseInt(star.dataset.rating) <= rating) {
                    star.classList.add('ativo');
                } else {
                    star.classList.remove('ativo');
                }
            });
        }

        // Enviar comentário
        async function enviarComentario() {
            const texto = document.getElementById('comentario-texto').value;
            if (!texto || ratingAtual === 0) {
                alert('Por favor, adicione um texto e uma nota para a sua avaliação.');
                return;
            }

            const comentario = {
                productId: obterIdProduto(),
                author: 'Usuário Anônimo', // Substituir com dados do usuário logado
                rating: ratingAtual,
                text: texto
            };

            try {
                const response = await fetch(`${window.API_BASE_URL}/comments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(comentario)
                });

                const result = await response.json();
                if (result.success) {
                    carregarComentarios();
                    document.getElementById('form-comentario').style.display = 'none';
                    document.getElementById('comentario-texto').value = '';
                    ratingAtual = 0;
                    atualizarEstrelas(0);
                } else {
                    throw new Error('Erro ao enviar comentário');
                }
            } catch (error) {
                console.error('Erro ao enviar comentário:', error);
            }
        }

        // Carregar comentários
        async function carregarComentarios() {
            const productId = obterIdProduto();
            try {
                const response = await fetch(`${window.API_BASE_URL}/comments/${productId}`);
                const data = await response.json();

                const lista = document.getElementById('comentarios-lista');
                lista.innerHTML = '';

                if (data.success && data.comments.length > 0) {
                    data.comments.forEach(comentario => {
                        const div = document.createElement('div');
                        div.className = 'comentario';
                        div.innerHTML = `
                            <div class="comentario-header">
                                <div class="comentario-autor">${comentario.author}</div>
                                <div class="comentario-data">${new Date(comentario.created_at).toLocaleDateString()}</div>
                            </div>
                            <div class="comentario-rating">
                                ${Array(comentario.rating).fill('<i class="fas fa-star estrela"></i>').join('')}
                                ${Array(5 - comentario.rating).fill('<i class="fas fa-star estrela vazia"></i>').join('')}
                            </div>
                            <div class="comentario-texto">${comentario.text}</div>
                        `;
                        lista.appendChild(div);
                    });
                } else {
                    lista.innerHTML = '<p>Nenhuma avaliação para este produto ainda.</p>';
                }
            } catch (error) {
                console.error('Erro ao carregar comentários:', error);
            }
        }

        // Carregar produtos relacionados
        async function carregarProdutosRelacionados() {
            // Lógica para carregar produtos relacionados (ex: da mesma categoria)
        }
        
        // Tornar funções globais
        // Esta função está sendo chamada de um evento onclick no HTML, então precisa ser global.
        function trocarImagemPrincipal(element) {
            document.getElementById('imagem-principal').src = element.src;
            document.querySelectorAll('.miniatura').forEach(img => img.classList.remove('ativa'));
            element.classList.add('ativa');
        }

