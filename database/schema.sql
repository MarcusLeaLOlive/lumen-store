-- =====================================================================
-- Lumen Store — Esquema do banco de dados (PostgreSQL 16)
-- ---------------------------------------------------------------------
-- Cria todas as tabelas, tipos, índices, gatilhos e visões que a loja
-- precisaria para sair do localStorage e funcionar com um backend real.
--
-- Executar:  psql "$DATABASE_URL" -f database/schema.sql
-- (ou automaticamente pelo docker-compose.yml na primeira subida)
-- =====================================================================

BEGIN;

-- Extensão para busca sem acento ("relogio" encontra "Relógio")
CREATE EXTENSION IF NOT EXISTS unaccent;

-- ---------------------------------------------------------------------
-- Tipos enumerados
-- ---------------------------------------------------------------------
CREATE TYPE papel_usuario    AS ENUM ('cliente', 'admin');
CREATE TYPE tipo_variante    AS ENUM ('cor', 'tamanho');
CREATE TYPE tipo_cupom       AS ENUM ('percentual', 'fixo', 'frete_gratis');
CREATE TYPE forma_pagamento  AS ENUM ('pix', 'cartao', 'boleto');
CREATE TYPE status_pagamento AS ENUM ('pendente', 'aprovado', 'recusado', 'estornado');
CREATE TYPE metodo_entrega   AS ENUM ('economica', 'expressa');
CREATE TYPE status_pedido    AS ENUM (
  'aguardando_pagamento',
  'pagamento_aprovado',
  'em_separacao',
  'enviado',
  'entregue',
  'cancelado'
);

-- ---------------------------------------------------------------------
-- Função genérica: mantém a coluna atualizado_em sempre correta
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_set_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- CATÁLOGO
-- =====================================================================

CREATE TABLE categorias (
  id         SERIAL       PRIMARY KEY,
  nome       VARCHAR(60)  NOT NULL UNIQUE,
  slug       VARCHAR(60)  NOT NULL UNIQUE,
  ordem      SMALLINT     NOT NULL DEFAULT 0,
  criado_em  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE produtos (
  id               SERIAL        PRIMARY KEY,
  categoria_id     INTEGER       NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
  nome             VARCHAR(150)  NOT NULL,
  slug             VARCHAR(160)  NOT NULL UNIQUE,
  descricao        TEXT          NOT NULL DEFAULT '',
  preco            NUMERIC(10,2) NOT NULL CHECK (preco > 0),
  preco_antigo     NUMERIC(10,2)          CHECK (preco_antigo IS NULL OR preco_antigo > preco),
  estoque          INTEGER       NOT NULL DEFAULT 0 CHECK (estoque >= 0),
  icone            VARCHAR(30)   NOT NULL DEFAULT 'caixa',   -- chave de ICONS em Art.jsx
  cor              CHAR(7)       NOT NULL DEFAULT '#e6dccd' CHECK (cor ~ '^#[0-9a-fA-F]{6}$'),
  imagem_url       TEXT,                                     -- para quando houver fotos reais
  destaque         BOOLEAN       NOT NULL DEFAULT false,
  ativo            BOOLEAN       NOT NULL DEFAULT true,      -- "excluir" = desativar (preserva histórico)
  nota_media       NUMERIC(2,1)  NOT NULL DEFAULT 0 CHECK (nota_media BETWEEN 0 AND 5),
  total_avaliacoes INTEGER       NOT NULL DEFAULT 0 CHECK (total_avaliacoes >= 0),
  criado_em        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  atualizado_em    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_produtos_categoria ON produtos (categoria_id) WHERE ativo;
CREATE INDEX idx_produtos_preco     ON produtos (preco)        WHERE ativo;
CREATE INDEX idx_produtos_destaque  ON produtos (destaque)     WHERE ativo AND destaque;
CREATE INDEX idx_produtos_busca     ON produtos
  USING GIN (to_tsvector('portuguese', nome || ' ' || descricao));

CREATE TRIGGER trg_produtos_atualizado
  BEFORE UPDATE ON produtos
  FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();

-- Opções de cor/tamanho de cada produto
CREATE TABLE produto_variantes (
  id          SERIAL        PRIMARY KEY,
  produto_id  INTEGER       NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  tipo        tipo_variante NOT NULL,
  valor       VARCHAR(40)   NOT NULL,
  ordem       SMALLINT      NOT NULL DEFAULT 0,
  UNIQUE (produto_id, tipo, valor)
);

-- =====================================================================
-- USUÁRIOS (clientes e administradores)
-- =====================================================================

CREATE TABLE usuarios (
  id             SERIAL        PRIMARY KEY,
  nome           VARCHAR(120)  NOT NULL,
  email          VARCHAR(160)  NOT NULL,
  cpf            CHAR(11)      UNIQUE CHECK (cpf ~ '^[0-9]{11}$'),
  telefone       VARCHAR(11)   CHECK (telefone ~ '^[0-9]{10,11}$'),
  senha_hash     VARCHAR(100)  NOT NULL,          -- bcrypt; NUNCA guardar a senha em texto
  papel          papel_usuario NOT NULL DEFAULT 'cliente',
  aceita_ofertas BOOLEAN       NOT NULL DEFAULT false,
  criado_em      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  atualizado_em  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- e-mail único sem diferenciar maiúsculas/minúsculas
CREATE UNIQUE INDEX uq_usuarios_email ON usuarios (lower(email));

CREATE TRIGGER trg_usuarios_atualizado
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();

CREATE TABLE enderecos (
  id           SERIAL       PRIMARY KEY,
  usuario_id   INTEGER      NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  apelido      VARCHAR(40)  NOT NULL DEFAULT 'Casa',
  cep          CHAR(8)      NOT NULL CHECK (cep ~ '^[0-9]{8}$'),
  rua          VARCHAR(150) NOT NULL,
  numero       VARCHAR(10)  NOT NULL,
  complemento  VARCHAR(60),
  bairro       VARCHAR(80)  NOT NULL,
  cidade       VARCHAR(80)  NOT NULL,
  uf           CHAR(2)      NOT NULL CHECK (uf ~ '^[A-Z]{2}$'),
  principal    BOOLEAN      NOT NULL DEFAULT false,
  criado_em    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_enderecos_usuario ON enderecos (usuario_id);
-- no máximo um endereço principal por usuário
CREATE UNIQUE INDEX uq_enderecos_principal ON enderecos (usuario_id) WHERE principal;

-- =====================================================================
-- INTERAÇÕES DO CLIENTE
-- =====================================================================

CREATE TABLE favoritos (
  usuario_id  INTEGER     NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  produto_id  INTEGER     NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (usuario_id, produto_id)
);

CREATE TABLE carrinho_itens (
  id          SERIAL      PRIMARY KEY,
  usuario_id  INTEGER     NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  produto_id  INTEGER     NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  variante    VARCHAR(40) NOT NULL DEFAULT '',
  quantidade  INTEGER     NOT NULL CHECK (quantidade > 0),
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (usuario_id, produto_id, variante)
);

CREATE TABLE avaliacoes (
  id          SERIAL      PRIMARY KEY,
  produto_id  INTEGER     NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  usuario_id  INTEGER     NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nota        SMALLINT    NOT NULL CHECK (nota BETWEEN 1 AND 5),
  comentario  TEXT,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (produto_id, usuario_id)          -- uma avaliação por cliente por produto
);

CREATE INDEX idx_avaliacoes_produto ON avaliacoes (produto_id);

-- Recalcula nota média e total de avaliações do produto
CREATE OR REPLACE FUNCTION fn_atualiza_nota_produto()
RETURNS TRIGGER AS $$
DECLARE
  pid INTEGER := COALESCE(NEW.produto_id, OLD.produto_id);
BEGIN
  UPDATE produtos p
     SET nota_media       = COALESCE((SELECT round(avg(nota), 1) FROM avaliacoes WHERE produto_id = pid), 0),
         total_avaliacoes = (SELECT count(*) FROM avaliacoes WHERE produto_id = pid)
   WHERE p.id = pid;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_avaliacoes_nota
  AFTER INSERT OR UPDATE OR DELETE ON avaliacoes
  FOR EACH ROW EXECUTE FUNCTION fn_atualiza_nota_produto();

-- =====================================================================
-- CUPONS
-- =====================================================================

CREATE TABLE cupons (
  codigo         VARCHAR(30)   PRIMARY KEY CHECK (codigo = upper(codigo)),
  descricao      VARCHAR(100)  NOT NULL,
  tipo           tipo_cupom    NOT NULL,
  valor          NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (valor >= 0),
  valor_minimo   NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (valor_minimo >= 0),
  usos_maximos   INTEGER       CHECK (usos_maximos IS NULL OR usos_maximos > 0),
  usos           INTEGER       NOT NULL DEFAULT 0,
  valido_de      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  valido_ate     TIMESTAMPTZ,
  ativo          BOOLEAN       NOT NULL DEFAULT true,
  CHECK (tipo <> 'percentual' OR valor <= 100)
);

-- =====================================================================
-- PEDIDOS
-- =====================================================================

CREATE SEQUENCE seq_codigo_pedido START 1000001;

CREATE TABLE pedidos (
  id                SERIAL          PRIMARY KEY,
  codigo            VARCHAR(12)     NOT NULL UNIQUE
                                    DEFAULT 'LM' || nextval('seq_codigo_pedido'),
  usuario_id        INTEGER         NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  status            status_pedido   NOT NULL DEFAULT 'aguardando_pagamento',

  -- valores (tudo calculado no backend, nunca confiar no front-end)
  subtotal          NUMERIC(10,2)   NOT NULL CHECK (subtotal >= 0),
  desconto_cupom    NUMERIC(10,2)   NOT NULL DEFAULT 0 CHECK (desconto_cupom >= 0),
  desconto_pix      NUMERIC(10,2)   NOT NULL DEFAULT 0 CHECK (desconto_pix >= 0),
  frete             NUMERIC(10,2)   NOT NULL DEFAULT 0 CHECK (frete >= 0),
  total             NUMERIC(10,2)   NOT NULL CHECK (total >= 0),
  cupom_codigo      VARCHAR(30)     REFERENCES cupons(codigo) ON DELETE SET NULL,

  -- pagamento e entrega escolhidos
  forma_pagamento   forma_pagamento NOT NULL,
  parcelas          SMALLINT        NOT NULL DEFAULT 1 CHECK (parcelas BETWEEN 1 AND 10),
  metodo_entrega    metodo_entrega  NOT NULL,
  prazo_entrega     VARCHAR(40)     NOT NULL,
  codigo_rastreio   VARCHAR(30),

  -- cópia do endereço no momento da compra (o cliente pode editar o dele depois)
  entrega_cep         CHAR(8)       NOT NULL,
  entrega_rua         VARCHAR(150)  NOT NULL,
  entrega_numero      VARCHAR(10)   NOT NULL,
  entrega_complemento VARCHAR(60),
  entrega_bairro      VARCHAR(80)   NOT NULL,
  entrega_cidade      VARCHAR(80)   NOT NULL,
  entrega_uf          CHAR(2)       NOT NULL,

  criado_em         TIMESTAMPTZ     NOT NULL DEFAULT now(),
  atualizado_em     TIMESTAMPTZ     NOT NULL DEFAULT now(),

  CHECK (total = subtotal - desconto_cupom - desconto_pix + frete),
  CHECK (forma_pagamento = 'cartao' OR parcelas = 1)
);

CREATE INDEX idx_pedidos_usuario ON pedidos (usuario_id, criado_em DESC);
CREATE INDEX idx_pedidos_status  ON pedidos (status);
CREATE INDEX idx_pedidos_data    ON pedidos (criado_em DESC);

CREATE TRIGGER trg_pedidos_atualizado
  BEFORE UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();

-- Itens guardam nome e preço do momento da compra (o produto pode mudar depois)
CREATE TABLE pedido_itens (
  id              SERIAL        PRIMARY KEY,
  pedido_id       INTEGER       NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id      INTEGER       NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
  nome_produto    VARCHAR(150)  NOT NULL,
  variante        VARCHAR(40)   NOT NULL DEFAULT '',
  preco_unitario  NUMERIC(10,2) NOT NULL CHECK (preco_unitario > 0),
  quantidade      INTEGER       NOT NULL CHECK (quantidade > 0),
  total_item      NUMERIC(10,2) GENERATED ALWAYS AS (preco_unitario * quantidade) STORED
);

CREATE INDEX idx_pedido_itens_pedido  ON pedido_itens (pedido_id);
CREATE INDEX idx_pedido_itens_produto ON pedido_itens (produto_id);

-- Linha do tempo do pedido (tela "Meus pedidos")
CREATE TABLE pedido_historico (
  id          SERIAL        PRIMARY KEY,
  pedido_id   INTEGER       NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  status      status_pedido NOT NULL,
  observacao  VARCHAR(200),
  criado_em   TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_pedido_historico ON pedido_historico (pedido_id, criado_em);

-- Registra automaticamente toda mudança de status
CREATE OR REPLACE FUNCTION fn_registra_status_pedido()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO pedido_historico (pedido_id, status) VALUES (NEW.id, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pedidos_historico
  AFTER INSERT OR UPDATE OF status ON pedidos
  FOR EACH ROW EXECUTE FUNCTION fn_registra_status_pedido();

-- Pagamentos (um pedido pode ter mais de uma tentativa)
-- Dados de cartão: guardar SOMENTE bandeira e 4 últimos dígitos.
-- Número completo e CVV ficam no gateway (Mercado Pago/Stripe) — regra PCI-DSS.
CREATE TABLE pagamentos (
  id               SERIAL           PRIMARY KEY,
  pedido_id        INTEGER          NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  forma            forma_pagamento  NOT NULL,
  status           status_pagamento NOT NULL DEFAULT 'pendente',
  valor            NUMERIC(10,2)    NOT NULL CHECK (valor > 0),
  gateway          VARCHAR(30),                     -- 'mercadopago', 'stripe'...
  gateway_id       VARCHAR(100),                    -- id da transação no gateway
  pix_copia_cola   TEXT,
  pix_expira_em    TIMESTAMPTZ,
  boleto_linha     VARCHAR(60),
  boleto_vence_em  DATE,
  cartao_bandeira  VARCHAR(20),
  cartao_final     CHAR(4)          CHECK (cartao_final ~ '^[0-9]{4}$'),
  pago_em          TIMESTAMPTZ,
  criado_em        TIMESTAMPTZ      NOT NULL DEFAULT now()
);

CREATE INDEX idx_pagamentos_pedido ON pagamentos (pedido_id);
CREATE UNIQUE INDEX uq_pagamentos_gateway ON pagamentos (gateway, gateway_id) WHERE gateway_id IS NOT NULL;

-- =====================================================================
-- VISÕES PARA O PAINEL ADMIN
-- =====================================================================

-- Considera "venda" todo pedido pago (que não esteja aguardando nem cancelado)
CREATE VIEW vw_pedidos_pagos AS
  SELECT * FROM pedidos
   WHERE status NOT IN ('aguardando_pagamento', 'cancelado');

CREATE VIEW vw_kpis AS
  SELECT
    (SELECT COALESCE(sum(total), 0)              FROM vw_pedidos_pagos)                         AS faturamento,
    (SELECT count(*)                              FROM pedidos)                                  AS total_pedidos,
    (SELECT count(*)                              FROM pedidos WHERE status = 'aguardando_pagamento') AS aguardando_pagamento,
    (SELECT COALESCE(round(avg(total), 2), 0)    FROM vw_pedidos_pagos)                         AS ticket_medio,
    (SELECT COALESCE(sum(preco * estoque), 0)    FROM produtos WHERE ativo)                     AS valor_em_estoque,
    (SELECT COALESCE(sum(estoque), 0)            FROM produtos WHERE ativo)                     AS unidades_em_estoque;

CREATE VIEW vw_vendas_por_categoria AS
  SELECT c.nome AS categoria,
         COALESCE(sum(i.total_item), 0) AS receita,
         COALESCE(sum(i.quantidade), 0) AS unidades
    FROM categorias c
    LEFT JOIN produtos p        ON p.categoria_id = c.id
    LEFT JOIN pedido_itens i    ON i.produto_id = p.id
                               AND i.pedido_id IN (SELECT id FROM vw_pedidos_pagos)
   GROUP BY c.id, c.nome, c.ordem
   ORDER BY c.ordem;

CREATE VIEW vw_mais_vendidos AS
  SELECT p.id, p.nome, sum(i.quantidade) AS unidades, sum(i.total_item) AS receita
    FROM pedido_itens i
    JOIN vw_pedidos_pagos pp ON pp.id = i.pedido_id
    JOIN produtos p          ON p.id  = i.produto_id
   GROUP BY p.id, p.nome
   ORDER BY unidades DESC, receita DESC;

CREATE VIEW vw_estoque_baixo AS
  SELECT id, nome, estoque
    FROM produtos
   WHERE ativo AND estoque <= 5
   ORDER BY estoque, nome;

COMMIT;
