document.addEventListener("DOMContentLoaded", function() {
    fetch("cabecalho-rodape.html")
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, "text/html");
            
            // Carrega o cabeçalho e barra de categorias
            const header = doc.querySelector("nav.cabecalho");
            const categorias = doc.querySelector(".barra-categorias");
            const headerPlaceholder = document.getElementById("header-placeholder");
            
            if (headerPlaceholder && header && categorias) {
                headerPlaceholder.innerHTML = header.outerHTML + categorias.outerHTML;
            }

            // Carrega o rodapé
            const footer = doc.querySelector("footer.rodape");
            const footerPlaceholder = document.getElementById("footer-placeholder");
            
            if (footerPlaceholder && footer) {
                footerPlaceholder.innerHTML = footer.outerHTML;
            }

            // Carrega os scripts do cabeçalho e rodapé
            const scripts = doc.querySelectorAll("script");
            scripts.forEach(script => {
                if (script.src) {
                    const newScript = document.createElement("script");
                    newScript.src = script.src;
                    document.body.appendChild(newScript);
                } else if (script.textContent) {
                    const newScript = document.createElement("script");
                    newScript.textContent = script.textContent;
                    document.body.appendChild(newScript);
                }
            });

            // Após carregar tudo, adiciona a classe 'loaded'
            document.body.classList.add('loaded');
        })
        .catch(error => console.error('Erro ao carregar cabeçalho ou rodapé:', error));
});

