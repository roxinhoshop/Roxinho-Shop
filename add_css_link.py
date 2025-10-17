import os
import re

# Lista de arquivos HTML para modificar (excluindo administracao.html e cabecalho-rodape.html)
html_files = [
    "cadastro.html",
    "contato.html",
    "entrar.html",
    "historico.html",
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
    "verificacao.html"
]

css_link = '  <link rel="stylesheet" href="src/estilos/layouts/cabecalho-rodape.css">\n'

for html_file in html_files:
    if not os.path.exists(html_file):
        print(f"Arquivo {html_file} não encontrado, pulando...")
        continue
    
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Verificar se o link já existe
    if 'src/estilos/layouts/cabecalho-rodape.css' in content:
        print(f"{html_file}: Link já existe, pulando...")
        continue
    
    # Adicionar o link após o comentário <!-- CSS -->
    if '<!-- CSS -->' in content:
        content = content.replace('<!-- CSS -->', '<!-- CSS -->\n' + css_link, 1)
        print(f"{html_file}: Link adicionado após <!-- CSS -->")
    # Se não houver comentário CSS, adicionar após <head>
    elif '<head>' in content:
        content = content.replace('<head>', '<head>\n' + css_link, 1)
        print(f"{html_file}: Link adicionado após <head>")
    else:
        print(f"{html_file}: Não foi possível adicionar o link")
        continue
    
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(content)

print("\nConcluído!")
