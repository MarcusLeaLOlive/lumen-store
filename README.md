# 🛍️ Lumen Store

Loja virtual completa desenvolvida em **React 18 + Vite**: catálogo com filtros, sacola, checkout em etapas com Pix, cartão e boleto, acompanhamento de pedidos e painel administrativo.

> Projeto de portfólio. Pagamentos e dados são simulados e ficam salvos no navegador (`localStorage`).

## ✨ Funcionalidades

**Loja**
- Catálogo com busca, filtro por categoria, faixa de preço, ofertas e disponibilidade
- Ordenação por relevância, preço, avaliação e desconto
- Página de produto com variantes (cor/tamanho), controle de estoque, cálculo de frete por CEP e avaliações
- Favoritos

**Sacola e checkout**
- Sacola lateral com controle de quantidade, cupons de desconto e barra de progresso até o frete grátis
- Checkout em 4 etapas com validação de CPF, e-mail e cartão (algoritmo de Luhn)
- Máscaras de CPF, CEP, telefone, cartão e validade
- Pix com 5% de desconto (QR Code e copia e cola), cartão em até 10x e boleto

**Pós-venda e administração**
- Meus pedidos: linha do tempo de status, simulação de pagamento, cancelamento com devolução de estoque e "comprar novamente"
- Painel admin: faturamento, ticket médio, vendas por categoria, mais vendidos e alertas de estoque baixo
- Cadastro, edição e exclusão de produtos e alteração de status dos pedidos

## 🚀 Como rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`.

## 🧪 Dados para teste

| O quê | Valor |
|---|---|
| Cupons | `BEMVINDO10` · `FRETEGRATIS` · `LUMEN50` |
| CPF | `529.982.247-25` |
| Cartão | `4111 1111 1111 1111` (qualquer validade futura) |

## 🛠️ Tecnologias

- React 18 (hooks: `useState`, `useEffect`, `useMemo`, hook próprio `useTotals`)
- Vite
- CSS puro com variáveis e layout responsivo (Grid e Flexbox)
- `localStorage` para persistência

## 📁 Estrutura

```
src/
├── App.jsx          # estado global e rotas
├── components/      # ProductCard, ProductModal, CartDrawer, Art, Icons
├── pages/           # Store, Checkout, Favoritos, Pedidos, Admin
├── hooks/           # useTotals
├── lib/utils.js     # formatação, máscaras, validações e frete
└── data/products.js # catálogo inicial
```

## 👤 Autor

**Marcus Leal**
