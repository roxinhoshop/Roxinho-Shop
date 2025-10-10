// Desenvolvido por Gabriel (gabwvr)
// Este arquivo contém funções para gerenciar [FUNCIONALIDADE]
// Comentários didáticos para facilitar o entendimento


const produtos = [
  {
    id: 1,
    nome: 'Placa de Vídeo RTX 4070 Super 12GB GDDR6X',
    marca: 'NVIDIA',
    preco: 3299.99,
    precoOriginal: 3699.99,
    avaliacao: 0,
    avaliacoes: 0,
    imagem: './imagens/thumbs/produto1.webp',
    categoria: 'Hardware',
    subcategoria: 'Placas de Vídeo',
    emEstoque: true,
    freteGratis: true,
    parcelamento: '12x de R$ 274,99',
    desconto: 11,
    destaque: true,
    tags: ['Gamer', 'Ray Tracing', '12GB VRAM'],
    condicao: 'Novo',
    garantia: '3 anos',
    descricao: 'Placa de vídeo de alto desempenho para games e criação de conteúdo com tecnologia Ray Tracing e 12GB de memória GDDR6X.',
    especificacoes: [
      { nome: 'Memória', valor: '12GB GDDR6X' },
      { nome: 'Interface', valor: 'PCI Express 4.0' },
      { nome: 'Conectores', valor: 'HDMI 2.1, 3x DisplayPort 1.4a' },
      { nome: 'Refrigeração', valor: 'Dual Fan' }
    ]
  },
  {
    id: 2,
    nome: 'Processador AMD Ryzen 7 7700X 4.5GHz',
    marca: 'AMD',
    preco: 1899.99,
    precoOriginal: 2199.99,
    avaliacao: 0, 
    avaliacoes: 0,
    imagem: './imagens/thumbs/produto2.webp',
    categoria: 'Hardware',
    subcategoria: 'Processadores',
    emEstoque: true,
    freteGratis: true,
    parcelamento: '10x de R$ 189,99',
    desconto: 14,
    destaque: true,
    tags: ['8 Cores', 'AM5', 'Gaming'],
    condicao: 'Novo',
    garantia: '3 anos',
    descricao: 'Processador de 8 núcleos e 16 threads para alto desempenho em jogos e tarefas intensivas, com socket AM5 e frequência de 4.5 GHz.',
    especificacoes: [
      { nome: 'Cores/Threads', valor: '8/16' },
      { nome: 'Frequência Base', valor: '4.5 GHz' },
      { nome: 'Socket', valor: 'AM5' },
      { nome: 'TDP', valor: '105W' }
    ]
  },
  {
    id: 3,
    nome: 'Smartphone Samsung Galaxy S24 Ultra 256GB',
    marca: 'Samsung',
    preco: 4999.99,
    precoOriginal: 5499.99,
    avaliacao: 0,
    avaliacoes: 0,
    imagem: './imagens/thumbs/produto3.jpg',
    imagemFallback: 'gradiente-azul',
    categoria: 'Celular & Smartphone',
    subcategoria: 'Smartphones',
    emEstoque: true,
    freteGratis: true,
    parcelamento: '12x de R$ 416,66',
    desconto: 9,
    destaque: true,
    tags: ['5G', '256GB', 'S Pen'],
    condicao: 'Novo',
    garantia: '1 ano',
    descricao: 'Smartphone premium com tela grande, 256GB de armazenamento, suporte 5G e S Pen para produtividade avançada.',
    especificacoes: [
      { nome: 'Armazenamento', valor: '256GB' },
      { nome: 'Conectividade', valor: '5G' },
      { nome: 'Caneta', valor: 'S Pen integrada' },
      { nome: 'Tela', valor: 'Dynamic AMOLED, 6.8 polegadas' }
    ]
  },
  {
    id: 4,
    nome: 'Notebook Gamer ASUS ROG Strix G15',
    marca: 'ASUS',
    preco: 6799.99,
    avaliacao: 0,
    avaliacoes: 0,
    imagem: './imagens/thumbs/produto4.jpg',
    categoria: 'Computadores',
    subcategoria: 'Notebooks',
    emEstoque: true,
