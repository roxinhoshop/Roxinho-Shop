# 📘 Guia do Painel Admin - Roxinho Shop

## 🚀 Como Acessar

**URL:** `http://localhost:8081/src/paginas/administracao.html`

---

## 📦 Como Importar Produtos

### **Método 1: Importar via Link (Amazon/Mercado Livre)**

1. **Acesse o Painel Admin**
2. **Clique em "Importar Produto"** (aba já aberta por padrão)
3. **Cole o link do produto** no campo de texto
   - Exemplo Amazon: `https://www.amazon.com.br/dp/B07GBZ4Q68`
   - Exemplo Mercado Livre: `https://www.mercadolivre.com.br/p/MLB123456`
4. **Clique em "Importar"**
5. **Aguarde o preview do produto aparecer**
6. **Revise as informações:**
   - Nome do produto
   - Preço
   - Imagem
   - Descrição
   - Categoria (será detectada automaticamente)
7. **Clique em "Confirmar Importação"**
8. **Produto será salvo no banco de dados MySQL!**

### **Plataformas Suportadas:**
- ✅ **Amazon Brasil** (amazon.com.br)
- ✅ **Mercado Livre** (mercadolivre.com.br)

---

## 📋 Gerenciar Produtos Cadastrados

1. **Clique em "Produtos Cadastrados"**
2. **Visualize todos os produtos do banco de dados**
3. **Use a busca** para encontrar produtos específicos
4. **Botões disponíveis:**
   - 🟢 **Editar** - Modificar informações do produto
   - 🔴 **Excluir** - Remover produto do banco

---

## 📊 Estatísticas

1. **Clique em "Estatísticas"**
2. **Visualize:**
   - Total de produtos cadastrados
   - Produtos por categoria
   - Valor total em estoque
   - Produtos mais visualizados (em breve)

---

## 🎨 Recursos do Painel

### **Design Fluent (Windows 11)**
- ✅ Interface moderna e intuitiva
- ✅ Efeitos de vidro (glassmorphism)
- ✅ Animações suaves
- ✅ Cores roxas (#904DDB)
- ✅ Responsivo para mobile

### **Funcionalidades**
- ✅ Importação automática de produtos
- ✅ Preview antes de salvar
- ✅ Detecção automática de categoria
- ✅ Busca em tempo real
- ✅ Badges de origem (Amazon/ML)
- ✅ Gerenciamento CRUD completo

---

## 🔧 Solução de Problemas

### **Problema: "Não foi possível carregar produtos"**

**Solução:**
1. Verifique se o servidor backend está rodando:
   ```bash
   cd /home/ubuntu/Roxinho-Shop/api
   node server.js
   ```
2. Verifique se o servidor frontend está rodando:
   ```bash
   cd /home/ubuntu/Roxinho-Shop
   python3 -m http.server 8081
   ```
3. Acesse via `http://localhost:8081` (não `file://`)

### **Problema: "Erro ao importar produto"**

**Causas possíveis:**
- Link inválido ou produto não encontrado
- Site bloqueando scraping
- Produto fora de estoque

**Solução:**
- Tente outro link do mesmo produto
- Verifique se o link está completo
- Use produtos disponíveis

### **Problema: CSS não carrega**

**Solução:**
1. Limpe o cache do navegador (Ctrl+Shift+Delete)
2. Recarregue a página (Ctrl+F5)
3. Verifique se está acessando via HTTP (não file://)

---

## 📝 Exemplo de Importação

### **Passo a Passo Completo:**

**1. Copie um link de produto:**
```
https://www.amazon.com.br/Mouse-Gamer-Logitech-G502-HERO/dp/B07GBZ4Q68
```

**2. Cole no campo de importação**

**3. Clique em "Importar"**

**4. Preview aparecerá:**
```
Nome: Mouse Gamer Logitech G502 HERO
Preço: R$ 279,00
Categoria: perifericos
Subcategoria: mouse
Origem: Amazon
```

**5. Clique em "Confirmar Importação"**

**6. Sucesso!** ✅
```
Produto importado e salvo no banco de dados!
```

**7. Produto aparecerá em:**
- ✅ Página de produtos
- ✅ Página inicial (se for destaque)
- ✅ Painel admin (produtos cadastrados)

---

## 🗄️ Integração com MySQL

### **Como funciona:**

1. **Você importa o produto** via link
2. **Sistema faz scraping** dos dados (nome, preço, imagem)
3. **Detecta a categoria** automaticamente
4. **Salva no MySQL Railway** via API
5. **Produto aparece no site** instantaneamente

### **Tabela no Banco:**
```sql
produtos (
  id VARCHAR(50),
  nome VARCHAR(255),
  descricao TEXT,
  preco DECIMAL(10,2),
  imagem VARCHAR(500),
  categoria VARCHAR(100),
  subcategoria VARCHAR(100),
  origem VARCHAR(50),
  link_original VARCHAR(500),
  estoque INT,
  ativo TINYINT(1),
  data_criacao TIMESTAMP,
  data_atualizacao TIMESTAMP
)
```

---

## 🎯 Dicas e Boas Práticas

### **✅ Faça:**
- Use links diretos de produtos
- Importe produtos de diferentes categorias
- Revise o preview antes de confirmar
- Mantenha o estoque atualizado
- Use imagens de boa qualidade

### **❌ Evite:**
- Links de busca ou listas
- Produtos sem imagem
- Produtos fora de estoque
- Duplicar produtos
- Links quebrados

---

## 📊 Categorias Disponíveis

O sistema detecta automaticamente as seguintes categorias:

1. **Hardware** - Processadores, placas de vídeo, memória RAM
2. **Periféricos** - Mouse, teclado, headset, monitor
3. **Computadores** - Notebooks, desktops, all-in-one
4. **Games** - Consoles, jogos, acessórios
5. **Celular & Smartphone** - Smartphones, tablets
6. **TV & Áudio** - TVs, soundbars, home theater
7. **Áudio** - Fones, caixas de som, microfones
8. **Redes** - Roteadores, switches, access points
9. **Casa Inteligente** - Alexa, Google Home, lâmpadas
10. **Acessórios** - Carregadores, cabos, adaptadores
11. **Espaço Gamer** - Cadeiras, mesas, iluminação
12. **Eletrônicos** - Tablets, e-readers, smartwatches
13. **PC Gamer** - Computadores montados para games
14. **Giftcards** - Cartões presente, créditos

---

## 🚀 Próximos Passos

Após importar seus produtos:

1. **Verifique a página de produtos:**
   - http://localhost:8081/src/paginas/produtos.html

2. **Verifique a página inicial:**
   - http://localhost:8081/index.html

3. **Teste os filtros e busca**

4. **Configure promoções** (em breve)

5. **Adicione mais produtos!**

---

## 📞 Suporte

Se encontrar problemas:

1. **Verifique o console do navegador** (F12)
2. **Verifique se os servidores estão rodando**
3. **Limpe o cache do navegador**
4. **Recarregue a página**

---

**Desenvolvido com ❤️ por Manus AI**  
**Versão:** 2.0.0  
**Data:** 13 de outubro de 2025

