-- Inserir produtos de exemplo
-- Categoria 'Eletrônicos' (ID 1)
INSERT INTO produtos (nome, descricao, categoria_id, imagem_principal, preco_ml, link_ml, preco_amazon, link_amazon) VALUES
('Smartphone Ultra X', 'O mais novo lançamento com câmera de 108MP e bateria de longa duração.', 1, 'imagens/thumbs/produto1.webp', 2599.90, 'https://mercadolivre.com.br/smartphone-ultra-x', 2650.00, 'https://amazon.com.br/smartphone-ultra-x'),
('Smartwatch Fit Pro', 'Monitor de atividades completo com GPS e resistência à água.', 1, 'imagens/thumbs/produto2.webp', 499.00, 'https://mercadolivre.com.br/smartwatch-fit-pro', 510.50, 'https://amazon.com.br/smartwatch-fit-pro');

-- Categoria 'Informática' (ID 2)
INSERT INTO produtos (nome, descricao, categoria_id, imagem_principal, preco_ml, link_ml, preco_amazon, link_amazon) VALUES
('Notebook Gamer Power', 'Processador i7, 16GB RAM, Placa RTX 3060. Ideal para jogos e trabalho pesado.', 2, 'imagens/thumbs/produto3.jpg', 6899.99, 'https://mercadolivre.com.br/notebook-gamer-power', 7050.00, 'https://amazon.com.br/notebook-gamer-power'),
('Monitor UltraWide 34"', 'Tela curva com resolução 4K e taxa de atualização de 144Hz.', 2, 'imagens/thumbs/produto4.jpg', 1999.00, 'https://mercadolivre.com.br/monitor-ultrawide-34', 2050.00, 'https://amazon.com.br/monitor-ultrawide-34');

-- Categoria 'Games' (ID 3)
INSERT INTO produtos (nome, descricao, categoria_id, imagem_principal, preco_ml, link_ml, preco_amazon, link_amazon) VALUES
('Console NextGen 500GB', 'A nova geração de consoles com gráficos incríveis e carregamento ultra-rápido.', 3, 'imagens/thumbs/Produto5.jpg', 3999.00, 'https://mercadolivre.com.br/console-nextgen', 4100.00, 'https://amazon.com.br/console-nextgen'),
('Headset Gamer Pro', 'Áudio 7.1 surround, microfone com cancelamento de ruído e conforto premium.', 3, 'imagens/thumbs/produto6.webp', 350.00, 'https://mercadolivre.com.br/headset-gamer-pro', 345.00, 'https://amazon.com.br/headset-gamer-pro');

-- Categoria 'Casa e Decoração' (ID 4)
INSERT INTO produtos (nome, descricao, categoria_id, imagem_principal, preco_ml, link_ml, preco_amazon, link_amazon) VALUES
('Aspirador Robô Inteligente', 'Mapeamento a laser, controle por app e recarga automática.', 4, 'imagens/thumbs/produto7.webp', 1200.00, 'https://mercadolivre.com.br/aspirador-robo', 1190.00, 'https://amazon.com.br/aspirador-robo'),
('Luminária LED Smart', 'Controle de cores e intensidade por voz, compatível com assistentes.', 4, 'imagens/thumbs/produto8.png', 150.00, 'https://mercadolivre.com.br/luminaria-led-smart', 155.00, 'https://amazon.com.br/luminaria-led-smart');

-- Inserir um usuário de teste
INSERT INTO usuarios (nome, email, senha_hash) VALUES
('Teste User', 'teste@roxinho.shop', '$2b$12$R.A1.Iq1.X0.c8.1.g.j.e.S.a.l.t.h.a.s.h.e.d.p.a.s.s.w.o.r.d'); -- Senha fictícia 'teste123' (será substituída por uma hash real se o login for testado)

-- Inserir avaliações de exemplo
INSERT INTO avaliacoes (produto_id, usuario_id, nome_usuario, nota, comentario) VALUES
(1, 1, 'Teste User', 5, 'Produto excelente! Câmera e bateria superaram minhas expectativas.'),
(1, 1, 'Teste User', 4, 'Muito bom, mas o preço poderia ser um pouco melhor.'),
(3, 1, 'Teste User', 5, 'O Notebook Gamer é um monstro! Roda tudo no ultra.'),
(3, 1, 'Teste User', 3, 'Chegou com um pequeno atraso, mas o produto é de qualidade.');

