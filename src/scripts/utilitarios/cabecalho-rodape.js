document.addEventListener('DOMContentLoaded', function() {
  fetch('src/paginas/cabecalho-rodape.html')
    .then(response => response.text())
    .then(data => {
      // Corrigir caminhos relativos para funcionar na raiz
      data = data.replace(/href="\.\.\/recursos/g, 'href="src/recursos');
      data = data.replace(/src="\.\.\/recursos/g, 'src="src/recursos');
      data = data.replace(/href="\.\.\/estilos/g, 'href="src/estilos');
      data = data.replace(/src="\.\.\/scripts/g, 'src="src/scripts');
      
      // Corrigir link do logo para voltar à página inicial
      data = data.replace(/href="\.\.\/\.\.\/index\.html"/g, 'href="/"');
      
      // Corrigir links para páginas HTML (com ou sem parâmetros)
      // Exceto quando já tem src/paginas/ ou começa com ../..
      data = data.replace(/href="(?!src\/paginas\/)(?!\.\.\/\.\.\/)([a-z\-]+)\.html/g, 'href="src/paginas/$1.html');
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(data, 'text/html');

      const header = doc.querySelector('nav.cabecalho');
      const categorias = doc.querySelector('.barra-categorias');
      const footer = doc.querySelector('footer.rodape');

      if (header) {
        // Adicionar contador do carrinho ao cabeçalho
        const carrinhoLink = header.querySelector('.caixa-carrinho');
        if (carrinhoLink && !carrinhoLink.querySelector('.contador-carrinho')) {
          const contador = document.createElement('span');
          contador.id = 'contador-carrinho-cabecalho';
          contador.className = 'contador-carrinho';
          contador.textContent = '0';
          contador.style.display = 'none';
          carrinhoLink.appendChild(contador);
        }
        
        document.getElementById('header-placeholder').appendChild(header);
      }
      if (categorias && !window.location.pathname.includes('administracao.html') && !window.location.pathname.includes('painel-admin.html') && !window.location.pathname.includes('painel-administrador.html') && !window.location.pathname.includes('painel-usuario.html')) {
        document.getElementById('header-placeholder').appendChild(categorias);
      }
      if (footer) document.getElementById('footer-placeholder').appendChild(footer);

      // Executar scripts do cabecalho/rodape
      doc.querySelectorAll("script").forEach(oldScript => {
        const newScript = document.createElement("script");
        if (oldScript.src) {
          // Corrigir caminho do script
          let srcCorrigido = oldScript.src.replace('../scripts', 'src/scripts');
          newScript.src = srcCorrigido;
        } else {
          newScript.textContent = oldScript.textContent;
        }
        document.body.appendChild(newScript);
      });

      // Atualizar contador do carrinho após carregar o cabeçalho
      if (typeof atualizarContadorCarrinho === 'function') {
        atualizarContadorCarrinho();
      }
    })
    .catch(error => {
      console.error('Erro ao carregar cabeçalho/rodapé:', error);
    });
});

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
