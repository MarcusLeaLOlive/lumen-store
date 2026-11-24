# Produto · Lumen Store

## Visão

Uma loja virtual pequena e bem cuidada, com curadoria de tecnologia, moda e casa, em que comprar seja **rápido, claro e confiável** do primeiro clique até a entrega.

## Problema

Lojas pequenas costumam ter vitrines confusas, checkout longo e pouca transparência sobre frete, prazo e status do pedido. O cliente desiste no meio do caminho e o lojista não enxerga o que está vendendo.

## Para quem

| Perfil | O que precisa |
|---|---|
| **Cliente** | Achar o produto rápido, saber o preço final (com frete e desconto) antes de pagar, pagar do jeito que preferir e acompanhar a entrega |
| **Lojista / administrador** | Cadastrar produtos, controlar estoque, acompanhar pedidos e ver o faturamento sem planilhas |

## Jornadas principais

1. **Descobrir:** vitrine com destaque da semana → filtros por categoria, preço e ofertas → busca.
2. **Decidir:** detalhe do produto com variantes, estoque, avaliações, frete por CEP e sugestões parecidas.
3. **Comprar:** sacola com cupom e barra de frete grátis → checkout em 4 etapas (identificação, entrega, pagamento, revisão).
4. **Acompanhar:** "Meus pedidos" com linha do tempo, pagamento pendente, cancelamento e "comprar novamente".
5. **Gerir:** painel admin com indicadores, cadastro de produtos e mudança de status dos pedidos.

## Funcionalidades (versão atual)

| Área | Funcionalidade | Situação |
|---|---|---|
| Vitrine | Hero, categorias, filtros, ordenação, busca | Pronto |
| Produto | Variantes de cor/tamanho, estoque, frete por CEP, avaliações, relacionados | Pronto |
| Sacola | Quantidades, cupons, frete grátis acima de R$ 299 | Pronto |
| Checkout | Validação de CPF, e-mail, telefone e cartão; máscaras; Pix, cartão até 10x e boleto | Pronto (pagamento simulado) |
| Pedidos | Linha do tempo, simular pagamento, cancelar com devolução de estoque | Pronto |
| Favoritos | Salvar e listar produtos | Pronto |
| Admin | KPIs, vendas por categoria, mais vendidos, estoque baixo, CRUD de produtos, status de pedidos | Pronto |
| Dados | Persistência no navegador (`localStorage`) | Pronto |
| Banco | Modelagem PostgreSQL completa (ver `docs/BANCO-DE-DADOS.md`) | Projetado |

## Regras de negócio

- **Frete grátis** na entrega econômica para compras a partir de **R$ 299**, ou com o cupom `FRETEGRATIS`.
- **Pix** dá **5% de desconto** sobre o valor após o cupom.
- **Cartão** em até **10x sem juros**, com parcela mínima de R$ 20.
- **Cupons:** `BEMVINDO10` (10%), `FRETEGRATIS` e `LUMEN50` (R$ 50 acima de R$ 400). Um cupom por pedido.
- **Estoque** é reservado ao confirmar o pedido e devolvido se ele for cancelado.
- **Cancelamento** permitido até o pedido ser enviado.
- **Status do pedido:** aguardando pagamento → pagamento aprovado → em separação → enviado → entregue (ou cancelado).

## Métricas de sucesso

| Métrica | Onde aparece |
|---|---|
| Faturamento e número de pedidos | Painel admin |
| Ticket médio | Painel admin |
| Taxa de conversão (visitas → pedidos) | A medir com analytics |
| Abandono de sacola | A medir com analytics |
| Produtos com estoque baixo | Painel admin |

## Fora do escopo (por enquanto)

- Pagamento real e emissão de nota fiscal
- Login de clientes e recuperação de senha
- Marketplace com vários vendedores
- Aplicativo nativo

## Roteiro

| Fase | Entregas |
|---|---|
| **1. Front-end** | Loja completa no navegador, publicada na Vercel |
| **2. Back-end** | API em Node.js + Express ligada ao PostgreSQL (`database/`), login com JWT |
| **3. Pagamentos** | Mercado Pago (Pix e cartão) com confirmação por webhook; CEP real via ViaCEP |
| **4. Qualidade** | Testes automatizados (Vitest), TypeScript, analytics e monitoramento de erros |
