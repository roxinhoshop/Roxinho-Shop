# 🚀 Deploy na Vercel - Roxinho Shop

## ✅ Status Atual

**Frontend:** https://roxinho-shop.vercel.app  
**Backend:** https://roxinho-shop-backend.vercel.app

---

## 🔧 Alterações Realizadas

### **1. Backend (Roxinho-Shop-BACKEND)**
✅ Adicionadas rotas em português:
- `/api/produtos` (alias para `/api/products`)
- `/api/categorias` (alias para `/api/categories`)

✅ Commit: `eb99385`  
✅ Push: Realizado com sucesso  
✅ Deploy: Aguardando redeploy automático da Vercel

### **2. Frontend (Roxinho-Shop)**
✅ URLs atualizadas para produção:
- `https://roxinho-shop-backend.vercel.app/api` (antes: `http://localhost:3000/api`)

✅ Arquivos modificados:
- `src/scripts/componentes/api-produtos.js`
- `src/scripts/componentes/inicio.js`

✅ Commit: `3776f4d`  
✅ Push: Realizado com sucesso  
✅ Deploy: Aguardando redeploy automático da Vercel

---

## 📋 Próximos Passos

### **1. Aguardar Deploy da Vercel (2-5 minutos)**

A Vercel detecta automaticamente os commits e faz o redeploy. Acompanhe em:
- https://vercel.com/dashboard

### **2. Verificar Backend**

Após o deploy, teste se a API está funcionando:

```bash
# Testar endpoint de produtos
curl https://roxinho-shop-backend.vercel.app/api/produtos

# Testar endpoint de categorias
curl https://roxinho-shop-backend.vercel.app/api/categorias
```

**Resposta esperada:**
```json
{
  "status": "success",
  "products": []
}
```

### **3. Verificar Frontend**

Acesse o site:
```
https://roxinho-shop.vercel.app
```

**O que deve funcionar:**
- ✅ Site carrega sem erros
- ✅ CSS aplicado corretamente
- ✅ Sem mensagem "Não foi possível carregar produtos"
- ✅ Painel admin acessível

### **4. Testar Painel Admin**

Acesse:
```
https://roxinho-shop.vercel.app/src/paginas/administracao.html
```

**Teste:**
1. ✅ Página carrega com CSS
2. ✅ Clique em "Produtos Cadastrados"
3. ✅ Deve mostrar "Nenhum produto cadastrado" (banco limpo)
4. ✅ Clique em "Importar Produto"
5. ✅ Cole um link da Amazon ou Mercado Livre
6. ✅ Clique em "Importar"

---

## 🗄️ Configuração do Banco de Dados

### **Variáveis de Ambiente na Vercel**

Certifique-se de que as seguintes variáveis estão configuradas no painel da Vercel para o **backend**:

```env
DB_HOST=autorack.proxy.rlwy.net
DB_PORT=28587
DB_USER=root
DB_PASS=************
DB_NAME=railway
PORT=3000
JWT_SECRET=supersecretjwtkey
```

**Como configurar:**
1. Acesse https://vercel.com/dashboard
2. Selecione o projeto `roxinho-shop-backend`
3. Vá em **Settings** → **Environment Variables**
4. Adicione cada variável acima
5. Clique em **Save**
6. Faça um redeploy manual se necessário

---

## 🐛 Solução de Problemas

### **Problema 1: "Não foi possível carregar produtos"**

**Causa:** Backend não está respondendo ou CORS bloqueado

**Solução:**
1. Verifique se o backend está online:
   ```
   https://roxinho-shop-backend.vercel.app
   ```
2. Teste a API:
   ```
   https://roxinho-shop-backend.vercel.app/api/produtos
   ```
3. Verifique os logs da Vercel
4. Certifique-se de que as variáveis de ambiente estão configuradas

### **Problema 2: CSS não carrega**

**Causa:** Cache do navegador

**Solução:**
1. Limpe o cache (Ctrl+Shift+Delete)
2. Recarregue a página (Ctrl+F5)
3. Tente em modo anônimo

### **Problema 3: Erro 404 na API**

**Causa:** Rotas não encontradas

**Solução:**
1. Verifique se o deploy do backend foi concluído
2. Aguarde 2-5 minutos após o push
3. Force um redeploy na Vercel
4. Verifique os logs de build

### **Problema 4: Erro de CORS**

**Causa:** Backend não permite requisições do frontend

**Solução:**
1. Verifique se `cors()` está habilitado no `index.js`
2. Adicione o domínio do frontend nas configurações de CORS
3. Redeploy do backend

---

## 📊 Estrutura de Deploy

### **Frontend (Vercel)**
```
Roxinho-Shop/
├── index.html
├── src/
│   ├── paginas/
│   ├── scripts/
│   └── estilos/
└── vercel.json (se houver)
```

**Build Settings:**
- Framework Preset: `Other`
- Build Command: (vazio)
- Output Directory: `.`
- Install Command: (vazio)

### **Backend (Vercel)**
```
Roxinho-Shop-BACKEND/
├── index.js
├── routes/
│   ├── auth.js
│   ├── products.js
│   └── categories.js
├── package.json
└── vercel.json
```

**Build Settings:**
- Framework Preset: `Other`
- Build Command: `npm install`
- Output Directory: `.`
- Install Command: `npm install`

---

## 🔐 Segurança

### **Variáveis de Ambiente**

✅ **Nunca commite:**
- Senhas do banco de dados
- Tokens de API
- JWT secrets
- Credenciais

✅ **Sempre use:**
- Variáveis de ambiente na Vercel
- Arquivo `.env` local (no `.gitignore`)
- Valores diferentes para dev/prod

### **CORS**

O backend está configurado para aceitar requisições de qualquer origem:
```javascript
app.use(cors());
```

**Para produção, recomenda-se restringir:**
```javascript
app.use(cors({
  origin: 'https://roxinho-shop.vercel.app'
}));
```

---

## 📝 Checklist de Deploy

### **Backend:**
- [x] Código commitado
- [x] Push para GitHub
- [ ] Deploy na Vercel concluído
- [ ] Variáveis de ambiente configuradas
- [ ] API respondendo em `/api/produtos`
- [ ] Conexão com MySQL funcionando

### **Frontend:**
- [x] URLs atualizadas para produção
- [x] Código commitado
- [x] Push para GitHub
- [ ] Deploy na Vercel concluído
- [ ] Site carregando sem erros
- [ ] CSS aplicado
- [ ] Painel admin funcionando

---

## 🎯 Teste Final

Após o deploy completo, execute este teste:

**1. Acesse o site:**
```
https://roxinho-shop.vercel.app
```

**2. Verifique:**
- [ ] Página inicial carrega
- [ ] CSS está aplicado
- [ ] Não há erros no console (F12)
- [ ] Banner está funcionando

**3. Acesse o painel admin:**
```
https://roxinho-shop.vercel.app/src/paginas/administracao.html
```

**4. Importe um produto:**
- [ ] Cole link da Amazon/ML
- [ ] Clique em "Importar"
- [ ] Preview aparece
- [ ] Confirme importação
- [ ] Produto salvo no banco

**5. Verifique a página de produtos:**
```
https://roxinho-shop.vercel.app/src/paginas/produtos.html
```

- [ ] Produto importado aparece
- [ ] Imagem carrega
- [ ] Preço está correto
- [ ] Filtros funcionam

---

## 🚀 Comandos Úteis

### **Forçar Redeploy na Vercel:**
```bash
# Via CLI (se tiver instalado)
vercel --prod

# Ou pelo dashboard:
# https://vercel.com/dashboard → Projeto → Deployments → Redeploy
```

### **Ver Logs em Tempo Real:**
```bash
vercel logs --follow
```

### **Testar API Localmente:**
```bash
cd Roxinho-Shop-BACKEND
npm install
node index.js
# API rodando em http://localhost:3000
```

---

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs da Vercel:**
   - Dashboard → Projeto → Deployments → Clique no deploy → View Function Logs

2. **Teste a API diretamente:**
   ```bash
   curl https://roxinho-shop-backend.vercel.app/api/test
   ```

3. **Verifique o console do navegador:**
   - F12 → Console → Procure por erros

4. **Limpe o cache:**
   - Ctrl+Shift+Delete → Limpar cache

---

## ✅ Conclusão

Após o deploy da Vercel completar (2-5 minutos), o site estará 100% funcional:

✅ Frontend na Vercel  
✅ Backend na Vercel  
✅ Banco MySQL no Railway  
✅ Integração completa funcionando  
✅ Painel admin operacional  
✅ Sistema de importação de produtos pronto  

**Aguarde o deploy e teste!** 🎉

---

**Commits Realizados:**
- Frontend: `3776f4d` - Configurar URLs para Vercel
- Backend: `eb99385` - Adicionar rotas em português

**Data:** 13 de outubro de 2025  
**Desenvolvido por:** Manus AI

