// Script para carregar o cabeçalho de administração
document.addEventListener('DOMContentLoaded', function() {
    const headerPlaceholder = document.getElementById('header-admin-placeholder');
    
    if (headerPlaceholder) {
        fetch('cabecalho-admin.html')
            .then(response => response.text())
            .then(data => {
                headerPlaceholder.innerHTML = data;
            })
            .catch(error => console.error('Erro ao carregar cabeçalho admin:', error));
    }
});

