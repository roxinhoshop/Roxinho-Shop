document.addEventListener("DOMContentLoaded", function() {
    const headerPlaceholder = document.getElementById("header-admin-placeholder");

    if (!headerPlaceholder) {
        console.warn("Placeholder do cabeçalho de administração não encontrado. O script não será executado.");
        return;
    }

    // Adiciona uma flag para evitar carregamento múltiplo
    if (window.adminHeaderLoaded) {
        return;
    }
    window.adminHeaderLoaded = true;

    fetch("cabecalho-admin.html")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            // O cabecalho-admin.html já deve conter o HTML completo do cabeçalho
            headerPlaceholder.innerHTML = data;
        })
        .catch(error => console.error("Erro ao carregar cabeçalho admin:", error));
});

