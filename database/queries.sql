-- =====================================================================
-- Lumen Store — Consultas usadas por cada tela da loja
-- ---------------------------------------------------------------------
-- Os parâmetros seguem o padrão do driver "pg" do Node.js ($1, $2...).
-- Exemplo no backend:
--   const { rows } = await pool.query(SQL_CATALOGO, [categoria, precoMax, ...]);
-- =====================================================================


-- =====================================================================
-- 1. LOJA (pages/Store.jsx)
-- =====================================================================

-- 1.1 Catálogo com filtros e ordenação
-- $1 categoria (slug ou NULL)  $2 preço máximo (ou NULL)  $3 só ofertas (bool)
-- $4 só em estoque (bool)      $5 busca (texto ou NULL)
-- Ordenação: troque o ORDER BY conforme a opção escolhida no <select>
SELECT p.id, p.nome, p.slug, c.nome AS categoria, p.preco, p.preco_antigo,
       p.estoque, p.icone, p.cor, p.destaque, p.nota_media, p.total_avaliacoes,
       CASE WHEN p.preco_antigo IS NOT NULL
            THEN round((1 - p.preco / p.preco_antigo) * 100) ELSE 0 END AS desconto_pct
  FROM produtos p
  JOIN categorias c ON c.id = p.categoria_id
 WHERE p.ativo
   AND ($1::text    IS NULL OR c.slug = $1)
   AND ($2::numeric IS NULL OR p.preco <= $2)
   AND (NOT $3::bool OR p.preco_antigo IS NOT NULL)
   AND (NOT $4::bool OR p.estoque > 0)
   AND ($5::text    IS NULL OR unaccent(p.nome || ' ' || c.nome || ' ' || p.descricao) ILIKE unaccent('%' || $5 || '%'))
 ORDER BY p.destaque DESC, p.total_avaliacoes DESC;   -- "Mais relevantes"
--  ORDER BY p.preco ASC;                              -- "Menor preço"
--  ORDER BY p.preco DESC;                             -- "Maior preço"
--  ORDER BY p.nota_media DESC;                        -- "Melhor avaliados"
--  ORDER BY desconto_pct DESC;                        -- "Maior desconto"

-- 1.2 Categorias com contagem (chips e filtro lateral)
SELECT c.nome, c.slug, count(p.id) AS total
  FROM categorias c
  LEFT JOIN produtos p ON p.categoria_id = c.id AND p.ativo
 GROUP BY c.id
 ORDER BY c.ordem;

-- 1.3 Produto em destaque do hero
SELECT * FROM produtos
 WHERE ativo AND destaque AND estoque > 0
 ORDER BY total_avaliacoes DESC
 LIMIT 1;


-- =====================================================================
-- 2. DETALHE DO PRODUTO (components/ProductModal.jsx)
-- =====================================================================

-- 2.1 Produto + variantes agrupadas em JSON   ($1 id)
SELECT p.*, c.nome AS categoria,
       COALESCE(json_agg(json_build_object('tipo', v.tipo, 'valor', v.valor) ORDER BY v.tipo, v.ordem)
                FILTER (WHERE v.id IS NOT NULL), '[]') AS variantes
  FROM produtos p
  JOIN categorias c ON c.id = p.categoria_id
  LEFT JOIN produto_variantes v ON v.produto_id = p.id
 WHERE p.id = $1 AND p.ativo
 GROUP BY p.id, c.nome;

-- 2.2 Avaliações mais recentes   ($1 produto_id)
SELECT u.nome, a.nota, a.comentario, a.criado_em
  FROM avaliacoes a
  JOIN usuarios u ON u.id = a.usuario_id
 WHERE a.produto_id = $1
 ORDER BY a.criado_em DESC
 LIMIT 10;

-- 2.3 "Você também pode gostar"   ($1 produto_id)
SELECT id, nome, preco, icone, cor
  FROM produtos
 WHERE ativo
   AND categoria_id = (SELECT categoria_id FROM produtos WHERE id = $1)
   AND id <> $1
 ORDER BY nota_media DESC
 LIMIT 3;

-- 2.4 Enviar avaliação (só quem comprou e recebeu)   ($1 produto_id, $2 usuario_id, $3 nota, $4 comentário)
INSERT INTO avaliacoes (produto_id, usuario_id, nota, comentario)
SELECT $1, $2, $3, $4
 WHERE EXISTS (
   SELECT 1 FROM pedido_itens i JOIN pedidos p ON p.id = i.pedido_id
    WHERE i.produto_id = $1 AND p.usuario_id = $2 AND p.status = 'entregue')
ON CONFLICT (produto_id, usuario_id)
DO UPDATE SET nota = EXCLUDED.nota, comentario = EXCLUDED.comentario, criado_em = now();


-- =====================================================================
-- 3. FAVORITOS (pages/Favoritos.jsx)
-- =====================================================================

-- 3.1 Listar   ($1 usuario_id)
SELECT p.* FROM favoritos f
  JOIN produtos p ON p.id = f.produto_id
 WHERE f.usuario_id = $1 AND p.ativo
 ORDER BY f.criado_em DESC;

-- 3.2 Adicionar / remover   ($1 usuario_id, $2 produto_id)
INSERT INTO favoritos (usuario_id, produto_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;
DELETE FROM favoritos WHERE usuario_id = $1 AND produto_id = $2;


-- =====================================================================
-- 4. SACOLA (components/CartDrawer.jsx)
-- =====================================================================

-- 4.1 Itens da sacola com preço atual   ($1 usuario_id)
SELECT ci.id, ci.produto_id, p.nome, ci.variante, ci.quantidade, p.preco, p.estoque,
       p.icone, p.cor, (p.preco * ci.quantidade) AS total_item
  FROM carrinho_itens ci
  JOIN produtos p ON p.id = ci.produto_id
 WHERE ci.usuario_id = $1
 ORDER BY ci.criado_em;

-- 4.2 Adicionar (soma se já existir), respeitando o estoque
-- ($1 usuario_id, $2 produto_id, $3 variante, $4 quantidade)
INSERT INTO carrinho_itens (usuario_id, produto_id, variante, quantidade)
SELECT $1::int, $2::int, $3::varchar, $4::int
  FROM produtos p
 WHERE p.id = $2 AND p.ativo
   AND p.estoque >= $4::int + COALESCE((SELECT sum(quantidade) FROM carrinho_itens
                                    WHERE usuario_id = $1 AND produto_id = $2), 0)
ON CONFLICT (usuario_id, produto_id, variante)
DO UPDATE SET quantidade = carrinho_itens.quantidade + EXCLUDED.quantidade
RETURNING *;   -- nenhuma linha retornada = estoque insuficiente

-- 4.3 Alterar quantidade / remover   ($1 id do item, $2 usuario_id, $3 nova quantidade)
UPDATE carrinho_itens SET quantidade = $3 WHERE id = $1 AND usuario_id = $2;
DELETE FROM carrinho_itens WHERE id = $1 AND usuario_id = $2;

-- 4.4 Validar cupom   ($1 código, $2 subtotal)
SELECT codigo, descricao, tipo, valor
  FROM cupons
 WHERE codigo = upper($1)
   AND ativo
   AND now() >= valido_de
   AND (valido_ate IS NULL OR now() <= valido_ate)
   AND (usos_maximos IS NULL OR usos < usos_maximos)
   AND $2 >= valor_minimo;


-- =====================================================================
-- 5. CHECKOUT (pages/Checkout.jsx) — tudo em UMA transação
-- ---------------------------------------------------------------------
-- O backend recalcula preços, desconto e frete (nunca confia nos valores
-- enviados pelo navegador). Se qualquer passo falhar → ROLLBACK.
-- =====================================================================

BEGIN;

-- 5.1 Trava as linhas dos produtos para ninguém comprar o mesmo estoque ao mesmo tempo
SELECT p.id, p.nome, p.preco, p.estoque, ci.quantidade, ci.variante
  FROM carrinho_itens ci
  JOIN produtos p ON p.id = ci.produto_id
 WHERE ci.usuario_id = $1
   FOR UPDATE OF p;
-- → no Node: se algum estoque < quantidade, ROLLBACK e avisa o cliente

-- 5.2 Cria o pedido (valores calculados no backend)
INSERT INTO pedidos (usuario_id, subtotal, desconto_cupom, desconto_pix, frete, total, cupom_codigo,
                     forma_pagamento, parcelas, metodo_entrega, prazo_entrega,
                     entrega_cep, entrega_rua, entrega_numero, entrega_complemento,
                     entrega_bairro, entrega_cidade, entrega_uf, status)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8::forma_pagamento, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
        CASE WHEN $8::forma_pagamento = 'cartao' THEN 'pagamento_aprovado'::status_pedido
             ELSE 'aguardando_pagamento'::status_pedido END)
RETURNING id, codigo;

-- 5.3 Copia os itens da sacola para o pedido   ($1 pedido_id, $2 usuario_id)
INSERT INTO pedido_itens (pedido_id, produto_id, nome_produto, variante, preco_unitario, quantidade)
SELECT $1, p.id, p.nome, ci.variante, p.preco, ci.quantidade
  FROM carrinho_itens ci
  JOIN produtos p ON p.id = ci.produto_id
 WHERE ci.usuario_id = $2;

-- 5.4 Baixa o estoque   ($1 pedido_id)
UPDATE produtos p
   SET estoque = p.estoque - i.quantidade
  FROM (SELECT produto_id, sum(quantidade) AS quantidade
          FROM pedido_itens WHERE pedido_id = $1 GROUP BY produto_id) i
 WHERE p.id = i.produto_id;
-- o CHECK (estoque >= 0) da tabela impede estoque negativo

-- 5.5 Registra o pagamento   ($1 pedido_id, $2 forma, $3 valor, ...)
INSERT INTO pagamentos (pedido_id, forma, valor, status, gateway, gateway_id,
                        pix_copia_cola, pix_expira_em, boleto_linha, boleto_vence_em,
                        cartao_bandeira, cartao_final, pago_em)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);

-- 5.6 Conta o uso do cupom   ($1 código do cupom)
UPDATE cupons SET usos = usos + 1 WHERE codigo = $1;

-- 5.7 Esvazia a sacola   ($1 usuario_id)
DELETE FROM carrinho_itens WHERE usuario_id = $1;

COMMIT;


-- =====================================================================
-- 6. MEUS PEDIDOS (pages/Pedidos.jsx)
-- =====================================================================

-- 6.1 Pedidos do cliente com itens e linha do tempo   ($1 usuario_id)
SELECT pd.id, pd.codigo, pd.status, pd.total, pd.forma_pagamento, pd.parcelas,
       pd.metodo_entrega, pd.prazo_entrega, pd.codigo_rastreio, pd.criado_em,
       pd.entrega_rua, pd.entrega_numero, pd.entrega_cidade, pd.entrega_uf, pd.entrega_cep,
       (SELECT json_agg(json_build_object('produto_id', i.produto_id, 'nome', i.nome_produto,
                        'variante', i.variante, 'quantidade', i.quantidade, 'preco', i.preco_unitario))
          FROM pedido_itens i WHERE i.pedido_id = pd.id) AS itens,
       (SELECT json_agg(json_build_object('status', h.status, 'data', h.criado_em) ORDER BY h.criado_em)
          FROM pedido_historico h WHERE h.pedido_id = pd.id) AS historico
  FROM pedidos pd
 WHERE pd.usuario_id = $1
 ORDER BY pd.criado_em DESC;

-- 6.2 Confirmação de pagamento (chamada pelo webhook do gateway)   ($1 gateway_id)
WITH pg AS (
  UPDATE pagamentos SET status = 'aprovado', pago_em = now()
   WHERE gateway_id = $1 AND status = 'pendente'
  RETURNING pedido_id
)
UPDATE pedidos SET status = 'pagamento_aprovado'
 WHERE id IN (SELECT pedido_id FROM pg) AND status = 'aguardando_pagamento';

-- 6.3 Cancelar pedido e devolver estoque (só antes de "enviado")   ($1 pedido_id, $2 usuario_id)
BEGIN;
UPDATE pedidos SET status = 'cancelado'
 WHERE id = $1 AND usuario_id = $2
   AND status IN ('aguardando_pagamento', 'pagamento_aprovado', 'em_separacao')
RETURNING id;   -- nenhuma linha = não pode cancelar → ROLLBACK
UPDATE produtos p
   SET estoque = p.estoque + i.quantidade
  FROM (SELECT produto_id, sum(quantidade) AS quantidade
          FROM pedido_itens WHERE pedido_id = $1 GROUP BY produto_id) i
 WHERE p.id = i.produto_id;
UPDATE pagamentos SET status = 'estornado' WHERE pedido_id = $1 AND status = 'aprovado';
COMMIT;


-- =====================================================================
-- 7. AUTENTICAÇÃO
-- =====================================================================

-- 7.1 Login: busca pelo e-mail e compara a senha com bcrypt.compare() no Node
SELECT id, nome, email, senha_hash, papel FROM usuarios WHERE lower(email) = lower($1);

-- 7.2 Cadastro   ($1 nome, $2 email, $3 cpf, $4 telefone, $5 hash gerado com bcrypt.hash())
INSERT INTO usuarios (nome, email, cpf, telefone, senha_hash)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, nome, email, papel;


-- =====================================================================
-- 8. PAINEL ADMIN (pages/Admin.jsx)
-- =====================================================================

SELECT * FROM vw_kpis;                   -- cartões do topo
SELECT * FROM vw_vendas_por_categoria;   -- gráfico de barras
SELECT * FROM vw_mais_vendidos LIMIT 5;  -- ranking
SELECT * FROM vw_estoque_baixo;          -- alerta de estoque

-- 8.1 Cadastrar produto
INSERT INTO produtos (categoria_id, nome, slug, descricao, preco, estoque, icone, cor)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;

-- 8.2 Editar preço/estoque/destaque   ($1 id, $2 preço, $3 estoque, $4 destaque)
UPDATE produtos SET preco = $2, estoque = $3, destaque = $4 WHERE id = $1 RETURNING *;

-- 8.3 "Excluir" = desativar (pedidos antigos continuam apontando para o produto)
UPDATE produtos SET ativo = false WHERE id = $1;

-- 8.4 Lista de pedidos   (paginação: $1 limite, $2 deslocamento)
SELECT pd.codigo, pd.criado_em, u.nome AS cliente, pd.entrega_cidade, pd.entrega_uf,
       (SELECT sum(quantidade) FROM pedido_itens WHERE pedido_id = pd.id) AS itens,
       pd.forma_pagamento, pd.parcelas, pd.total, pd.status
  FROM pedidos pd
  JOIN usuarios u ON u.id = pd.usuario_id
 ORDER BY pd.criado_em DESC
 LIMIT $1 OFFSET $2;

-- 8.5 Mudar status (o gatilho grava a linha do tempo sozinho)   ($1 id, $2 novo status)
UPDATE pedidos SET status = $2 WHERE id = $1;

-- 8.6 Faturamento por dia nos últimos 30 dias
SELECT date_trunc('day', criado_em)::date AS dia, count(*) AS pedidos, sum(total) AS faturamento
  FROM vw_pedidos_pagos
 WHERE criado_em >= now() - interval '30 days'
 GROUP BY 1
 ORDER BY 1;
