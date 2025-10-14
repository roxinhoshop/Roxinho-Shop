/**
 * Gerencia as requisições e respostas para as diferentes funcionalidades do e-commerce.
 * Simula um backend RESTful usando localStorage para persistência de dados.
 */

class ApiSystem {
    /**
     * Construtor da classe ApiSystem.
     * Inicializa o sistema de API.
     */
    constructor() {
        /** @type {string} A URL base para as requisições da API. */
        this.baseURL = 'https://roxinho-shop-backend.vercel.app';
        /** @type {object} Objeto contendo os endpoints da API categorizados. */
        this.endpoints = {
            // Autenticação
            auth: {
                login: '/api/auth/login',
                register: '/api/auth/register',
                logout: '/api/auth/logout',
                refresh: '/api/auth/refresh'
            },
            
            // Usuários
            users: {
                profile: '/api/users/profile',
                update: '/api/users/update',
                list: '/api/users/list',
                toggle: '/api/users/toggle'
            },
            
            // Produtos
            products: {
                list: '/api/produtos',
                create: '/api/produtos',
                update: '/api/produtos/:id',
                delete: '/api/produtos/:id',
                get: '/api/produtos/:id'
            },
            
            // Categorias
            categories: {
                list: '/api/categorias',
                create: '/api/categorias',
                update: '/api/categorias/:id',
                delete: '/api/categorias/:id'
            },
            
            // Pedidos
            orders: {
                list: '/api/orders',
                create: '/api/orders',
                update: '/api/orders/:id',
                get: '/api/orders/:id'
            },
            
            // E-mail
            email: {
                welcome: '/api/email/welcome',
                orderConfirmation: '/api/email/order-confirmation',
                passwordReset: '/api/email/password-reset'
            }
        };
        
        this.init();
    }

    /**
     * Inicializa o sistema de APIs.
     */
    init() {
    }

    /**
     * Método genérico para fazer requisições HTTP.
     * @param {string} endpoint - O endpoint da API (ex: '/api/produtos').
     * @param {object} [options={}] - Opções de requisição (method, headers, body, etc.).
     * @returns {Promise<object>} Um objeto contendo `success`, `status`, `data` e `message`.
     */
    async request(endpoint, options = {}) {
        const url = this.baseURL + endpoint;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        if (window.authSystem && window.authSystem.sessionToken) {
            defaultOptions.headers['Authorization'] = `Bearer ${window.authSystem.sessionToken}`;
        }

        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, finalOptions);
            const data = await response.json();
            
            return {
                success: response.ok,
                status: response.status,
                data: data,
                message: data.message || (response.ok ? 'Operação realizada com sucesso' : 'Erro na operação')
            };
        } catch (error) {
            console.error('Erro na requisição:', error);
            return {
                success: false,
                status: 0,
                data: null,
                message: 'Erro de conexão'
            };
        }
    }

    /**
     * Simula uma chamada de API para login de usuário.
     * @param {string} email - O e-mail do usuário.
     * @param {string} password - A senha do usuário.
     * @returns {Promise<object>} O resultado da operação de login.
     */
    async login(email, password) {
        return new Promise((resolve) => {
            setTimeout(() => {
                window.authSystem.loginUser(email, password).then(resolve);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para registro de novo usuário.
     * @param {object} userData - Os dados do usuário a ser registrado.
     * @returns {Promise<object>} O resultado da operação de registro.
     */
    async register(userData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                window.authSystem.registerUser(userData).then(resolve);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para logout de usuário.
     * @returns {Promise<object>} O resultado da operação de logout.
     */
    async logout() {
        return new Promise((resolve) => {
            setTimeout(() => {
                window.authSystem.logout();
                resolve({ success: true, message: 'Logout realizado com sucesso' });
            }, 200);
        });
    }

    /**
     * Simula uma chamada de API para obter produtos.
     * @param {object} [filters={}] - Filtros para a busca de produtos (categoria, ativo, search).
     * @returns {Promise<object>} Um objeto com `success`, `data` (array de produtos) e `message`.
     */
    async getProducts(filters = {}) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let produtos = JSON.parse(localStorage.getItem('roxinho_produtos_admin') || '[]');
                
                if (filters.categoria) {
                    produtos = produtos.filter(p => p.categoria === filters.categoria);
                }
                
                if (filters.ativo !== undefined) {
                    produtos = produtos.filter(p => p.ativo === filters.ativo);
                }
                
                if (filters.search) {
                    const searchLower = filters.search.toLowerCase();
                    produtos = produtos.filter(p => 
                        p.nome.toLowerCase().includes(searchLower) ||
                        p.marca?.toLowerCase().includes(searchLower)
                    );
                }
                
                resolve({
                    success: true,
                    data: produtos,
                    message: `${produtos.length} produtos encontrados`
                });
            }, 300);
        });
    }

    /**
     * Simula uma chamada de API para criar um novo produto.
     * @param {object} productData - Os dados do novo produto.
     * @returns {Promise<object>} Um objeto com `success`, `data` (o produto criado) e `message`.
     */
    async createProduct(productData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                try {
                    const produtos = JSON.parse(localStorage.getItem('roxinho_produtos_admin') || '[]');
                    const novoId = produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) + 1 : 1;
                    
                    const novoProduto = {
                        id: novoId,
                        ...productData,
                        data_criacao: new Date().toISOString(),
                        data_atualizacao: new Date().toISOString(),
                        avaliacao: 0,
                        avaliacoes: 0
                    };
                    
                    produtos.push(novoProduto);
                    localStorage.setItem('roxinho_produtos_admin', JSON.stringify(produtos));
                    
                    resolve({
                        success: true,
                        data: novoProduto,
                        message: 'Produto criado com sucesso'
                    });
                } catch (error) {
                    resolve({
                        success: false,
                        data: null,
                        message: 'Erro ao criar produto'
                    });
                }
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para atualizar um produto existente.
     * @param {number} productId - O ID do produto a ser atualizado.
     * @param {object} productData - Os dados atualizados do produto.
     * @returns {Promise<object>} Um objeto com `success`, `data` (o produto atualizado) e `message`.
     */
    async updateProduct(productId, productData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                try {
                    const produtos = JSON.parse(localStorage.getItem('roxinho_produtos_admin') || '[]');
                    const index = produtos.findIndex(p => p.id === productId);
                    
                    if (index === -1) {
                        resolve({
                            success: false,
                            data: null,
                            message: 'Produto não encontrado'
                        });
                        return;
                    }
                    
                    produtos[index] = {
                        ...produtos[index],
                        ...productData,
                        data_atualizacao: new Date().toISOString()
                    };
                    
                    localStorage.setItem('roxinho_produtos_admin', JSON.stringify(produtos));
                    
                    resolve({
                        success: true,
                        data: produtos[index],
                        message: 'Produto atualizado com sucesso'
                    });
                } catch (error) {
                    resolve({
                        success: false,
                        data: null,
                        message: 'Erro ao atualizar produto'
                    });
                }
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para excluir um produto.
     * @param {number} productId - O ID do produto a ser excluído.
     * @returns {Promise<object>} Um objeto com `success` e `message`.
     */
    async deleteProduct(productId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                try {
                    const produtos = JSON.parse(localStorage.getItem('roxinho_produtos_admin') || '[]');
                    const produtosFiltrados = produtos.filter(p => p.id !== productId);
                    
                    if (produtos.length === produtosFiltrados.length) {
                        resolve({
                            success: false,
                            data: null,
                            message: 'Produto não encontrado'
                        });
                        return;
                    }
                    
                    localStorage.setItem('roxinho_produtos_admin', JSON.stringify(produtosFiltrados));
                    
                    resolve({
                        success: true,
                        data: null,
                        message: 'Produto excluído com sucesso'
                    });
                } catch (error) {
                    resolve({
                        success: false,
                        data: null,
                        message: 'Erro ao excluir produto'
                    });
                }
            }, 300);
        });
    }

    /**
     * Simula uma chamada de API para obter usuários.
     * @param {object} [filters={}] - Filtros para a busca de usuários (tipo_usuario, ativo, search).
     * @returns {Promise<object>} Um objeto com `success`, `data` (array de usuários sanitizados) e `message`.
     */
    async getUsers(filters = {}) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let usuarios = JSON.parse(localStorage.getItem('roxinho_usuarios') || '[]');
                
                if (filters.tipo_usuario) {
                    usuarios = usuarios.filter(u => u.tipo_usuario === filters.tipo_usuario);
                }
                
                if (filters.ativo !== undefined) {
                    usuarios = usuarios.filter(u => u.ativo === filters.ativo);
                }
                
                if (filters.search) {
                    const searchLower = filters.search.toLowerCase();
                    usuarios = usuarios.filter(u => 
                        u.nome.toLowerCase().includes(searchLower) ||
                        u.sobrenome.toLowerCase().includes(searchLower) ||
                        u.email.toLowerCase().includes(searchLower)
                    );
                }
                
                const usuariosSanitizados = usuarios.map(u => {
                    const { senha_hash, ...usuarioSanitizado } = u;
                    return usuarioSanitizado;
                });
                
                resolve({
                    success: true,
                    data: usuariosSanitizados,
                    message: `${usuariosSanitizados.length} usuários encontrados`
                });
            }, 300);
        });
    }

    /**
     * Simula uma chamada de API para alternar o status de um usuário (ativo/inativo).
     * @param {number} userId - O ID do usuário cujo status será alternado.
     * @returns {Promise<object>} Um objeto com `success`, `data` (o usuário atualizado) e `message`.
     */
    async toggleUserStatus(userId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                try {
                    const usuarios = JSON.parse(localStorage.getItem('roxinho_usuarios') || '[]');
                    const index = usuarios.findIndex(u => u.id === userId);
                    
                    if (index === -1) {
                        resolve({
                            success: false,
                            data: null,
                            message: 'Usuário não encontrado'
                        });
                        return;
                    }
                    
                    usuarios[index].ativo = !usuarios[index].ativo;
                    usuarios[index].data_atualizacao = new Date().toISOString();
                    
                    localStorage.setItem('roxinho_usuarios', JSON.stringify(usuarios));
                    
                    const { senha_hash, ...usuarioSanitizado } = usuarios[index];
                    
                    resolve({
                        success: true,
                        data: usuarioSanitizado,
                        message: `Usuário ${usuarios[index].ativo ? 'ativado' : 'desativado'} com sucesso`
                    });
                } catch (error) {
                    resolve({
                        success: false,
                        data: null,
                        message: 'Erro ao alterar status do usuário'
                    });
                }
            }, 300);
        });
    }

    /**
     * Simula uma chamada de API para obter pedidos.
     * @param {object} [filters={}] - Filtros para a busca de pedidos (status, usuario_id, search).
     * @returns {Promise<object>} Um objeto com `success`, `data` (array de pedidos) e `message`.
     */
    async getOrders(filters = {}) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let pedidos = JSON.parse(localStorage.getItem('roxinho_pedidos') || '[]');
                
                if (filters.status) {
                    pedidos = pedidos.filter(p => p.status === filters.status);
                }
                
                if (filters.usuario_id) {
                    pedidos = pedidos.filter(p => p.usuario_id === filters.usuario_id);
                }
                
                if (filters.search) {
                    const searchLower = filters.search.toLowerCase();
                    pedidos = pedidos.filter(p => 
                        (p.numero_pedido || `PED-${p.id}`).toLowerCase().includes(searchLower)
                    );
                }
                
                resolve({
                    success: true,
                    data: pedidos,
                    message: `${pedidos.length} pedidos encontrados`
                });
            }, 300);
        });
    }

    /**
     * Simula uma chamada de API para atualizar o status de um pedido.
     * @param {number} orderId - O ID do pedido a ser atualizado.
     * @param {string} status - O novo status do pedido.
     * @returns {Promise<object>} Um objeto com `success`, `data` (o pedido atualizado) e `message`.
     */
    async updateOrderStatus(orderId, status) {
        return new Promise((resolve) => {
            setTimeout(() => {
                try {
                    const pedidos = JSON.parse(localStorage.getItem('roxinho_pedidos') || '[]');
                    const index = pedidos.findIndex(p => p.id === orderId);
                    
                    if (index === -1) {
                        resolve({
                            success: false,
                            data: null,
                            message: 'Pedido não encontrado'
                        });
                        return;
                    }
                    
                    pedidos[index].status = status;
                    pedidos[index].data_atualizacao = new Date().toISOString();
                    
                    const agora = new Date().toISOString();
                    switch (status) {
                        case 'confirmado':
                            pedidos[index].data_confirmacao = agora;
                            break;
                        case 'enviado':
                            pedidos[index].data_envio = agora;
                            break;
                        case 'entregue':
                            pedidos[index].data_entrega = agora;
                            break;
                    }
                    
                    localStorage.setItem('roxinho_pedidos', JSON.stringify(pedidos));
                    
                    resolve({
                        success: true,
                        data: pedidos[index],
                        message: 'Status do pedido atualizado com sucesso'
                    });
                } catch (error) {
                    resolve({
                        success: false,
                        data: null,
                        message: 'Erro ao atualizar status do pedido'
                    });
                }
            }, 300);
        });
    }

    /**
     * Simula uma chamada de API para obter todos os produtos.
     * @returns {Promise<object[]>} Uma promessa que resolve com um array de produtos.
     */
    async getAllProducts() {
        return new Promise(resolve => {
            setTimeout(() => {
                const products = JSON.parse(localStorage.getItem("roxinho_produtos") || "[]");
                resolve(products);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para obter um produto específico pelo ID.
     * @param {number} productId - O ID do produto.
     * @returns {Promise<object|null>} Uma promessa que resolve com o produto ou null se não encontrado.
     */
    async getProductById(productId) {
        return new Promise(resolve => {
            setTimeout(() => {
                const products = JSON.parse(localStorage.getItem("roxinho_produtos") || "[]");
                const product = products.find(p => p.id === productId);
                resolve(product || null);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para adicionar um novo produto.
     * @param {object} productData - Os dados do novo produto.
     * @returns {Promise<object>} Uma promessa que resolve com o produto adicionado.
     */
    async addProduct(productData) {
        return new Promise(resolve => {
            setTimeout(() => {
                const products = JSON.parse(localStorage.getItem("roxinho_produtos") || "[]");
                const newProduct = {
                    id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
                    ...productData,
                    data_criacao: new Date().toISOString(),
                    data_atualizacao: new Date().toISOString()
                };
                products.push(newProduct);
                localStorage.setItem("roxinho_produtos", JSON.stringify(products));
                resolve(newProduct);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para atualizar um produto existente.
     * @param {number} productId - O ID do produto a ser atualizado.
     * @param {object} updatedData - Os dados atualizados do produto.
     * @returns {Promise<object|null>} Uma promessa que resolve com o produto atualizado ou null se não encontrado.
     */
    async updateProductFrontend(productId, updatedData) { // Renomeado para evitar conflito com o método de admin
        return new Promise(resolve => {
            setTimeout(() => {
                let products = JSON.parse(localStorage.getItem("roxinho_produtos") || "[]");
                const index = products.findIndex(p => p.id === productId);
                if (index !== -1) {
                    products[index] = { ...products[index], ...updatedData, data_atualizacao: new Date().toISOString() };
                    localStorage.setItem("roxinho_produtos", JSON.stringify(products));
                    resolve(products[index]);
                } else {
                    resolve(null);
                }
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para deletar um produto.
     * @param {number} productId - O ID do produto a ser deletado.
     * @returns {Promise<boolean>} Uma promessa que resolve com true se o produto foi deletado, false caso contrário.
     */
    async deleteProductFrontend(productId) { // Renomeado para evitar conflito com o método de admin
        return new Promise(resolve => {
            setTimeout(() => {
                let products = JSON.parse(localStorage.getItem("roxinho_produtos") || "[]");
                const initialLength = products.length;
                products = products.filter(p => p.id !== productId);
                localStorage.setItem("roxinho_produtos", JSON.stringify(products));
                resolve(products.length < initialLength);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para obter todos os usuários.
     * @returns {Promise<object[]>} Uma promessa que resolve com um array de usuários.
     */
    async getAllUsers() {
        return new Promise(resolve => {
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem("roxinho_usuarios") || "[]");
                const sanitizedUsers = users.map(user => {
                    const { senha_hash, ...sanitizedUser } = user;
                    return sanitizedUser;
                });
                resolve(sanitizedUsers);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para obter um usuário específico pelo ID.
     * @param {number} userId - O ID do usuário.
     * @returns {Promise<object|null>} Uma promessa que resolve com o usuário ou null se não encontrado.
     */
    async getUserById(userId) {
        return new Promise(resolve => {
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem("roxinho_usuarios") || "[]");
                const user = users.find(u => u.id === userId);
                if (user) {
                    const { senha_hash, ...sanitizedUser } = user;
                    resolve(sanitizedUser);
                } else {
                    resolve(null);
                }
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para atualizar um usuário existente.
     * @param {number} userId - O ID do usuário a ser atualizado.
     * @param {object} updatedData - Os dados atualizados do usuário.
     * @returns {Promise<object|null>} Uma promessa que resolve com o usuário atualizado ou null se não encontrado.
     */
    async updateUserFrontend(userId, updatedData) { // Renomeado para evitar conflito com o método de admin
        return new Promise(resolve => {
            setTimeout(() => {
                let users = JSON.parse(localStorage.getItem("roxinho_usuarios") || "[]");
                const index = users.findIndex(u => u.id === userId);
                if (index !== -1) {
                    const currentPasswordHash = users[index].senha_hash;
                    const newPassword = updatedData.senha;
                    let newPasswordHash = currentPasswordHash;

                    if (newPassword) {
                        newPasswordHash = `hashed_${newPassword}_${Math.random().toString(36).substr(2, 9)}`;
                    }

                    users[index] = { 
                        ...users[index], 
                        ...updatedData, 
                        senha_hash: newPasswordHash, 
                        data_atualizacao: new Date().toISOString() 
                    };
                    localStorage.setItem("roxinho_usuarios", JSON.stringify(users));
                    const { senha_hash, ...sanitizedUser } = users[index];
                    resolve(sanitizedUser);
                } else {
                    resolve(null);
                }
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para deletar um usuário.
     * @param {number} userId - O ID do usuário a ser deletado.
     * @returns {Promise<boolean>} Uma promessa que resolve com true se o usuário foi deletado, false caso contrário.
     */
    async deleteUserFrontend(userId) { // Renomeado para evitar conflito com o método de admin
        return new Promise(resolve => {
            setTimeout(() => {
                let users = JSON.parse(localStorage.getItem("roxinho_usuarios") || "[]");
                const initialLength = users.length;
                users = users.filter(u => u.id !== userId);
                localStorage.setItem("roxinho_usuarios", JSON.stringify(users));
                resolve(users.length < initialLength);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para obter todos os pedidos.
     * @returns {Promise<object[]>} Uma promessa que resolve com um array de pedidos.
     */
    async getAllOrders() {
        return new Promise(resolve => {
            setTimeout(() => {
                const orders = JSON.parse(localStorage.getItem("roxinho_pedidos") || "[]");
                resolve(orders);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para obter um pedido específico pelo ID.
     * @param {number} orderId - O ID do pedido.
     * @returns {Promise<object|null>} Uma promessa que resolve com o pedido ou null se não encontrado.
     */
    async getOrderById(orderId) {
        return new Promise(resolve => {
            setTimeout(() => {
                const orders = JSON.parse(localStorage.getItem("roxinho_pedidos") || "[]");
                const order = orders.find(o => o.id === orderId);
                resolve(order || null);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para adicionar um novo pedido.
     * @param {object} orderData - Os dados do novo pedido.
     * @returns {Promise<object>} Uma promessa que resolve com o pedido adicionado.
     */
    async addOrder(orderData) {
        return new Promise(resolve => {
            setTimeout(() => {
                const orders = JSON.parse(localStorage.getItem("roxinho_pedidos") || "[]");
                const newOrder = {
                    id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
                    ...orderData,
                    data_criacao: new Date().toISOString(),
                    data_atualizacao: new Date().toISOString()
                };
                orders.push(newOrder);
                localStorage.setItem("roxinho_pedidos", JSON.stringify(orders));
                resolve(newOrder);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para atualizar um pedido existente.
     * @param {number} orderId - O ID do pedido a ser atualizado.
     * @param {object} updatedData - Os dados atualizados do pedido.
     * @returns {Promise<object|null>} Uma promessa que resolve com o pedido atualizado ou null se não encontrado.
     */
    async updateOrderFrontend(orderId, updatedData) { // Renomeado para evitar conflito com o método de admin
        return new Promise(resolve => {
            setTimeout(() => {
                let orders = JSON.parse(localStorage.getItem("roxinho_pedidos") || "[]");
                const index = orders.findIndex(o => o.id === orderId);
                if (index !== -1) {
                    orders[index] = { ...orders[index], ...updatedData, data_atualizacao: new Date().toISOString() };
                    localStorage.setItem("roxinho_pedidos", JSON.stringify(orders));
                    resolve(orders[index]);
                } else {
                    resolve(null);
                }
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para deletar um pedido.
     * @param {number} orderId - O ID do pedido a ser deletado.
     * @returns {Promise<boolean>} Uma promessa que resolve com true se o pedido foi deletado, false caso contrário.
     */
    async deleteOrderFrontend(orderId) { // Renomeado para evitar conflito com o método de admin
        return new Promise(resolve => {
            setTimeout(() => {
                let orders = JSON.parse(localStorage.getItem("roxinho_pedidos") || "[]");
                const initialLength = orders.length;
                orders = orders.filter(o => o.id !== orderId);
                localStorage.setItem("roxinho_pedidos", JSON.stringify(orders));
                resolve(orders.length < initialLength);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para obter todas as categorias.
     * @returns {Promise<object[]>} Uma promessa que resolve com um array de categorias.
     */
    async getCategories() {
        return new Promise(resolve => {
            setTimeout(() => {
                const categories = JSON.parse(localStorage.getItem("roxinho_categorias") || "[]");
                resolve(categories);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para obter uma categoria específica pelo ID.
     * @param {number} categoryId - O ID da categoria.
     * @returns {Promise<object|null>} Uma promessa que resolve com a categoria ou null se não encontrada.
     */
    async getCategoryById(categoryId) {
        return new Promise(resolve => {
            setTimeout(() => {
                const categories = JSON.parse(localStorage.getItem("roxinho_categorias") || "[]");
                const category = categories.find(c => c.id === categoryId);
                resolve(category || null);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para adicionar uma nova categoria.
     * @param {object} categoryData - Os dados da nova categoria.
     * @returns {Promise<object>} Uma promessa que resolve com a categoria adicionada.
     */
    async addCategory(categoryData) {
        return new Promise(resolve => {
            setTimeout(() => {
                const categories = JSON.parse(localStorage.getItem("roxinho_categorias") || "[]");
                const newCategory = {
                    id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1,
                    ...categoryData,
                    data_criacao: new Date().toISOString(),
                    data_atualizacao: new Date().toISOString()
                };
                categories.push(newCategory);
                localStorage.setItem("roxinho_categorias", JSON.stringify(categories));
                resolve(newCategory);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para atualizar uma categoria existente.
     * @param {number} categoryId - O ID da categoria a ser atualizada.
     * @param {object} updatedData - Os dados atualizados da categoria.
     * @returns {Promise<object|null>} Uma promessa que resolve com a categoria atualizada ou null se não encontrada.
     */
    async updateCategory(categoryId, updatedData) {
        return new Promise(resolve => {
            setTimeout(() => {
                let categories = JSON.parse(localStorage.getItem("roxinho_categorias") || "[]");
                const index = categories.findIndex(c => c.id === categoryId);
                if (index !== -1) {
                    categories[index] = { ...categories[index], ...updatedData, data_atualizacao: new Date().toISOString() };
                    localStorage.setItem("roxinho_categorias", JSON.stringify(categories));
                    resolve(categories[index]);
                } else {
                    resolve(null);
                }
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para deletar uma categoria.
     * @param {number} categoryId - O ID da categoria a ser deletada.
     * @returns {Promise<boolean>} Uma promessa que resolve com true se a categoria foi deletada, false caso contrário.
     */
    async deleteCategory(categoryId) {
        return new Promise(resolve => {
            setTimeout(() => {
                let categories = JSON.parse(localStorage.getItem("roxinho_categorias") || "[]");
                const initialLength = categories.length;
                categories = categories.filter(c => c.id !== categoryId);
                localStorage.setItem("roxinho_categorias", JSON.stringify(categories));
                resolve(categories.length < initialLength);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para obter todos os cupons.
     * @returns {Promise<object[]>} Uma promessa que resolve com um array de cupons.
     */
    async getCoupons() {
        return new Promise(resolve => {
            setTimeout(() => {
                const coupons = JSON.parse(localStorage.getItem("roxinho_cupons") || "[]");
                resolve(coupons);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para obter um cupom específico pelo ID.
     * @param {number} couponId - O ID do cupom.
     * @returns {Promise<object|null>} Uma promessa que resolve com o cupom ou null se não encontrado.
     */
    async getCouponById(couponId) {
        return new Promise(resolve => {
            setTimeout(() => {
                const coupons = JSON.parse(localStorage.getItem("roxinho_cupons") || "[]");
                const coupon = coupons.find(c => c.id === couponId);
                resolve(coupon || null);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para adicionar um novo cupom.
     * @param {object} couponData - Os dados do novo cupom.
     * @returns {Promise<object>} Uma promessa que resolve com o cupom adicionado.
     */
    async addCoupon(couponData) {
        return new Promise(resolve => {
            setTimeout(() => {
                const coupons = JSON.parse(localStorage.getItem("roxinho_cupons") || "[]");
                const newCoupon = {
                    id: coupons.length > 0 ? Math.max(...coupons.map(c => c.id)) + 1 : 1,
                    ...couponData,
                    data_criacao: new Date().toISOString(),
                    data_atualizacao: new Date().toISOString()
                };
                coupons.push(newCoupon);
                localStorage.setItem("roxinho_cupons", JSON.stringify(coupons));
                resolve(newCoupon);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para atualizar um cupom existente.
     * @param {number} couponId - O ID do cupom a ser atualizado.
     * @param {object} updatedData - Os dados atualizados do cupom.
     * @returns {Promise<object|null>} Uma promessa que resolve com o cupom atualizado ou null se não encontrado.
     */
    async updateCoupon(couponId, updatedData) {
        return new Promise(resolve => {
            setTimeout(() => {
                let coupons = JSON.parse(localStorage.getItem("roxinho_cupons") || "[]");
                const index = coupons.findIndex(c => c.id === couponId);
                if (index !== -1) {
                    coupons[index] = { ...coupons[index], ...updatedData, data_atualizacao: new Date().toISOString() };
                    localStorage.setItem("roxinho_cupons", JSON.stringify(coupons));
                    resolve(coupons[index]);
                } else {
                    resolve(null);
                }
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para deletar um cupom.
     * @param {number} couponId - O ID do cupom a ser deletado.
     * @returns {Promise<boolean>} Uma promessa que resolve com true se o cupom foi deletado, false caso contrário.
     */
    async deleteCoupon(couponId) {
        return new Promise(resolve => {
            setTimeout(() => {
                let coupons = JSON.parse(localStorage.getItem("roxinho_cupons") || "[]");
                const initialLength = coupons.length;
                coupons = coupons.filter(c => c.id !== couponId);
                localStorage.setItem("roxinho_cupons", JSON.stringify(coupons));
                resolve(coupons.length < initialLength);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para obter todos os comentários/avaliações.
     * @returns {Promise<object[]>} Uma promessa que resolve com um array de comentários.
     */
    async getReviews() {
        return new Promise(resolve => {
            setTimeout(() => {
                const reviews = JSON.parse(localStorage.getItem("roxinho_reviews") || "[]");
                resolve(reviews);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para obter um comentário/avaliação específico pelo ID.
     * @param {number} reviewId - O ID do comentário/avaliação.
     * @returns {Promise<object|null>} Uma promessa que resolve com o comentário/avaliação ou null se não encontrado.
     */
    async getReviewById(reviewId) {
        return new Promise(resolve => {
            setTimeout(() => {
                const reviews = JSON.parse(localStorage.getItem("roxinho_reviews") || "[]");
                const review = reviews.find(r => r.id === reviewId);
                resolve(review || null);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para adicionar um novo comentário/avaliação.
     * @param {object} reviewData - Os dados do novo comentário/avaliação.
     * @returns {Promise<object>} Uma promessa que resolve com o comentário/avaliação adicionado.
     */
    async addReview(reviewData) {
        return new Promise(resolve => {
            setTimeout(() => {
                const reviews = JSON.parse(localStorage.getItem("roxinho_reviews") || "[]");
                const newReview = {
                    id: reviews.length > 0 ? Math.max(...reviews.map(r => r.id)) + 1 : 1,
                    ...reviewData,
                    data_criacao: new Date().toISOString(),
                    data_atualizacao: new Date().toISOString()
                };
                reviews.push(newReview);
                localStorage.setItem("roxinho_reviews", JSON.stringify(reviews));
                resolve(newReview);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para atualizar um comentário/avaliação existente.
     * @param {number} reviewId - O ID do comentário/avaliação a ser atualizado.
     * @param {object} updatedData - Os dados atualizados do comentário/avaliação.
     * @returns {Promise<object|null>} Uma promessa que resolve com o comentário/avaliação atualizado ou null se não encontrado.
     */
    async updateReview(reviewId, updatedData) {
        return new Promise(resolve => {
            setTimeout(() => {
                let reviews = JSON.parse(localStorage.getItem("roxinho_reviews") || "[]");
                const index = reviews.findIndex(r => r.id === reviewId);
                if (index !== -1) {
                    reviews[index] = { ...reviews[index], ...updatedData, data_atualizacao: new Date().toISOString() };
                    localStorage.setItem("roxinho_reviews", JSON.stringify(reviews));
                    resolve(reviews[index]);
                } else {
                    resolve(null);
                }
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para deletar um comentário/avaliação.
     * @param {number} reviewId - O ID do comentário/avaliação a ser deletado.
     * @returns {Promise<boolean>} Uma promessa que resolve com true se o comentário/avaliação foi deletado, false caso contrário.
     */
    async deleteReview(reviewId) {
        return new Promise(resolve => {
            setTimeout(() => {
                let reviews = JSON.parse(localStorage.getItem("roxinho_reviews") || "[]");
                const initialLength = reviews.length;
                reviews = reviews.filter(r => r.id !== reviewId);
                localStorage.setItem("roxinho_reviews", JSON.stringify(reviews));
                resolve(reviews.length < initialLength);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para obter todos os itens do carrinho.
     * @returns {Promise<object[]>} Uma promessa que resolve com um array de itens do carrinho.
     */
    async getCartItems() {
        return new Promise(resolve => {
            setTimeout(() => {
                const cartItems = JSON.parse(localStorage.getItem("roxinho_carrinho") || "[]");
                resolve(cartItems);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para adicionar um item ao carrinho.
     * @param {object} cartItemData - Os dados do item a ser adicionado ao carrinho.
     * @returns {Promise<object>} Uma promessa que resolve com o item do carrinho adicionado.
     */
    async addCartItem(cartItemData) {
        return new Promise(resolve => {
            setTimeout(() => {
                const cartItems = JSON.parse(localStorage.getItem("roxinho_carrinho") || "[]");
                const newCartItem = {
                    id: cartItems.length > 0 ? Math.max(...cartItems.map(item => item.id)) + 1 : 1,
                    ...cartItemData,
                    data_adicao: new Date().toISOString()
                };
                cartItems.push(newCartItem);
                localStorage.setItem("roxinho_carrinho", JSON.stringify(cartItems));
                resolve(newCartItem);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para atualizar um item no carrinho.
     * @param {number} cartItemId - O ID do item do carrinho a ser atualizado.
     * @param {object} updatedData - Os dados atualizados do item do carrinho.
     * @returns {Promise<object|null>} Uma promessa que resolve com o item do carrinho atualizado ou null se não encontrado.
     */
    async updateCartItem(cartItemId, updatedData) {
        return new Promise(resolve => {
            setTimeout(() => {
                let cartItems = JSON.parse(localStorage.getItem("roxinho_carrinho") || "[]");
                const index = cartItems.findIndex(item => item.id === cartItemId);
                if (index !== -1) {
                    cartItems[index] = { ...cartItems[index], ...updatedData, data_atualizacao: new Date().toISOString() };
                    localStorage.setItem("roxinho_carrinho", JSON.stringify(cartItems));
                    resolve(cartItems[index]);
                } else {
                    resolve(null);
                }
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para remover um item do carrinho.
     * @param {number} cartItemId - O ID do item do carrinho a ser removido.
     * @returns {Promise<boolean>} Uma promessa que resolve com true se o item foi removido, false caso contrário.
     */
    async deleteCartItem(cartItemId) {
        return new Promise(resolve => {
            setTimeout(() => {
                let cartItems = JSON.parse(localStorage.getItem("roxinho_carrinho") || "[]");
                const initialLength = cartItems.length;
                cartItems = cartItems.filter(item => item.id !== cartItemId);
                localStorage.setItem("roxinho_carrinho", JSON.stringify(cartItems));
                resolve(cartItems.length < initialLength);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para limpar o carrinho de compras.
     * @returns {Promise<boolean>} Uma promessa que resolve com true se o carrinho foi limpo, false caso contrário.
     */
    async clearCart() {
        return new Promise(resolve => {
            setTimeout(() => {
                localStorage.removeItem("roxinho_carrinho");
                resolve(true);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para processar um pagamento.
     * @param {object} paymentData - Os dados do pagamento.
     * @returns {Promise<object>} Uma promessa que resolve com o resultado do pagamento.
     */
    async processPayment(paymentData) {
        return new Promise(resolve => {
            setTimeout(() => {
                const paymentResult = {
                    success: true,
                    transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    amount: paymentData.amount,
                    currency: paymentData.currency || "BRL",
                    date: new Date().toISOString()
                };
                resolve(paymentResult);
            }, 1500);
        });
    }

    /**
     * Simula uma chamada de API para buscar produtos com base em um termo de pesquisa.
     * @param {string} searchTerm - O termo de pesquisa.
     * @returns {Promise<object[]>} Uma promessa que resolve com um array de produtos correspondentes.
     */
    async searchProducts(searchTerm) {
        return new Promise(resolve => {
            setTimeout(() => {
                const products = JSON.parse(localStorage.getItem("roxinho_produtos") || "[]");
                const filteredProducts = products.filter(p => 
                    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.descricao.toLowerCase().includes(searchTerm.toLowerCase())
                );
                resolve(filteredProducts);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para filtrar produtos por categoria.
     * @param {string} categoryName - O nome da categoria.
     * @returns {Promise<object[]>} Uma promessa que resolve com um array de produtos na categoria.
     */
    async filterProductsByCategory(categoryName) {
        return new Promise(resolve => {
            setTimeout(() => {
                const products = JSON.parse(localStorage.getItem("roxinho_produtos") || "[]");
                const filteredProducts = products.filter(p => 
                    p.categoria.toLowerCase() === categoryName.toLowerCase()
                );
                resolve(filteredProducts);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para obter produtos em destaque.
     * @returns {Promise<object[]>} Uma promessa que resolve com um array de produtos em destaque.
     */
    async getFeaturedProducts() {
        return new Promise(resolve => {
            setTimeout(() => {
                const products = JSON.parse(localStorage.getItem("roxinho_produtos") || "[]");
                const featuredProducts = products.filter(p => p.destaque === true);
                resolve(featuredProducts);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para obter produtos mais vendidos.
     * @returns {Promise<object[]>} Uma promessa que resolve com um array de produtos mais vendidos.
     */
    async getBestSellingProducts() {
        return new Promise(resolve => {
            setTimeout(() => {
                const products = JSON.parse(localStorage.getItem("roxinho_produtos") || "[]");
                const bestSellingProducts = products.sort((a, b) => (b.vendas || 0) - (a.vendas || 0)).slice(0, 10);
                resolve(bestSellingProducts);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para obter produtos com base em um filtro de preço.
     * @param {number} minPrice - Preço mínimo.
     * @param {number} maxPrice - Preço máximo.
     * @returns {Promise<object[]>} Uma promessa que resolve com um array de produtos dentro da faixa de preço.
     */
    async filterProductsByPrice(minPrice, maxPrice) {
        return new Promise(resolve => {
            setTimeout(() => {
                const products = JSON.parse(localStorage.getItem("roxinho_produtos") || "[]");
                const filteredProducts = products.filter(p => 
                    p.preco >= minPrice && p.preco <= maxPrice
                );
                resolve(filteredProducts);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para obter os dados do perfil do usuário logado.
     * @param {number} userId - O ID do usuário.
     * @returns {Promise<object|null>} Uma promessa que resolve com os dados do perfil do usuário ou null.
     */
    async getUserProfile(userId) {
        return this.getUserById(userId);
    }

    /**
     * Simula uma chamada de API para atualizar os dados do perfil do usuário.
     * @param {number} userId - O ID do usuário.
     * @param {object} profileData - Os dados do perfil a serem atualizados.
     * @returns {Promise<object|null>} Uma promessa que resolve com os dados do perfil atualizados ou null.
     */
    async updateUserProfile(userId, profileData) {
        return this.updateUserFrontend(userId, profileData);
    }

    /**
     * Simula uma chamada de API para obter o histórico de compras de um usuário.
     * @param {number} userId - O ID do usuário.
     * @returns {Promise<object[]>} Uma promessa que resolve com um array de pedidos do usuário.
     */
    async getUserOrderHistory(userId) {
        return new Promise(resolve => {
            setTimeout(async () => {
                const allOrders = await this.getAllOrders();
                const userOrders = allOrders.filter(order => order.userId === userId);
                resolve(userOrders);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para adicionar um item à lista de desejos de um usuário.
     * @param {number} userId - O ID do usuário.
     * @param {number} productId - O ID do produto a ser adicionado.
     * @returns {Promise<object[]>} Uma promessa que resolve com a lista de desejos atualizada.
     */
    async addWishlistItem(userId, productId) {
        return new Promise(async resolve => {
            setTimeout(async () => {
                const user = await this.getUserById(userId);
                if (user) {
                    if (!user.wishlist) user.wishlist = [];
                    if (!user.wishlist.includes(productId)) {
                        user.wishlist.push(productId);
                        await this.updateUserFrontend(userId, { wishlist: user.wishlist });
                    }
                    resolve(user.wishlist);
                } else {
                    resolve(null);
                }
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para remover um item da lista de desejos de um usuário.
     * @param {number} userId - O ID do usuário.
     * @param {number} productId - O ID do produto a ser removido.
     * @returns {Promise<object[]>} Uma promessa que resolve com a lista de desejos atualizada.
     */
    async removeWishlistItem(userId, productId) {
        return new Promise(async resolve => {
            setTimeout(async () => {
                const user = await this.getUserById(userId);
                if (user && user.wishlist) {
                    user.wishlist = user.wishlist.filter(id => id !== productId);
                    await this.updateUserFrontend(userId, { wishlist: user.wishlist });
                    resolve(user.wishlist);
                } else {
                    resolve(null);
                }
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para obter a lista de desejos de um usuário.
     * @param {number} userId - O ID do usuário.
     * @returns {Promise<object[]>} Uma promessa que resolve com a lista de desejos do usuário.
     */
    async getWishlist(userId) {
        return new Promise(async resolve => {
            setTimeout(async () => {
                const user = await this.getUserById(userId);
                if (user && user.wishlist) {
                    const products = await this.getAllProducts();
                    const wishlistProducts = products.filter(p => user.wishlist.includes(p.id));
                    resolve(wishlistProducts);
                } else {
                    resolve([]);
                }
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para aplicar um cupom de desconto.
     * @param {string} couponCode - O código do cupom.
     * @param {number} totalAmount - O valor total da compra.
     * @returns {Promise<object>} Uma promessa que resolve com o valor do desconto e o novo total.
     */
    async applyCoupon(couponCode, totalAmount) {
        return new Promise(async resolve => {
            setTimeout(async () => {
                const coupons = await this.getCoupons();
                const coupon = coupons.find(c => c.code === couponCode && c.ativo);

                if (coupon) {
                    let discountAmount = 0;
                    if (coupon.tipo === "porcentagem") {
                        discountAmount = totalAmount * (coupon.valor / 100);
                    } else if (coupon.tipo === "fixo") {
                        discountAmount = coupon.valor;
                    }
                    const newTotal = totalAmount - discountAmount;
                    resolve({ success: true, discountAmount, newTotal, coupon });
                } else {
                    resolve({ success: false, message: "Cupom inválido ou expirado." });
                }
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para registrar uma transação de pagamento.
     * @param {object} transactionData - Dados da transação.
     * @returns {Promise<object>} Uma promessa que resolve com o objeto da transação registrada.
     */
    async recordTransaction(transactionData) {
        return new Promise(resolve => {
            setTimeout(() => {
                const transactions = JSON.parse(localStorage.getItem("roxinho_transacoes") || "[]");
                const newTransaction = {
                    id: transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1,
                    ...transactionData,
                    data_transacao: new Date().toISOString()
                };
                transactions.push(newTransaction);
                localStorage.setItem("roxinho_transacoes", JSON.stringify(transactions));
                resolve(newTransaction);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para obter todas as transações.
     * @returns {Promise<object[]>} Uma promessa que resolve com um array de transações.
     */
    async getTransactions() {
        return new Promise(resolve => {
            setTimeout(() => {
                const transactions = JSON.parse(localStorage.getItem("roxinho_transacoes") || "[]");
                resolve(transactions);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para obter uma transação específica pelo ID.
     * @param {number} transactionId - O ID da transação.
     * @returns {Promise<object|null>} Uma promessa que resolve com a transação ou null se não encontrada.
     */
    async getTransactionById(transactionId) {
        return new Promise(resolve => {
            setTimeout(() => {
                const transactions = JSON.parse(localStorage.getItem("roxinho_transacoes") || "[]");
                const transaction = transactions.find(t => t.id === transactionId);
                resolve(transaction || null);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para obter todos os administradores.
     * @returns {Promise<object[]>} Uma promessa que resolve com um array de usuários administradores.
     */
    async getAdmins() {
        return new Promise(async resolve => {
            setTimeout(async () => {
                const users = await this.getAllUsers();
                const admins = users.filter(user => user.tipo_usuario === "admin");
                resolve(admins);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para adicionar um novo administrador.
     * @param {object} adminData - Os dados do novo administrador.
     * @returns {Promise<object>} Uma promessa que resolve com o administrador adicionado.
     */
    async addAdmin(adminData) {
        return new Promise(async resolve => {
            setTimeout(async () => {
                const users = JSON.parse(localStorage.getItem("roxinho_usuarios") || "[]");
                const newAdmin = {
                    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
                    ...adminData,
                    tipo_usuario: "admin",
                    data_criacao: new Date().toISOString(),
                    data_atualizacao: new Date().toISOString()
                };
                users.push(newAdmin);
                localStorage.setItem("roxinho_usuarios", JSON.stringify(users));
                const { senha_hash, ...sanitizedAdmin } = newAdmin;
                resolve(sanitizedAdmin);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para remover um administrador.
     * @param {number} adminId - O ID do administrador a ser removido.
     * @returns {Promise<boolean>} Uma promessa que resolve com true se o administrador foi removido, false caso contrário.
     */
    async removeAdmin(adminId) {
        return new Promise(async resolve => {
            setTimeout(async () => {
                let users = JSON.parse(localStorage.getItem("roxinho_usuarios") || "[]");
                const initialLength = users.length;
                users = users.filter(u => u.id !== adminId || u.tipo_usuario !== "admin");
                localStorage.setItem("roxinho_usuarios", JSON.stringify(users));
                resolve(users.length < initialLength);
            }, 500);
        });
    }

    /**
     * Simula uma chamada de API para obter estatísticas do e-commerce.
     * @returns {Promise<object>} Uma promessa que resolve com um objeto de estatísticas.
     */
    async getEcommerceStats() {
        return new Promise(async resolve => {
            setTimeout(async () => {
                const products = await this.getAllProducts();
                const users = await this.getAllUsers();
                const orders = await this.getAllOrders();
                const transactions = await this.getTransactions();

                const totalProducts = products.length;
                const totalUsers = users.length;
                const totalOrders = orders.length;
                const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

                resolve({
                    totalProducts,
                    totalUsers,
                    totalOrders,
                    totalRevenue,
                });
            }, 500);
        });
    }
}

// Instanciar o sistema de API globalmente
window.apiSystem = new ApiSystem();

