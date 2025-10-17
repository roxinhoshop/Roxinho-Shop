document.addEventListener("DOMContentLoaded", function() {
    Promise.all([
        fetch("cabecalho-rodape.html").then(response => response.text()),
        fetch("cabecalho-rodape.html").then(response => response.text())
    ])
    .then(data => {
        const headerData = data[0];
        const footerData = data[1];

        // Carrega o cabeçalho
        const parserHeader = new DOMParser();
        const docHeader = parserHeader.parseFromString(headerData, "text/html");
        const header = docHeader.querySelector("nav.cabecalho");
        const categorias = docHeader.querySelector(".barra-categorias");
        if (document.getElementById("header-placeholder")) {
            document.getElementById("header-placeholder").innerHTML = header.outerHTML + categorias.outerHTML;
        }

        // Carrega o rodapé
        const parserFooter = new DOMParser();
        const docFooter = parserFooter.parseFromString(footerData, "text/html");
        const footer = docFooter.querySelector("footer.rodape");
        if (document.getElementById("footer-placeholder")) {
            document.getElementById("footer-placeholder").innerHTML = footer.outerHTML;
        }

        // Após carregar tudo, adiciona a classe 'loaded'
        document.body.classList.add('loaded');
    })
    .catch(error => console.error('Erro ao carregar cabeçalho ou rodapé:', error));
});

