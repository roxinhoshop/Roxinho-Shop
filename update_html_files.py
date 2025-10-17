import os
import re

html_files = [
    "cadastro.html",
    "contato.html",
    "entrar.html",
    "historico.html",
    "index.html",
    "pagina-produto.html",
    "painel-admin.html",
    "painel-administrador.html",
    "painel-usuario.html",
    "politicas.html",
    "produto.html",
    "produtos.html",
    "redefinir-senha.html",
    "sobre-nos.html",
    "termos.html",
    "verificacao.html",
]

header_placeholder = '<div id="header-placeholder"></div>'
footer_placeholder = '<div id="footer-placeholder"></div>'
loading_script = '<script src="load-header-footer.js"></script>'

# CSS e JS a serem removidos
css_to_remove = [
    r'<link rel="stylesheet" href="src/estilos/layouts/cabecalho-rodape.css">',
    r'<link rel="stylesheet" href="src/estilos/componentes/notificacoes-fluent.css">',
    r'<link rel="stylesheet" href="src/estilos/componentes/busca-global.css">',
    r'<link rel="stylesheet" href="src/estilos/temas/gradiente-hover-global.css">',
    r'<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" />',
    r'<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">',
    r'<link rel="preconnect" href="https://fonts.googleapis.com">',
    r'<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    r'<link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@200..1000&display=swap" rel="stylesheet">'
]

scripts_to_remove = [
    r'<script src="src/scripts/componentes/notificacoes-fluent.js"></script>',
    r'<script src="src/scripts/componentes/busca-global.js"></script>',
    r'<script src="src/scripts/componentes/modal-fluent.js"></script>',
    r'<script src="src/scripts/componentes/api-produtos.js"></script>',
    r'<script src="src/scripts/componentes/produtos-vistos.js"></script>',
    r'<script src="src/scripts/utilitarios/cabecalho-rodape.js"></script>',
    r'<script src="src/scripts/componentes/cabecalho-autenticacao.js"></script>',
    r'<script src="src/scripts/componentes/notificacoes-fluent.js"></script>',
    r'<script src="src/scripts/componentes/historico-inicio.js"></script>',
    r'<script src="src/scripts/componentes/alternador-tema.js"></script>',
    r'<script>\s*window.API_BASE_URL = "https://roxinho-shop-backend.vercel.app/api";\s*</script>',
    r'<script>\s*fetch\(\'cabecalho-rodape.html\'\).*?</script>', # Remove the old inline loading script
    r'<div id="header-placeholder"></div>', # Remove existing placeholders
    r'<div id="footer-placeholder"></div>', # Remove existing placeholders
    r'<script src="load-header-footer.js"></script>' # Remove existing loading scripts
]

for file_name in html_files:
    file_path = os.path.join(os.getcwd(), file_name)
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Remove duplicated CSS and JS
        for css in css_to_remove:
            content = re.sub(css, '', content, flags=re.IGNORECASE)
        for script in scripts_to_remove:
            content = re.sub(script, '', content, flags=re.IGNORECASE | re.DOTALL)

        # Add header placeholder after <body>
        if header_placeholder not in content:
            content = re.sub(r'(<body[^>]*>)', r'\1\n' + header_placeholder, content, 1, flags=re.IGNORECASE)
        
        # Add footer placeholder and loading script before </body>
        if footer_placeholder not in content:
            content = re.sub(r'(</body>)', footer_placeholder + '\n' + loading_script + r'\n\1', content, 1, flags=re.IGNORECASE)

        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)

