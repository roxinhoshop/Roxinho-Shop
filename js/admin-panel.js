// Painel Administrativo - Roxinho Shop
// Este arquivo gerencia todas as funcionalidades do painel administrativo

class AdminPanel {
    constructor() {
        this.currentSection = 'dashboard';
        this.produtos = [];
        this.usuarios = [];
        this.pedidos = [];
        this.categorias = [];
        this.editandoProduto = null;
        this.editandoCategoria = null;
        
        this.init();
    }

    // Inicializar o painel administrativo
    init() {
        // Verificar se o usuário é administrador
        if (!window.authSystem.requireAdmin()) {
            return;
        }

        this.setupEventListeners();
        this.loadInitialData();
        this.updateUserInfo();
        this.showSection('dashboard');
        
        console.log('🎛️ Painel administrativo inicializado');
    }

    // Configurar event listeners
    setupEventListeners() {
        // Navegação do sidebar
        document.querySelectorAll('.admin-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.showSection(section);
            });
        });

        // Formulário de produto
        document.getElementById('form-produto').addEventListener('submit', (e) => {
            e.preventDefault();
            this.salvarProduto();
        });

        // Formulário de categoria
        document.getElementById('form-categoria').addEventListener('submit', (e) => {
            e.preventDefault();
            this.salvarCategoria();
        });

        // Filtros
        document.getElementById('filtro-produtos')?.addEventListener('input', () => this.filtrarProdutos());
        document.getElementById('filtro-categoria')?.addEventListener('change', () => this.filtrarProdutos());
        document.getElementById('filtro-status')?.addEventListener('change', () => this.filtrarProdutos());
        
        document.getElementById('filtro-usuarios')?.addEventListener('input', () => this.filtrarUsuarios());
        document.getElementById('filtro-tipo-usuario')?.addEventListener('change', () => this.filtrarUsuarios());
        
        document.getElementById('filtro-pedidos')?.addEventListener('input', () => this.filtrarPedidos());
        document.getElementById('filtro-status-pedido')?.addEventListener('change', () => this.filtrarPedidos());

        // Auto-gerar slug para categoria
        document.getElementById('categoria-nome')?.addEventListener('input', (e) => {
            const slug = this.generateSlug(e.target.value);
            document.getElementById('categoria-slug').value = slug;
        });

        // Fechar modais clicando fora
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.fecharTodosModais();
            }
        });
    }

    // Atualizar informações do usuário no header
    updateUserInfo() {
        const currentUser = window.authSystem.getCurrentUser();
        if (currentUser) {
            document.getElementById('admin-name').textContent = currentUser.nome;
        }
    }

    // Carregar dados iniciais
    async loadInitialData() {
        await this.carregarProdutos();
        await this.carregarUsuarios();
        await this.carregarPedidos();
        await this.carregarCategorias();
        this.updateDashboard();
    }

    // Mostrar seção específica
    showSection(sectionName) {
        // Remover classe active de todas as seções
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Remover classe active de todos os itens de navegação
        document.querySelectorAll('.admin-nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Ativar seção e item de navegação
        document.getElementById(`${sectionName}-section`).classList.add('active');
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
        
        this.currentSection = sectionName;

        // Carregar dados específicos da seção
        switch (sectionName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'produtos':
                this.renderProdutos();
                break;
            case 'usuarios':
                this.renderUsuarios();
                break;
            case 'pedidos':
                this.renderPedidos();
                break;
            case 'categorias':
                this.renderCategorias();
                break;
            case 'relatorios':
                this.renderRelatorios();
                break;
        }
    }

    // Atualizar dashboard com estatísticas
    updateDashboard() {
        document.getElementById('total-produtos').textContent = this.produtos.length;
        document.getElementById('total-usuarios').textContent = this.usuarios.length;
        document.getElementById('total-pedidos').textContent = this.pedidos.length;
        
        const totalVendas = this.pedidos.reduce((total, pedido) => {
            return total + (pedido.total || 0);
        }, 0);
        
        document.getElementById('total-vendas').textContent = this.formatarMoeda(totalVendas);
        
        // Renderizar gráfico de vendas
        this.renderVendasChart();
    }

    // Renderizar gráfico de vendas
    renderVendasChart() {
        const ctx = document.getElementById('vendas-chart');
        if (!ctx) return;

        // Dados simulados para os últimos 7 dias
        const labels = [];
        const data = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
            data.push(Math.random() * 5000 + 1000); // Dados simulados
        }

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Vendas (R$)',
                    data: data,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString('pt-BR');
                            }
                        }
                    }
                }
            }
        });
    }

    // Carregar produtos
    async carregarProdutos() {
        // Carregar produtos do localStorage ou usar dados padrão
        const produtosStorage = localStorage.getItem('roxinho_produtos_admin');
        if (produtosStorage) {
            this.produtos = JSON.parse(produtosStorage);
        } else {
            // Usar produtos do arquivo database.js como base
            if (window.produtos) {
                this.produtos = window.produtos.map(produto => ({
                    ...produto,
                    ativo: produto.emEstoque !== false,
                    data_criacao: new Date().toISOString(),
                    data_atualizacao: new Date().toISOString()
                }));
                this.salvarProdutosStorage();
            }
        }
    }

    // Salvar produtos no localStorage
    salvarProdutosStorage() {
        localStorage.setItem('roxinho_produtos_admin', JSON.stringify(this.produtos));
    }

    // Carregar usuários
    async carregarUsuarios() {
        const usuarios = JSON.parse(localStorage.getItem('roxinho_usuarios') || '[]');
        this.usuarios = usuarios;
    }

    // Carregar pedidos
    async carregarPedidos() {
        const pedidos = JSON.parse(localStorage.getItem('roxinho_pedidos') || '[]');
        this.pedidos = pedidos;
    }

    // Carregar categorias
    async carregarCategorias() {
        const categoriasStorage = localStorage.getItem('roxinho_categorias');
        if (categoriasStorage) {
            this.categorias = JSON.parse(categoriasStorage);
        } else {
            // Criar categorias padrão
            this.categorias = [
                { id: 1, nome: 'Hardware', slug: 'hardware', descricao: 'Componentes para computadores', icone: 'fas fa-microchip', ativo: true },
                { id: 2, nome: 'Periféricos', slug: 'perifericos', descricao: 'Acessórios e periféricos', icone: 'fas fa-keyboard', ativo: true },
                { id: 3, nome: 'Computadores', slug: 'computadores', descricao: 'Computadores completos', icone: 'fas fa-desktop', ativo: true },
                { id: 4, nome: 'Celular & Smartphone', slug: 'celular-smartphone', descricao: 'Smartphones e acessórios', icone: 'fas fa-mobile-alt', ativo: true }
            ];
            this.salvarCategoriasStorage();
        }
        
        // Atualizar select de categorias
        this.updateCategoriaSelects();
    }

    // Salvar categorias no localStorage
    salvarCategoriasStorage() {
        localStorage.setItem('roxinho_categorias', JSON.stringify(this.categorias));
    }

    // Atualizar selects de categoria
    updateCategoriaSelects() {
        const selects = document.querySelectorAll('#produto-categoria, #filtro-categoria');
        selects.forEach(select => {
            const currentValue = select.value;
            select.innerHTML = select.id === 'filtro-categoria' ? '<option value="">Todas as categorias</option>' : '<option value="">Selecione uma categoria</option>';
            
            this.categorias.filter(cat => cat.ativo).forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.nome;
                option.textContent = categoria.nome;
                select.appendChild(option);
            });
            
            select.value = currentValue;
        });
    }

    // Renderizar tabela de produtos
    renderProdutos() {
        const tbody = document.querySelector('#tabela-produtos tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.produtos.forEach(produto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${produto.id}</td>
                <td>
                    <img src="${produto.imagem || './imagens/placeholder.jpg'}" alt="${produto.nome}" 
                         onerror="this.src='./imagens/placeholder.jpg'">
                </td>
                <td>${produto.nome}</td>
                <td>${produto.categoria || 'Sem categoria'}</td>
                <td>${this.formatarMoeda(produto.preco)}</td>
                <td>${produto.estoque || 0}</td>
                <td>
                    <span class="status-badge ${produto.ativo ? 'status-ativo' : 'status-inativo'}">
                        ${produto.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="adminPanel.editarProduto(${produto.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="adminPanel.excluirProduto(${produto.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Filtrar produtos
    filtrarProdutos() {
        const filtroNome = document.getElementById('filtro-produtos').value.toLowerCase();
        const filtroCategoria = document.getElementById('filtro-categoria').value;
        const filtroStatus = document.getElementById('filtro-status').value;

        const produtosFiltrados = this.produtos.filter(produto => {
            const nomeMatch = produto.nome.toLowerCase().includes(filtroNome);
            const categoriaMatch = !filtroCategoria || produto.categoria === filtroCategoria;
            const statusMatch = !filtroStatus || 
                (filtroStatus === 'ativo' && produto.ativo) || 
                (filtroStatus === 'inativo' && !produto.ativo);

            return nomeMatch && categoriaMatch && statusMatch;
        });

        this.renderProdutosFiltrados(produtosFiltrados);
    }

    // Renderizar produtos filtrados
    renderProdutosFiltrados(produtos) {
        const tbody = document.querySelector('#tabela-produtos tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        produtos.forEach(produto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${produto.id}</td>
                <td>
                    <img src="${produto.imagem || './imagens/placeholder.jpg'}" alt="${produto.nome}" 
                         onerror="this.src='./imagens/placeholder.jpg'">
                </td>
                <td>${produto.nome}</td>
                <td>${produto.categoria || 'Sem categoria'}</td>
                <td>${this.formatarMoeda(produto.preco)}</td>
                <td>${produto.estoque || 0}</td>
                <td>
                    <span class="status-badge ${produto.ativo ? 'status-ativo' : 'status-inativo'}">
                        ${produto.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="adminPanel.editarProduto(${produto.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="adminPanel.excluirProduto(${produto.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Abrir modal de produto
    abrirModalProduto(produtoId = null) {
        this.editandoProduto = produtoId;
        const modal = document.getElementById('modal-produto');
        const titulo = document.getElementById('modal-produto-titulo');
        
        if (produtoId) {
            const produto = this.produtos.find(p => p.id === produtoId);
            if (produto) {
                titulo.textContent = 'Editar Produto';
                this.preencherFormularioProduto(produto);
            }
        } else {
            titulo.textContent = 'Novo Produto';
            document.getElementById('form-produto').reset();
        }
        
        modal.classList.add('show');
    }

    // Preencher formulário de produto
    preencherFormularioProduto(produto) {
        document.getElementById('produto-nome').value = produto.nome || '';
        document.getElementById('produto-marca').value = produto.marca || '';
        document.getElementById('produto-categoria').value = produto.categoria || '';
        document.getElementById('produto-sku').value = produto.sku || '';
        document.getElementById('produto-preco').value = produto.preco || '';
        document.getElementById('produto-preco-promocional').value = produto.precoPromocional || '';
        document.getElementById('produto-estoque').value = produto.estoque || '';
        document.getElementById('produto-peso').value = produto.peso || '';
        document.getElementById('produto-descricao-curta').value = produto.descricao_curta || '';
        document.getElementById('produto-descricao').value = produto.descricao || '';
        document.getElementById('produto-imagem').value = produto.imagem || '';
        document.getElementById('produto-ativo').checked = produto.ativo !== false;
        document.getElementById('produto-destaque').checked = produto.destaque === true;
    }

    // Salvar produto
    async salvarProduto() {
        const formData = {
            nome: document.getElementById('produto-nome').value.trim(),
            marca: document.getElementById('produto-marca').value.trim(),
            categoria: document.getElementById('produto-categoria').value,
            sku: document.getElementById('produto-sku').value.trim(),
            preco: parseFloat(document.getElementById('produto-preco').value) || 0,
            precoPromocional: parseFloat(document.getElementById('produto-preco-promocional').value) || null,
            estoque: parseInt(document.getElementById('produto-estoque').value) || 0,
            peso: parseFloat(document.getElementById('produto-peso').value) || null,
            descricao_curta: document.getElementById('produto-descricao-curta').value.trim(),
            descricao: document.getElementById('produto-descricao').value.trim(),
            imagem: document.getElementById('produto-imagem').value.trim(),
            ativo: document.getElementById('produto-ativo').checked,
            destaque: document.getElementById('produto-destaque').checked
        };

        // Validações básicas
        if (!formData.nome) {
            window.authSystem.showMessage('Nome do produto é obrigatório', 'error');
            return;
        }

        if (!formData.categoria) {
            window.authSystem.showMessage('Categoria é obrigatória', 'error');
            return;
        }

        if (formData.preco <= 0) {
            window.authSystem.showMessage('Preço deve ser maior que zero', 'error');
            return;
        }

        try {
            if (this.editandoProduto) {
                // Editar produto existente
                const index = this.produtos.findIndex(p => p.id === this.editandoProduto);
                if (index !== -1) {
                    this.produtos[index] = {
                        ...this.produtos[index],
                        ...formData,
                        data_atualizacao: new Date().toISOString()
                    };
                }
            } else {
                // Criar novo produto
                const novoId = this.produtos.length > 0 ? Math.max(...this.produtos.map(p => p.id)) + 1 : 1;
                const novoProduto = {
                    id: novoId,
                    ...formData,
                    data_criacao: new Date().toISOString(),
                    data_atualizacao: new Date().toISOString(),
                    avaliacao: 0,
                    avaliacoes: 0,
                    emEstoque: formData.estoque > 0,
                    freteGratis: formData.preco > 100 // Frete grátis para produtos acima de R$ 100
                };
                
                this.produtos.push(novoProduto);
            }

            this.salvarProdutosStorage();
            this.fecharModalProduto();
            this.renderProdutos();
            
            window.authSystem.showMessage(
                this.editandoProduto ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!',
                'success'
            );

        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            window.authSystem.showMessage('Erro ao salvar produto', 'error');
        }
    }

    // Editar produto
    editarProduto(produtoId) {
        this.abrirModalProduto(produtoId);
    }

    // Excluir produto
    excluirProduto(produtoId) {
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            this.produtos = this.produtos.filter(p => p.id !== produtoId);
            this.salvarProdutosStorage();
            this.renderProdutos();
            window.authSystem.showMessage('Produto excluído com sucesso!', 'success');
        }
    }

    // Fechar modal de produto
    fecharModalProduto() {
        document.getElementById('modal-produto').classList.remove('show');
        this.editandoProduto = null;
    }

    // Renderizar usuários
    renderUsuarios() {
        const tbody = document.querySelector('#tabela-usuarios tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.usuarios.forEach(usuario => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${usuario.id}</td>
                <td>${usuario.nome} ${usuario.sobrenome}</td>
                <td>${usuario.email}</td>
                <td>
                    <span class="status-badge ${usuario.tipo_usuario === 'admin' ? 'status-confirmado' : 'status-ativo'}">
                        ${usuario.tipo_usuario === 'admin' ? 'Admin' : 'Cliente'}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${usuario.ativo ? 'status-ativo' : 'status-inativo'}">
                        ${usuario.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td>${new Date(usuario.data_criacao).toLocaleDateString('pt-BR')}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="adminPanel.toggleUsuarioStatus(${usuario.id})">
                        <i class="fas fa-toggle-${usuario.ativo ? 'on' : 'off'}"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Alternar status do usuário
    toggleUsuarioStatus(usuarioId) {
        const usuario = this.usuarios.find(u => u.id === usuarioId);
        if (usuario) {
            usuario.ativo = !usuario.ativo;
            
            // Atualizar no localStorage
            localStorage.setItem('roxinho_usuarios', JSON.stringify(this.usuarios));
            
            this.renderUsuarios();
            window.authSystem.showMessage(
                `Usuário ${usuario.ativo ? 'ativado' : 'desativado'} com sucesso!`,
                'success'
            );
        }
    }

    // Filtrar usuários
    filtrarUsuarios() {
        const filtroNome = document.getElementById('filtro-usuarios').value.toLowerCase();
        const filtroTipo = document.getElementById('filtro-tipo-usuario').value;

        const usuariosFiltrados = this.usuarios.filter(usuario => {
            const nomeMatch = `${usuario.nome} ${usuario.sobrenome}`.toLowerCase().includes(filtroNome) ||
                            usuario.email.toLowerCase().includes(filtroNome);
            const tipoMatch = !filtroTipo || usuario.tipo_usuario === filtroTipo;

            return nomeMatch && tipoMatch;
        });

        this.renderUsuariosFiltrados(usuariosFiltrados);
    }

    // Renderizar usuários filtrados
    renderUsuariosFiltrados(usuarios) {
        const tbody = document.querySelector('#tabela-usuarios tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        usuarios.forEach(usuario => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${usuario.id}</td>
                <td>${usuario.nome} ${usuario.sobrenome}</td>
                <td>${usuario.email}</td>
                <td>
                    <span class="status-badge ${usuario.tipo_usuario === 'admin' ? 'status-confirmado' : 'status-ativo'}">
                        ${usuario.tipo_usuario === 'admin' ? 'Admin' : 'Cliente'}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${usuario.ativo ? 'status-ativo' : 'status-inativo'}">
                        ${usuario.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td>${new Date(usuario.data_criacao).toLocaleDateString('pt-BR')}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="adminPanel.toggleUsuarioStatus(${usuario.id})">
                        <i class="fas fa-toggle-${usuario.ativo ? 'on' : 'off'}"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Renderizar pedidos
    renderPedidos() {
        const tbody = document.querySelector('#tabela-pedidos tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.pedidos.forEach(pedido => {
            const usuario = this.usuarios.find(u => u.id === pedido.usuario_id);
            const nomeCliente = usuario ? `${usuario.nome} ${usuario.sobrenome}` : 'Cliente não encontrado';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${pedido.id}</td>
                <td>${pedido.numero_pedido || `PED-${pedido.id}`}</td>
                <td>${nomeCliente}</td>
                <td>${this.formatarMoeda(pedido.total || 0)}</td>
                <td>
                    <span class="status-badge status-${pedido.status || 'pendente'}">
                        ${this.formatarStatusPedido(pedido.status || 'pendente')}
                    </span>
                </td>
                <td>${new Date(pedido.data_pedido || pedido.data_criacao).toLocaleDateString('pt-BR')}</td>
                <td>
                    <select onchange="adminPanel.atualizarStatusPedido(${pedido.id}, this.value)" class="admin-select">
                        <option value="pendente" ${pedido.status === 'pendente' ? 'selected' : ''}>Pendente</option>
                        <option value="confirmado" ${pedido.status === 'confirmado' ? 'selected' : ''}>Confirmado</option>
                        <option value="processando" ${pedido.status === 'processando' ? 'selected' : ''}>Processando</option>
                        <option value="enviado" ${pedido.status === 'enviado' ? 'selected' : ''}>Enviado</option>
                        <option value="entregue" ${pedido.status === 'entregue' ? 'selected' : ''}>Entregue</option>
                        <option value="cancelado" ${pedido.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                    </select>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Atualizar status do pedido
    atualizarStatusPedido(pedidoId, novoStatus) {
        const pedido = this.pedidos.find(p => p.id === pedidoId);
        if (pedido) {
            pedido.status = novoStatus;
            
            // Atualizar timestamps baseado no status
            const agora = new Date().toISOString();
            switch (novoStatus) {
                case 'confirmado':
                    pedido.data_confirmacao = agora;
                    break;
                case 'enviado':
                    pedido.data_envio = agora;
                    break;
                case 'entregue':
                    pedido.data_entrega = agora;
                    break;
            }
            
            // Salvar no localStorage
            localStorage.setItem('roxinho_pedidos', JSON.stringify(this.pedidos));
            
            window.authSystem.showMessage('Status do pedido atualizado com sucesso!', 'success');
        }
    }

    // Filtrar pedidos
    filtrarPedidos() {
        const filtroTexto = document.getElementById('filtro-pedidos').value.toLowerCase();
        const filtroStatus = document.getElementById('filtro-status-pedido').value;

        const pedidosFiltrados = this.pedidos.filter(pedido => {
            const usuario = this.usuarios.find(u => u.id === pedido.usuario_id);
            const nomeCliente = usuario ? `${usuario.nome} ${usuario.sobrenome}`.toLowerCase() : '';
            const numeroPedido = (pedido.numero_pedido || `PED-${pedido.id}`).toLowerCase();
            
            const textoMatch = nomeCliente.includes(filtroTexto) || numeroPedido.includes(filtroTexto);
            const statusMatch = !filtroStatus || pedido.status === filtroStatus;

            return textoMatch && statusMatch;
        });

        this.renderPedidosFiltrados(pedidosFiltrados);
    }

    // Renderizar pedidos filtrados
    renderPedidosFiltrados(pedidos) {
        const tbody = document.querySelector('#tabela-pedidos tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        pedidos.forEach(pedido => {
            const usuario = this.usuarios.find(u => u.id === pedido.usuario_id);
            const nomeCliente = usuario ? `${usuario.nome} ${usuario.sobrenome}` : 'Cliente não encontrado';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${pedido.id}</td>
                <td>${pedido.numero_pedido || `PED-${pedido.id}`}</td>
                <td>${nomeCliente}</td>
                <td>${this.formatarMoeda(pedido.total || 0)}</td>
                <td>
                    <span class="status-badge status-${pedido.status || 'pendente'}">
                        ${this.formatarStatusPedido(pedido.status || 'pendente')}
                    </span>
                </td>
                <td>${new Date(pedido.data_pedido || pedido.data_criacao).toLocaleDateString('pt-BR')}</td>
                <td>
                    <select onchange="adminPanel.atualizarStatusPedido(${pedido.id}, this.value)" class="admin-select">
                        <option value="pendente" ${pedido.status === 'pendente' ? 'selected' : ''}>Pendente</option>
                        <option value="confirmado" ${pedido.status === 'confirmado' ? 'selected' : ''}>Confirmado</option>
                        <option value="processando" ${pedido.status === 'processando' ? 'selected' : ''}>Processando</option>
                        <option value="enviado" ${pedido.status === 'enviado' ? 'selected' : ''}>Enviado</option>
                        <option value="entregue" ${pedido.status === 'entregue' ? 'selected' : ''}>Entregue</option>
                        <option value="cancelado" ${pedido.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                    </select>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Renderizar categorias
    renderCategorias() {
        const tbody = document.querySelector('#tabela-categorias tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.categorias.forEach(categoria => {
            const produtosCount = this.produtos.filter(p => p.categoria === categoria.nome).length;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${categoria.id}</td>
                <td>
                    <i class="${categoria.icone || 'fas fa-tag'}"></i>
                    ${categoria.nome}
                </td>
                <td>${categoria.slug}</td>
                <td>${produtosCount}</td>
                <td>
                    <span class="status-badge ${categoria.ativo ? 'status-ativo' : 'status-inativo'}">
                        ${categoria.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="adminPanel.editarCategoria(${categoria.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="adminPanel.excluirCategoria(${categoria.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Abrir modal de categoria
    abrirModalCategoria(categoriaId = null) {
        this.editandoCategoria = categoriaId;
        const modal = document.getElementById('modal-categoria');
        const titulo = document.getElementById('modal-categoria-titulo');
        
        if (categoriaId) {
            const categoria = this.categorias.find(c => c.id === categoriaId);
            if (categoria) {
                titulo.textContent = 'Editar Categoria';
                this.preencherFormularioCategoria(categoria);
            }
        } else {
            titulo.textContent = 'Nova Categoria';
            document.getElementById('form-categoria').reset();
        }
        
        modal.classList.add('show');
    }

    // Preencher formulário de categoria
    preencherFormularioCategoria(categoria) {
        document.getElementById('categoria-nome').value = categoria.nome || '';
        document.getElementById('categoria-slug').value = categoria.slug || '';
        document.getElementById('categoria-descricao').value = categoria.descricao || '';
        document.getElementById('categoria-icone').value = categoria.icone || '';
        document.getElementById('categoria-ativa').checked = categoria.ativo !== false;
    }

    // Salvar categoria
    async salvarCategoria() {
        const formData = {
            nome: document.getElementById('categoria-nome').value.trim(),
            slug: document.getElementById('categoria-slug').value.trim(),
            descricao: document.getElementById('categoria-descricao').value.trim(),
            icone: document.getElementById('categoria-icone').value.trim(),
            ativo: document.getElementById('categoria-ativa').checked
        };

        // Validações básicas
        if (!formData.nome) {
            window.authSystem.showMessage('Nome da categoria é obrigatório', 'error');
            return;
        }

        if (!formData.slug) {
            window.authSystem.showMessage('Slug da categoria é obrigatório', 'error');
            return;
        }

        // Verificar se o slug já existe
        const slugExiste = this.categorias.some(cat => 
            cat.slug === formData.slug && cat.id !== this.editandoCategoria
        );
        
        if (slugExiste) {
            window.authSystem.showMessage('Este slug já está em uso', 'error');
            return;
        }

        try {
            if (this.editandoCategoria) {
                // Editar categoria existente
                const index = this.categorias.findIndex(c => c.id === this.editandoCategoria);
                if (index !== -1) {
                    this.categorias[index] = {
                        ...this.categorias[index],
                        ...formData
                    };
                }
            } else {
                // Criar nova categoria
                const novoId = this.categorias.length > 0 ? Math.max(...this.categorias.map(c => c.id)) + 1 : 1;
                const novaCategoria = {
                    id: novoId,
                    ...formData
                };
                
                this.categorias.push(novaCategoria);
            }

            this.salvarCategoriasStorage();
            this.updateCategoriaSelects();
            this.fecharModalCategoria();
            this.renderCategorias();
            
            window.authSystem.showMessage(
                this.editandoCategoria ? 'Categoria atualizada com sucesso!' : 'Categoria criada com sucesso!',
                'success'
            );

        } catch (error) {
            console.error('Erro ao salvar categoria:', error);
            window.authSystem.showMessage('Erro ao salvar categoria', 'error');
        }
    }

    // Editar categoria
    editarCategoria(categoriaId) {
        this.abrirModalCategoria(categoriaId);
    }

    // Excluir categoria
    excluirCategoria(categoriaId) {
        const produtosCount = this.produtos.filter(p => {
            const categoria = this.categorias.find(c => c.id === categoriaId);
            return categoria && p.categoria === categoria.nome;
        }).length;

        if (produtosCount > 0) {
            window.authSystem.showMessage(
                `Não é possível excluir esta categoria pois ela possui ${produtosCount} produto(s) associado(s)`,
                'error'
            );
            return;
        }

        if (confirm('Tem certeza que deseja excluir esta categoria?')) {
            this.categorias = this.categorias.filter(c => c.id !== categoriaId);
            this.salvarCategoriasStorage();
            this.updateCategoriaSelects();
            this.renderCategorias();
            window.authSystem.showMessage('Categoria excluída com sucesso!', 'success');
        }
    }

    // Fechar modal de categoria
    fecharModalCategoria() {
        document.getElementById('modal-categoria').classList.remove('show');
        this.editandoCategoria = null;
    }

    // Renderizar relatórios
    renderRelatorios() {
        this.renderProdutosMaisVendidosChart();
        this.renderVendasPorCategoriaChart();
    }

    // Renderizar gráfico de produtos mais vendidos
    renderProdutosMaisVendidosChart() {
        const ctx = document.getElementById('produtos-vendidos-chart');
        if (!ctx) return;

        // Dados simulados
        const labels = this.produtos.slice(0, 5).map(p => p.nome.substring(0, 20) + '...');
        const data = this.produtos.slice(0, 5).map(() => Math.floor(Math.random() * 100) + 10);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Vendas',
                    data: data,
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: '#667eea',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Renderizar gráfico de vendas por categoria
    renderVendasPorCategoriaChart() {
        const ctx = document.getElementById('vendas-categoria-chart');
        if (!ctx) return;

        const labels = this.categorias.map(c => c.nome);
        const data = this.categorias.map(() => Math.floor(Math.random() * 50000) + 10000);
        const colors = [
            '#667eea', '#764ba2', '#f093fb', '#f5576c',
            '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'
        ];

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Fechar todos os modais
    fecharTodosModais() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
        this.editandoProduto = null;
        this.editandoCategoria = null;
    }

    // Utilitários
    formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    }

    formatarStatusPedido(status) {
        const statusMap = {
            'pendente': 'Pendente',
            'confirmado': 'Confirmado',
            'processando': 'Processando',
            'enviado': 'Enviado',
            'entregue': 'Entregue',
            'cancelado': 'Cancelado'
        };
        return statusMap[status] || status;
    }

    generateSlug(text) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
}

// Funções globais para uso nos templates HTML
function abrirModalProduto() {
    window.adminPanel.abrirModalProduto();
}

function fecharModalProduto() {
    window.adminPanel.fecharModalProduto();
}

function abrirModalCategoria() {
    window.adminPanel.abrirModalCategoria();
}

function fecharModalCategoria() {
    window.adminPanel.fecharModalCategoria();
}

function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        window.authSystem.logout();
    }
}

// Inicializar painel administrativo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar o sistema de autenticação estar disponível
    const inicializarAdmin = () => {
        if (window.authSystem) {
            window.adminPanel = new AdminPanel();
        } else {
            setTimeout(inicializarAdmin, 100);
        }
    };
    
    inicializarAdmin();
});

console.log('🎛️ Sistema do painel administrativo carregado');
