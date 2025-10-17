document.addEventListener('DOMContentLoaded', () => {
    // Carregar cabeçalho
    fetch('header-admin.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-admin-placeholder').innerHTML = data;
            // Adicionar evento de logout ao botão do cabeçalho
            const logoutButton = document.getElementById('botao-logout');
            if (logoutButton) {
                logoutButton.addEventListener('click', () => {
                    localStorage.removeItem('jwtToken');
                    localStorage.removeItem('usuarioLogado');
                    window.location.href = 'index.html'; // Redirecionar para a página inicial
                });
            }
        })
        .catch(error => console.error('Erro ao carregar o cabeçalho:', error));

    // Carregar rodapé
    fetch('footer-admin.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-admin-placeholder').innerHTML = data;
        })
        .catch(error => console.error('Erro ao carregar o rodapé:', error));
});
