document.addEventListener("DOMContentLoaded", function() {
    // Carrega o cabeçalho
    fetch("cabecalho-rodape.html")
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, "text/html");
            const header = doc.querySelector("nav.cabecalho");
            const categorias = doc.querySelector(".barra-categorias");
            document.getElementById("header-placeholder").innerHTML = header.outerHTML + categorias.outerHTML;
        });

    // Carrega o rodapé
    fetch("cabecalho-rodape.html")
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, "text/html");
            const footer = doc.querySelector("footer.rodape");
            document.getElementById("footer-placeholder").innerHTML = footer.outerHTML;
        });
});
