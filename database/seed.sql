-- =====================================================================
-- Lumen Store — Dados iniciais (mesmo catálogo de src/data/products.js)
-- Executar depois do schema:  psql "$DATABASE_URL" -f database/seed.sql
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- Categorias
-- ---------------------------------------------------------------------
INSERT INTO categorias (nome, slug, ordem) VALUES
  ('Tecnologia', 'tecnologia', 1),
  ('Moda', 'moda', 2),
  ('Acessórios', 'acessorios', 3),
  ('Casa', 'casa', 4);

-- ---------------------------------------------------------------------
-- Produtos
-- nota_media e total_avaliacoes começam com os números da vitrine;
-- novas avaliações recalculam os dois pelo gatilho trg_avaliacoes_nota.
-- ---------------------------------------------------------------------
INSERT INTO produtos (id, categoria_id, nome, slug, descricao, preco, preco_antigo, estoque, icone, cor, destaque, nota_media, total_avaliacoes) VALUES
  (1, (SELECT id FROM categorias WHERE nome = 'Tecnologia'), 'Fone Aura com Cancelamento de Ruído', 'fone-aura-com-cancelamento-de-ruido',
   'Cancelamento ativo de ruído, 40 h de bateria e almofadas de espuma com memória. Conexão multiponto e carregamento rápido USB-C.',
   549.90, 699.90, 18, 'fone', '#e9c9b5', true, 4.8, 312),
  (2, (SELECT id FROM categorias WHERE nome = 'Tecnologia'), 'Caixa de Som Pulse Bluetooth', 'caixa-de-som-pulse-bluetooth',
   'Som 360° com graves profundos, resistência à água IPX7 e 16 h de autonomia. Pareie duas caixas para som estéreo.',
   329.90, NULL, 25, 'caixa', '#c9d8cf', false, 4.6, 198),
  (3, (SELECT id FROM categorias WHERE nome = 'Tecnologia'), 'Smartwatch Fit Pro', 'smartwatch-fit-pro',
   'Tela AMOLED, GPS integrado, monitor cardíaco e de sono, mais de 100 modos esportivos e até 10 dias de bateria.',
   899.00, 1099.00, 9, 'relogio', '#cfdde6', true, 4.7, 421),
  (4, (SELECT id FROM categorias WHERE nome = 'Tecnologia'), 'Teclado Mecânico Tátil', 'teclado-mecanico-tatil',
   'Layout 75% ABNT2, switches táteis hot-swap, keycaps PBT e conexão sem fio tripla (2.4G, Bluetooth e cabo).',
   459.90, NULL, 4, 'teclado', '#ddd6cb', false, 4.9, 156),
  (5, (SELECT id FROM categorias WHERE nome = 'Moda'), 'Tênis Trilha Leve', 'tenis-trilha-leve',
   'Solado com tração para terrenos mistos, cabedal respirável e entressola de espuma responsiva para longas caminhadas.',
   389.90, NULL, 30, 'tenis', '#f0d2c4', false, 4.5, 264),
  (6, (SELECT id FROM categorias WHERE nome = 'Moda'), 'Tênis Urbano Knit', 'tenis-urbano-knit',
   'Tecido knit sem costuras, palmilha removível e visual minimalista para o dia a dia.',
   299.90, 359.90, 22, 'tenis', '#d9e2d0', false, 4.4, 389),
  (7, (SELECT id FROM categorias WHERE nome = 'Moda'), 'Relógio Terra Pulseira de Couro', 'relogio-terra-pulseira-de-couro',
   'Caixa de aço inoxidável 40 mm, vidro safira e pulseira de couro legítimo curtido vegetalmente.',
   459.00, NULL, 12, 'relogio', '#e6d6bd', false, 4.8, 97),
  (8, (SELECT id FROM categorias WHERE nome = 'Moda'), 'Óculos de Sol Polarizado', 'oculos-de-sol-polarizado',
   'Lentes polarizadas com proteção UV400 e armação leve de acetato. Acompanha estojo rígido.',
   259.00, NULL, 16, 'oculos', '#e8dcc8', false, 4.6, 143),
  (9, (SELECT id FROM categorias WHERE nome = 'Acessórios'), 'Mochila Nômade 25L', 'mochila-nomade-25l',
   'Compartimento acolchoado para notebook de 16", tecido repelente à água e bolso antifurto nas costas.',
   279.00, NULL, 27, 'mochila', '#d6cbb8', true, 4.7, 502),
  (10, (SELECT id FROM categorias WHERE nome = 'Acessórios'), 'Mochila Executiva Slim', 'mochila-executiva-slim',
   'Perfil fino, porta USB externa, alça para mala de viagem e organização interna completa.',
   349.00, 419.00, 7, 'mochila', '#c6ccd6', false, 4.5, 88),
  (11, (SELECT id FROM categorias WHERE nome = 'Acessórios'), 'Garrafa Térmica 750 ml', 'garrafa-termica-750-ml',
   'Aço inox de parede dupla: 24 h gelado ou 12 h quente. Livre de BPA e tampa à prova de vazamentos.',
   129.90, 159.90, 50, 'garrafa', '#c8dbe0', false, 4.9, 711),
  (12, (SELECT id FROM categorias WHERE nome = 'Acessórios'), 'Carteira Slim de Couro', 'carteira-slim-de-couro',
   'Couro legítimo, proteção RFID e espaço para 8 cartões e notas em um formato ultrafino.',
   149.00, NULL, 3, 'carteira', '#e2cdb8', false, 4.6, 176),
  (13, (SELECT id FROM categorias WHERE nome = 'Casa'), 'Luminária Lua de Mesa', 'luminaria-lua-de-mesa',
   'Luz quente regulável em 3 intensidades, base de madeira maciça e cúpula metálica pintada.',
   189.90, NULL, 14, 'luminaria', '#efe0b9', false, 4.7, 134),
  (14, (SELECT id FROM categorias WHERE nome = 'Casa'), 'Caneca de Cerâmica Artesanal', 'caneca-de-ceramica-artesanal',
   'Peça única feita à mão, 350 ml, esmaltada e segura para micro-ondas e lava-louças.',
   69.90, NULL, 40, 'caneca', '#e5c7bd', false, 4.9, 288),
  (15, (SELECT id FROM categorias WHERE nome = 'Casa'), 'Vaso Jardim Interno', 'vaso-jardim-interno',
   'Vaso autoirrigável com reservatório de água para até 10 dias. Ideal para plantas de meia-sombra.',
   119.00, 139.00, 11, 'planta', '#cfe0c8', false, 4.5, 65),
  (16, (SELECT id FROM categorias WHERE nome = 'Casa'), 'Caneca Térmica de Viagem', 'caneca-termica-de-viagem',
   'Mantém o café quente por 6 h, tampa deslizante e encaixe em porta-copos de carro.',
   99.90, NULL, 0, 'caneca', '#d8d2e4', false, 4.4, 59);

-- Ajusta a sequência depois de inserir com id fixo
SELECT setval('produtos_id_seq', (SELECT max(id) FROM produtos));

-- ---------------------------------------------------------------------
-- Variantes (cores e tamanhos)
-- ---------------------------------------------------------------------
INSERT INTO produto_variantes (produto_id, tipo, valor, ordem) VALUES
  (1, 'cor', 'Areia', 0),
  (1, 'cor', 'Grafite', 1),
  (1, 'cor', 'Terracota', 2),
  (2, 'cor', 'Sálvia', 0),
  (2, 'cor', 'Preto', 1),
  (3, 'cor', 'Azul névoa', 0),
  (3, 'cor', 'Preto', 1),
  (4, 'cor', 'Off-white', 0),
  (4, 'cor', 'Grafite', 1),
  (5, 'tamanho', '37', 0),
  (5, 'tamanho', '38', 1),
  (5, 'tamanho', '39', 2),
  (5, 'tamanho', '40', 3),
  (5, 'tamanho', '41', 4),
  (5, 'tamanho', '42', 5),
  (5, 'tamanho', '43', 6),
  (6, 'tamanho', '36', 0),
  (6, 'tamanho', '37', 1),
  (6, 'tamanho', '38', 2),
  (6, 'tamanho', '39', 3),
  (6, 'tamanho', '40', 4),
  (6, 'tamanho', '41', 5),
  (6, 'tamanho', '42', 6),
  (7, 'cor', 'Caramelo', 0),
  (7, 'cor', 'Café', 1),
  (8, 'cor', 'Tartaruga', 0),
  (8, 'cor', 'Preto fosco', 1),
  (9, 'cor', 'Oliva', 0),
  (9, 'cor', 'Areia', 1),
  (9, 'cor', 'Preto', 2),
  (10, 'cor', 'Grafite', 0),
  (10, 'cor', 'Marinho', 1),
  (11, 'cor', 'Água', 0),
  (11, 'cor', 'Terracota', 1),
  (11, 'cor', 'Preto', 2),
  (12, 'cor', 'Caramelo', 0),
  (12, 'cor', 'Preto', 1),
  (13, 'cor', 'Mostarda', 0),
  (13, 'cor', 'Branco', 1),
  (14, 'cor', 'Argila', 0),
  (14, 'cor', 'Verde musgo', 1),
  (16, 'cor', 'Lavanda', 0);

-- ---------------------------------------------------------------------
-- Cupons (os mesmos aceitos na sacola do site)
-- ---------------------------------------------------------------------
INSERT INTO cupons (codigo, descricao, tipo, valor, valor_minimo) VALUES
  ('BEMVINDO10',  '10% de desconto',              'percentual',   10.00,   0.00),
  ('FRETEGRATIS', 'Frete grátis',                 'frete_gratis',  0.00,   0.00),
  ('LUMEN50',     'R$ 50 OFF (acima de R$ 400)',  'fixo',         50.00, 400.00);

-- ---------------------------------------------------------------------
-- Usuários de demonstração
-- Senha de ambos: lumen123  (hash bcrypt, custo 10)
-- ---------------------------------------------------------------------
INSERT INTO usuarios (id, nome, email, cpf, telefone, senha_hash, papel) VALUES
  (1, 'Administrador Lumen', 'admin@lumenstore.com.br', NULL,          NULL,          '$2b$10$wRupACRe6pbYG8LG9hDNeOOLmQv/U5um6qUJBrXecT3YhwGaTV0JK', 'admin'),
  (2, 'Maria da Silva',      'maria@exemplo.com',       '52998224725', '11987654321', '$2b$10$0WnGFiDZFRnFf53qTjeT/.fHWOQi2QAxNe0Ip4WTBqOg1OFPnSe4q', 'cliente');
SELECT setval('usuarios_id_seq', (SELECT max(id) FROM usuarios));

INSERT INTO enderecos (usuario_id, apelido, cep, rua, numero, complemento, bairro, cidade, uf, principal) VALUES
  (2, 'Casa', '01310100', 'Avenida Paulista', '1000', 'Apto 52', 'Bela Vista', 'São Paulo', 'SP', true);

INSERT INTO favoritos (usuario_id, produto_id) VALUES (2, 1), (2, 9);

-- Avaliações de exemplo: o gatilho recalcula a nota desses dois produtos,
-- que passam a refletir só as avaliações gravadas no banco
INSERT INTO avaliacoes (produto_id, usuario_id, nota, comentario) VALUES
  (1, 2, 5, 'Chegou antes do prazo e a qualidade superou o que eu esperava. Recomendo!'),
  (9, 2, 4, 'Muito bom pelo preço. A embalagem veio impecável.');

-- ---------------------------------------------------------------------
-- Pedido de exemplo: 1 fone + 1 garrafa, cartão 2x, cupom BEMVINDO10
-- subtotal 679,80 − cupom 67,98 + frete 0 (acima de R$ 299) = 611,82
-- ---------------------------------------------------------------------
INSERT INTO pedidos (id, usuario_id, status, subtotal, desconto_cupom, desconto_pix, frete, total, cupom_codigo,
                     forma_pagamento, parcelas, metodo_entrega, prazo_entrega,
                     entrega_cep, entrega_rua, entrega_numero, entrega_complemento, entrega_bairro, entrega_cidade, entrega_uf)
VALUES (1, 2, 'pagamento_aprovado', 679.80, 67.98, 0, 0, 611.82, 'BEMVINDO10',
        'cartao', 2, 'economica', '3–6 dias úteis',
        '01310100', 'Avenida Paulista', '1000', 'Apto 52', 'Bela Vista', 'São Paulo', 'SP');
SELECT setval('pedidos_id_seq', (SELECT max(id) FROM pedidos));

INSERT INTO pedido_itens (pedido_id, produto_id, nome_produto, variante, preco_unitario, quantidade) VALUES
  (1, 1,  'Fone Aura com Cancelamento de Ruído',  'Grafite', 549.90, 1),
  (1, 11, 'Garrafa Térmica 750 ml', 'Água',    129.90, 1);

INSERT INTO pagamentos (pedido_id, forma, status, valor, gateway, cartao_bandeira, cartao_final, pago_em) VALUES
  (1, 'cartao', 'aprovado', 611.82, 'simulado', 'VISA', '1111', now());

UPDATE cupons   SET usos = usos + 1      WHERE codigo = 'BEMVINDO10';
UPDATE produtos SET estoque = estoque - 1 WHERE id IN (1, 11);

COMMIT;
