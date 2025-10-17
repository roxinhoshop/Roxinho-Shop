// Este arquivo não é mais necessário pois o carregamento do cabeçalho e rodapé
// é feito diretamente no index.html e nas outras páginas

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

