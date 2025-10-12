async function buscarProdutosDaAPI() {
  try {
    const response = await fetch("https://roxinho-shop-backend.vercel.app/api.php/produtos");
    const data = await response.json();
    return data.products;
  } catch (error) {
    console.error("Erro ao buscar produtos da API:", error);
    return [];
  }
}

