document.addEventListener("DOMContentLoaded", function() {
    const headerPlaceholder = document.getElementById("header-placeholder");
    const footerPlaceholder = document.getElementById("footer-placeholder");

    // Verifica se os placeholders existem e se o conteúdo já foi carregado para evitar duplicação
    if (!headerPlaceholder && !footerPlaceholder) {
        console.warn("Placeholders de cabeçalho e rodapé não encontrados. O script não será executado.");
        return;
    }

    // Adiciona uma flag para evitar carregamento múltiplo caso o evento DOMContentLoaded seja disparado mais de uma vez
    if (window.headerFooterLoaded) {
        return;
    }
    window.headerFooterLoaded = true;

    fetch("cabecalho-rodape.html")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, "text/html");
            
            // Carrega o cabeçalho e barra de categorias
            const header = doc.querySelector("nav.cabecalho");
            const categorias = doc.querySelector(".barra-categorias");
            
            if (headerPlaceholder && header && categorias) {
                headerPlaceholder.innerHTML = header.outerHTML + categorias.outerHTML;
            } else if (headerPlaceholder) {
                console.error("Elementos do cabeçalho ou categorias não encontrados no cabecalho-rodape.html.");
            }

            // Carrega o rodapé
            const footer = doc.querySelector("footer.rodape");
            
            if (footerPlaceholder && footer) {
                footerPlaceholder.innerHTML = footer.outerHTML;
            } else if (footerPlaceholder) {
                console.error("Elemento do rodapé não encontrado no cabecalho-rodape.html.");
            }

            // Carrega os scripts do cabeçalho e rodapé
            const scripts = doc.querySelectorAll("script");
            scripts.forEach(script => {
                // Evita carregar scripts que já estão no body ou que são externos e podem ser duplicados
                if (script.src && !document.querySelector(`script[src='${script.src}']`)) {
                    const newScript = document.createElement("script");
                    newScript.src = script.src;
                    document.body.appendChild(newScript);
                } else if (script.textContent) {
                    // Para scripts inline, verifica se já existe um script com conteúdo similar
                    if (!document.querySelector(`script:not([src]):contains('${script.textContent.trim().substring(0, 50)}')`)) {
                        const newScript = document.createElement("script");
                        newScript.textContent = script.textContent;
                        document.body.appendChild(newScript);
                    }
                }
            });

            // Adiciona a classe 'loaded' após carregar tudo
            document.body.classList.add("loaded");
        })
        .catch(error => console.error("Erro ao carregar cabeçalho ou rodapé:", error));
});

