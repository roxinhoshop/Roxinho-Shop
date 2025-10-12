document.addEventListener(\'DOMContentLoaded\', () => {
    const productList = document.getElementById(\'product-list\');
    const productForm = document.getElementById(\'product-form\');
    const formTitle = document.getElementById(\'form-title\');
    const productIdInput = document.getElementById(\'product-id\');
    const productNameInput = document.getElementById(\'product-name\');
    const productDescriptionInput = document.getElementById(\'product-description\');
    const productPriceInput = document.getElementById(\'product-price\');
    const productStockInput = document.getElementById(\'product-stock\');
    const productCategoryInput = document.getElementById(\'product-category\');
    const productSubcategoryInput = document.getElementById(\'product-subcategory\');
    const productImageUrlInput = document.getElementById(\'product-image-url\');
    const productFeaturedInput = document.getElementById(\'product-featured\');
    const productActiveInput = document.getElementById(\'product-active\');
    const saveProductButton = document.getElementById(\'save-product-btn\');
    const cancelEditButton = document.getElementById(\'cancel-edit-btn\');

    const API_URL = \'https://backend-nodejs-zeta.vercel.app/api\'; // URL do seu backend

    // Função para buscar e exibir produtos
    async function fetchProducts() {
        try {
            const response = await fetch(`${API_URL}/products`);
            const products = await response.json();
            renderProducts(products);
        } catch (error) {
            console.error(\'Erro ao buscar produtos:\', error);
            showNotification(\'Erro ao carregar produtos.\', \'error\');
        }
    }

    // Função para renderizar produtos na tabela
    function renderProducts(products) {
        productList.innerHTML = \'\';
        products.forEach(product => {
            const row = productList.insertRow();
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.nome}</td>
                <td>${product.preco}</td>
                <td>${product.estoque}</td>
                <td>${product.categoria}</td>
                <td>${product.subcategoria}</td>
                <td><img src="${product.imagem_url}" alt="${product.nome}" width="50"></td>
                <td>${product.destaque ? \'Sim\' : \'Não\'}</td>
                <td>${product.ativo ? \'Sim\' : \'Não\'}</td>
                <td>
                    <button class="edit-btn" data-id="${product.id}">Editar</button>
                    <button class="delete-btn" data-id="${product.id}">Excluir</button>
                </td>
            `;
        });

        // Adicionar event listeners para botões de editar e excluir
        document.querySelectorAll(\'.edit-btn\').forEach(button => {
            button.addEventListener(\'click\', (e) => editProduct(e.target.dataset.id));
        });
        document.querySelectorAll(\'.delete-btn\').forEach(button => {
            button.addEventListener(\'click\', (e) => deleteProduct(e.target.dataset.id));
        });
    }

    // Função para preencher o formulário para edição
    async function editProduct(id) {
        try {
            const response = await fetch(`${API_URL}/products/${id}`);
            const product = await response.json();
            
            formTitle.textContent = \'Editar Produto\';
            productIdInput.value = product.id;
            productNameInput.value = product.nome;
            productDescriptionInput.value = product.descricao;
            productPriceInput.value = product.preco;
            productStockInput.value = product.estoque;
            productCategoryInput.value = product.categoria;
            productSubcategoryInput.value = product.subcategoria;
            productImageUrlInput.value = product.imagem_url;
            productFeaturedInput.checked = product.destaque;
            productActiveInput.checked = product.ativo;

            saveProductButton.textContent = \'Salvar Alterações\';
            cancelEditButton.style.display = \'inline-block\';
        } catch (error) {
            console.error(\'Erro ao buscar produto para edição:\', error);
            showNotification(\'Erro ao carregar dados do produto para edição.\', \'error\');
        }
    }

    // Função para salvar (criar ou atualizar) produto
    saveProductButton.addEventListener(\'click\', async () => {
        const id = productIdInput.value;
        const method = id ? \'PUT\' : \'POST\';
        const url = id ? `${API_URL}/products/${id}` : `${API_URL}/products`;

        const token = localStorage.getItem(\'jwtToken\');
        if (!token) {
            showNotification(\'Você precisa estar logado para realizar esta ação.\', \'error\');
            return;
        }

        const productData = {
            nome: productNameInput.value,
            descricao: productDescriptionInput.value,
            preco: parseFloat(productPriceInput.value),
            estoque: parseInt(productStockInput.value),
            categoria: productCategoryInput.value,
            subcategoria: productSubcategoryInput.value,
            imagem_url: productImageUrlInput.value,
            destaque: productFeaturedInput.checked,
            ativo: productActiveInput.checked
        };

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    \'Content-Type\': \'application/json\',
                    \'Authorization\': `Bearer ${token}`
                },
                body: JSON.stringify(productData)
            });

            const result = await response.json();
            if (response.ok) {
                showNotification(result.message, \'success\');
                clearForm();
                fetchProducts();
            } else {
                showNotification(result.message || \'Erro ao salvar produto.\', \'error\');
            }
        } catch (error) {
            console.error(\'Erro ao salvar produto:\', error);
            showNotification(\'Erro de rede ao salvar produto.\', \'error\');
        }
    });

    // Função para excluir produto
    async function deleteProduct(id) {
        if (!confirm(\'Tem certeza que deseja excluir este produto?\')) {
            return;
        }

        const token = localStorage.getItem(\'jwtToken\');
        if (!token) {
            showNotification(\'Você precisa estar logado para realizar esta ação.\', \'error\');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/products/${id}`, {
                method: \'DELETE\',
                headers: {
                    \'Authorization\': `Bearer ${token}`
                }
            });

            const result = await response.json();
            if (response.ok) {
                showNotification(result.message, \'success\');
                fetchProducts();
            } else {
                showNotification(result.message || \'Erro ao excluir produto.\', \'error\');
            }
        } catch (error) {
            console.error(\'Erro ao excluir produto:\', error);
            showNotification(\'Erro de rede ao excluir produto.\', \'error\');
        }
    }

    // Função para limpar o formulário
    function clearForm() {
        formTitle.textContent = \'Adicionar Novo Produto\';
        productIdInput.value = \'\';
        productNameInput.value = \'\';
        productDescriptionInput.value = \'\';
        productPriceInput.value = \'\';
        productStockInput.value = \'\';
        productCategoryInput.value = \'\';
        productSubcategoryInput.value = \'\';
        productImageUrlInput.value = \'\';
        productFeaturedInput.checked = false;
        productActiveInput.checked = true;
        saveProductButton.textContent = \'Adicionar Produto\';
        cancelEditButton.style.display = \'none\';
    }

    cancelEditButton.addEventListener(\'click\', clearForm);

    // Inicializar
    fetchProducts();
});

