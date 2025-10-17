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

header_placeholder = 
footer_placeholder = 
loading_script = 

for file_name in html_files:
    file_path = os.path.join(os.getcwd(), file_name)
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Add header placeholder after 
        content = re.sub(r'(<body[^>]*>)', r'\1\n' + header_placeholder, content, 1, flags=re.IGNORECASE)
        
        # Add footer placeholder and loading script before 
        content = re.sub(r'(</body>)', footer_placeholder + '\n' + loading_script + r'\n\1', content, 1, flags=re.IGNORECASE)

        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)

