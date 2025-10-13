// ======================= SISTEMA DE CATEGORIAS DINÂMICAS =======================

// Função para carregar categorias da API e popular o menu
async function carregarCategoriasDinamicas() {
    try {
        // Verificar se a função listarCategorias está disponível
        if (typeof listarCategorias !== 'function') {
            console.warn('Função listarCategorias não encontrada');
            return;
        }

        const categorias = await listarCategorias();
        
        if (!categorias || categorias.length === 0) {
            console.warn('Nenhuma categoria encontrada');
            return;
        }

        // Encontrar o menu de departamentos
        const menuDepartamentos = document.querySelector('.barra-categorias .dropdown .submenu');
        
        if (!menuDepartamentos) {
            console.warn('Menu de departamentos não encontrado');
            return;
        }

        // Limpar menu existente
        menuDepartamentos.innerHTML = '';

        // Adicionar categorias dinamicamente
        for (const categoria of categorias) {
            const li = document.createElement('li');
            li.className = 'tem-submenu';

            const link = document.createElement('a');
            link.href = `produtos.html?categoria=${categoria.slug}`;
            link.innerHTML = `${categoria.nome} <i class="fa-solid fa-chevron-right seta"></i>`;

            li.appendChild(link);

            // Buscar subcategorias
            if (typeof listarSubcategorias === 'function') {
                const subcategorias = await listarSubcategorias(categoria.slug);
                
                if (subcategorias && subcategorias.length > 0) {
                    const submenu = document.createElement('ul');
                    submenu.className = 'submenu';

                    subcategorias.forEach(sub => {
                        const subLi = document.createElement('li');
                        const subLink = document.createElement('a');
                        subLink.href = `produtos.html?categoria=${categoria.slug}&subcategoria=${sub.nome}`;
                        subLink.textContent = sub.nome;
                        subLi.appendChild(subLink);
                        submenu.appendChild(subLi);
                    });

                    li.appendChild(submenu);
                }
            }

            menuDepartamentos.appendChild(li);
        }

    } catch (error) {
        console.error('❌ Erro ao carregar categorias:', error);
    }
}

// Executar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', carregarCategoriasDinamicas);
} else {
    // DOM já está pronto
    setTimeout(carregarCategoriasDinamicas, 500);
}

// Exportar função
window.carregarCategoriasDinamicas = carregarCategoriasDinamicas;

