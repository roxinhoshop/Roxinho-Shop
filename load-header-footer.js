document.addEventListener("DOMContentLoaded", function() {
    const headerPlaceholder = document.getElementById("header-placeholder");
    const footerPlaceholder = document.getElementById("footer-placeholder");

    if (!headerPlaceholder && !footerPlaceholder) {
        console.warn("Placeholders de cabeçalho e rodapé não encontrados.");
        return;
    }

    if (window.headerFooterLoaded) {
        return;
    }
    window.headerFooterLoaded = true;

    fetch("cabecalho-rodape.html")
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, "text/html");
            
            const header = doc.querySelector("nav.cabecalho");
            const categorias = doc.querySelector(".barra-categorias");
            const footer = doc.querySelector("footer.rodape");
            
            if (headerPlaceholder && header && categorias) {
                headerPlaceholder.innerHTML = header.outerHTML + categorias.outerHTML;
            }

            if (footerPlaceholder && footer) {
                footerPlaceholder.innerHTML = footer.outerHTML;
            }

            document.body.classList.add("loaded");
        })
        .catch(error => console.error("Erro ao carregar cabeçalho ou rodapé:", error));
});

