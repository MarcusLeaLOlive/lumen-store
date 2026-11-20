// Catálogo inicial, avaliações e estado de demonstração
export const SEED = [
  { id: 1, nome: 'Fone Aura com Cancelamento de Ruído', cat: 'Tecnologia', preco: 549.9, antigo: 699.9, nota: 4.8, aval: 312, estoque: 18, icon: 'fone', cor: '#e9c9b5', cores: ['Areia', 'Grafite', 'Terracota'], destaque: true, desc: 'Cancelamento ativo de ruído, 40 h de bateria e almofadas de espuma com memória. Conexão multiponto e carregamento rápido USB-C.' },
  { id: 2, nome: 'Caixa de Som Pulse Bluetooth', cat: 'Tecnologia', preco: 329.9, nota: 4.6, aval: 198, estoque: 25, icon: 'caixa', cor: '#c9d8cf', cores: ['Sálvia', 'Preto'], desc: 'Som 360° com graves profundos, resistência à água IPX7 e 16 h de autonomia. Pareie duas caixas para som estéreo.' },
  { id: 3, nome: 'Smartwatch Fit Pro', cat: 'Tecnologia', preco: 899, antigo: 1099, nota: 4.7, aval: 421, estoque: 9, icon: 'relogio', cor: '#cfdde6', cores: ['Azul névoa', 'Preto'], destaque: true, desc: 'Tela AMOLED, GPS integrado, monitor cardíaco e de sono, mais de 100 modos esportivos e até 10 dias de bateria.' },
  { id: 4, nome: 'Teclado Mecânico Tátil', cat: 'Tecnologia', preco: 459.9, nota: 4.9, aval: 156, estoque: 4, icon: 'teclado', cor: '#ddd6cb', cores: ['Off-white', 'Grafite'], desc: 'Layout 75% ABNT2, switches táteis hot-swap, keycaps PBT e conexão sem fio tripla (2.4G, Bluetooth e cabo).' },
  { id: 5, nome: 'Tênis Trilha Leve', cat: 'Moda', preco: 389.9, nota: 4.5, aval: 264, estoque: 30, icon: 'tenis', cor: '#f0d2c4', tamanhos: ['37', '38', '39', '40', '41', '42', '43'], desc: 'Solado com tração para terrenos mistos, cabedal respirável e entressola de espuma responsiva para longas caminhadas.' },
  { id: 6, nome: 'Tênis Urbano Knit', cat: 'Moda', preco: 299.9, antigo: 359.9, nota: 4.4, aval: 389, estoque: 22, icon: 'tenis', cor: '#d9e2d0', tamanhos: ['36', '37', '38', '39', '40', '41', '42'], desc: 'Tecido knit sem costuras, palmilha removível e visual minimalista para o dia a dia.' },
  { id: 7, nome: 'Relógio Terra Pulseira de Couro', cat: 'Moda', preco: 459, nota: 4.8, aval: 97, estoque: 12, icon: 'relogio', cor: '#e6d6bd', cores: ['Caramelo', 'Café'], desc: 'Caixa de aço inoxidável 40 mm, vidro safira e pulseira de couro legítimo curtido vegetalmente.' },
  { id: 8, nome: 'Óculos de Sol Polarizado', cat: 'Moda', preco: 259, nota: 4.6, aval: 143, estoque: 16, icon: 'oculos', cor: '#e8dcc8', cores: ['Tartaruga', 'Preto fosco'], desc: 'Lentes polarizadas com proteção UV400 e armação leve de acetato. Acompanha estojo rígido.' },
  { id: 9, nome: 'Mochila Nômade 25L', cat: 'Acessórios', preco: 279, nota: 4.7, aval: 502, estoque: 27, icon: 'mochila', cor: '#d6cbb8', cores: ['Oliva', 'Areia', 'Preto'], destaque: true, desc: 'Compartimento acolchoado para notebook de 16", tecido repelente à água e bolso antifurto nas costas.' },
  { id: 10, nome: 'Mochila Executiva Slim', cat: 'Acessórios', preco: 349, antigo: 419, nota: 4.5, aval: 88, estoque: 7, icon: 'mochila', cor: '#c6ccd6', cores: ['Grafite', 'Marinho'], desc: 'Perfil fino, porta USB externa, alça para mala de viagem e organização interna completa.' },
  { id: 11, nome: 'Garrafa Térmica 750 ml', cat: 'Acessórios', preco: 129.9, antigo: 159.9, nota: 4.9, aval: 711, estoque: 50, icon: 'garrafa', cor: '#c8dbe0', cores: ['Água', 'Terracota', 'Preto'], desc: 'Aço inox de parede dupla: 24 h gelado ou 12 h quente. Livre de BPA e tampa à prova de vazamentos.' },
  { id: 12, nome: 'Carteira Slim de Couro', cat: 'Acessórios', preco: 149, nota: 4.6, aval: 176, estoque: 3, icon: 'carteira', cor: '#e2cdb8', cores: ['Caramelo', 'Preto'], desc: 'Couro legítimo, proteção RFID e espaço para 8 cartões e notas em um formato ultrafino.' },
  { id: 13, nome: 'Luminária Lua de Mesa', cat: 'Casa', preco: 189.9, nota: 4.7, aval: 134, estoque: 14, icon: 'luminaria', cor: '#efe0b9', cores: ['Mostarda', 'Branco'], desc: 'Luz quente regulável em 3 intensidades, base de madeira maciça e cúpula metálica pintada.' },
  { id: 14, nome: 'Caneca de Cerâmica Artesanal', cat: 'Casa', preco: 69.9, nota: 4.9, aval: 288, estoque: 40, icon: 'caneca', cor: '#e5c7bd', cores: ['Argila', 'Verde musgo'], desc: 'Peça única feita à mão, 350 ml, esmaltada e segura para micro-ondas e lava-louças.' },
  { id: 15, nome: 'Vaso Jardim Interno', cat: 'Casa', preco: 119, antigo: 139, nota: 4.5, aval: 65, estoque: 11, icon: 'planta', cor: '#cfe0c8', desc: 'Vaso autoirrigável com reservatório de água para até 10 dias. Ideal para plantas de meia-sombra.' },
  { id: 16, nome: 'Caneca Térmica de Viagem', cat: 'Casa', preco: 99.9, nota: 4.4, aval: 59, estoque: 0, icon: 'caneca', cor: '#d8d2e4', cores: ['Lavanda'], desc: 'Mantém o café quente por 6 h, tampa deslizante e encaixe em porta-copos de carro.' },
];
export const REVIEWS = [
  ['Juliana M.', 5, 'Chegou antes do prazo e a qualidade superou o que eu esperava. Recomendo!'],
  ['Rafael S.', 4, 'Muito bom pelo preço. A embalagem veio impecável.'],
  ['Camila R.', 5, 'Segunda compra que faço aqui, atendimento excelente.'],
  ['Pedro H.', 5, 'Exatamente como nas fotos. Acabamento muito caprichado.'],
  ['Ana L.', 4, 'Gostei bastante, só achei que poderia ter mais opções de cor.'],
];
export const seed = () => ({ products: SEED, cart: [], favs: [], orders: [], cupom: '', cep: '' });
