# Design · Lumen Store

Guia visual da loja. Todo o CSS fica em `src/styles.css` e usa as variáveis abaixo, declaradas em `:root`. Para mudar a identidade da loja, comece por elas.

## Princípios

1. **Calma e calor.** Fundo creme, tinta quase preta e um único tom de destaque (terracota). Nada de cores saturadas competindo.
2. **O produto em primeiro lugar.** Cartões limpos, ilustração grande e preço legível. Informação secundária em cinza.
3. **Uma ação principal por tela.** O botão terracota (`.btn.pri`) indica o próximo passo; os demais ficam em preto ou contorno.
4. **Feedback imediato.** Toda ação responde com toast, contador ou mudança de estado, sem janelas do navegador.
5. **Funciona no celular.** Layout pensado de 360 px até 1240 px.

## Cores

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#f6f3ee` | Fundo da página |
| `--card` | `#ffffff` | Cartões, painéis, campos |
| `--ink` | `#1d1b18` | Texto principal, botão escuro, rodapé |
| `--muted` | `#6f6a62` | Texto secundário, rótulos |
| `--line` | `#e4ded4` | Bordas e divisórias |
| `--accent` | `#c4532d` | Ação principal, preço em destaque, selos de oferta |
| `--accent-d` | `#a4411f` | Hover do botão principal |
| `--green` | `#2f6b55` | Sucesso, frete grátis, descontos aplicados |
| `--green-l` | `#e2efe8` | Fundo de selos de sucesso |
| `--warn` | `#b7791f` | Estoque baixo |

Estados extras usados pontualmente: erro `#c0392b` (fundo `#fff7f6`), aguardando pagamento `#8a5a12` sobre `#fbecd3`, cancelado `#a33` sobre `#f6dedb`, estrelas `#d89b2b`.

**Contraste:** `--ink` sobre `--bg` e branco sobre `--accent` passam no nível AA para texto normal.

## Tipografia

| Papel | Fonte | Peso | Tamanho |
|---|---|---|---|
| Títulos e logo | **Fraunces** (serifada) | 600–700 | 22 a 68 px (`clamp` no hero) |
| Texto e interface | **Manrope** (sem serifa) | 400–800 | 15 px base |
| Rótulos de campo | Manrope | 700, maiúsculas, `letter-spacing .05em` | 12 px |
| Código Pix e cartão | `ui-monospace` | 400 | 12–19 px |

Títulos usam `letter-spacing` negativo (`-.02em` a `-.035em`) para ficarem compactos. Itálico em Fraunces destaca uma palavra no hero.

## Espaçamento e forma

- **Grade:** largura máxima de `1240px` com `24px` de margem lateral (`.wrap`).
- **Espaços:** múltiplos de 2, mais usados 6, 8, 12, 16, 20, 24, 28, 32 px.
- **Raios:** `--r: 16px` em cartões e painéis; `12–14px` em campos e opções; `999px` em botões, chips e selos; `24–32px` em modais e no hero.
- **Sombra:** uma só, `--shadow`, suave e usada no hover de cartões e em elementos flutuantes.

## Componentes

| Classe | O que é |
|---|---|
| `.btn` + `.pri` / `.dark` / `.ghost` / `.sm` | Botões: principal (terracota), escuro, contorno e versão pequena |
| `.inp`, `.field`, `.errtxt` | Campo, rótulo + campo, mensagem de erro |
| `.chip` / `.chip.on` | Filtros de categoria |
| `.pill` + `.sale` / `.green` | Selos: desconto, sucesso, estados de pedido |
| `.card` | Cartão de produto (ilustração quadrada + corpo) |
| `.panel` | Caixa branca com borda para formulários e resumos |
| `.drawer` | Sacola lateral (desliza da direita) |
| `.modal .box` | Detalhe do produto em duas colunas |
| `.steps .step` | Indicador de etapas do checkout |
| `.toast` | Aviso flutuante na base da tela |
| `.timeline .tl` | Linha do tempo do pedido |
| `.kpi`, `.bar` | Indicadores e barras do painel admin |

## Ícones e ilustrações

- **Ícones de interface:** SVG de traço, 2 px, `currentColor`, em `src/components/Icons.jsx`. **Sem emojis**: eles mudam de aparência entre sistemas.
- **Ilustrações de produto:** SVG geométrico em `src/components/Art.jsx`, sobre fundo em degradê da cor do produto (`cor`). Nenhuma imagem externa.
- **Logo:** círculo em degradê radial `#f3b79f → #c4532d → #a4411f` + "Lumen" em Fraunces 700.

## Movimento

| Animação | Duração | Onde |
|---|---|---|
| `fade` | 0,2 s | Fundo escuro de modal e sacola |
| `slide` | 0,28 s, `cubic-bezier(.2,.8,.2,1)` | Sacola entrando |
| `pop` | 0,25 s | Modal, toast, confirmação de pedido |
| Hover de cartão | 0,2 s, `translateY(-3px)` | Grade de produtos |

## Responsividade

| Largura | Mudança |
|---|---|
| ≤ 960 px | Hero em uma coluna, filtros viram botão "Filtros", checkout empilha o resumo, modal em uma coluna |
| ≤ 720 px | Busca ocupa a linha inteira, menu só com ícones, grade com 2 produtos por linha, formulários em coluna única |

## Imagens de marca (pasta `public/`)

| Arquivo | Tamanho | Uso |
|---|---|---|
| `favicon.svg` / `favicon.ico` | vetor / 16-32-48 | Aba do navegador |
| `favicon-48/96/192/512.png` | quadrados | Navegadores, Android, manifesto |
| `apple-touch-icon.png` | 180 × 180 | Atalho na tela inicial do iPhone |
| `og-image.png` | 1200 × 630 | Prévia ao compartilhar o link |
