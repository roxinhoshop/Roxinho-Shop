// Script unificado para carregar cabeçalho e rodapé em todas as páginas

// Funções globais que podem ser necessárias
window.atualizarContadorCarrinho = function() {
  const carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');
  const contadorCabecalho = document.getElementById('contador-carrinho-cabecalho');
  if (contadorCabecalho) {
    const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
    contadorCabecalho.textContent = totalItens;
    contadorCabecalho.style.display = totalItens > 0 ? 'inline-block' : 'none';
  }
};

window.adicionarAosDesejos = function(produto) {
  let desejos = JSON.parse(localStorage.getItem('listaDesejos') || '[]');
  
  // Verificar se já existe
  const jaExiste = desejos.find(item => item.id === produto.id);
  if (jaExiste) {
    alert('Este produto já está na sua lista de desejos!');
    return;
  }
  
  desejos.push(produto);
  localStorage.setItem('listaDesejos', JSON.stringify(desejos));
  
  // Atualizar contador
  const contador = document.getElementById('contador-desejos');
  if (contador) {
    contador.textContent = desejos.length;
  }
  
  alert('Produto adicionado à lista de desejos!');
};

window.removerDosDesejos = function(produtoId) {
  let desejos = JSON.parse(localStorage.getItem('listaDesejos') || '[]');
  desejos = desejos.filter(item => item.id !== produtoId);
  localStorage.setItem('listaDesejos', JSON.stringify(desejos));
  
  // Atualizar contador
  const contador = document.getElementById('contador-desejos');
  if (contador) {
    contador.textContent = desejos.length;
  }
};

// Carregar cabeçalho e rodapé dinamicamente
(function() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');
    
    if (!headerPlaceholder && !footerPlaceholder) {
        return; // Não há placeholders, não fazer nada
    }

    fetch('cabecalho-rodape.html')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'text/html');

            const header = doc.querySelector('nav.cabecalho');
            const categorias = doc.querySelector('.barra-categorias');
            const footer = doc.querySelector('footer.rodape');

            if (header && headerPlaceholder) {
                headerPlaceholder.appendChild(header);
            }
            
            // Adicionar barra de categorias apenas se não for página de admin/painel
            const paginasSemCategorias = ['administracao.html', 'painel-admin.html', 'painel-administrador.html', 'painel-usuario.html'];
            const paginaAtual = window.location.pathname.split('/').pop();
            
            if (categorias && headerPlaceholder && !paginasSemCategorias.includes(paginaAtual)) {
                headerPlaceholder.appendChild(categorias);
            }
            
            if (footer && footerPlaceholder) {
                footerPlaceholder.appendChild(footer);
            }

            // Executar scripts do cabeçalho/rodapé
            doc.querySelectorAll("script").forEach(oldScript => {
                const newScript = document.createElement("script");
                if (oldScript.src) {
                    newScript.src = oldScript.src;
                } else {
                    newScript.textContent = oldScript.textContent;
                }
                document.body.appendChild(newScript);
            });

            // Atualizar contador do carrinho após carregar o cabeçalho
            if (typeof window.atualizarContadorCarrinho === 'function') {
                window.atualizarContadorCarrinho();
            }
        })
        .catch(error => {
            console.error('Erro ao carregar cabeçalho/rodapé:', error);
        });
})();

