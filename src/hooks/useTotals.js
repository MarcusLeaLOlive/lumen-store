import { COUPONS, calcFrete } from '../lib/utils';

// Subtotal, cupom, frete e desconto Pix — usado pela sacola e pelo checkout
export function useTotals(ctx, shipId, pay) {
  const { db, subtotal } = ctx;
  const cup = COUPONS[db.cupom];
  let desconto = 0;
  if (cup?.tipo === 'pct') desconto = subtotal * cup.valor / 100;
  if (cup?.tipo === 'fixo' && subtotal >= (cup.min || 0)) desconto = cup.valor;
  const opts = calcFrete(db.cep, subtotal, db.cupom);
  const ship = opts ? (opts.find(o => o.id === shipId) || opts[0]) : null;
  const frete = ship ? ship.preco : 0;
  const base = subtotal - desconto;
  const pix = pay === 'pix' ? base * .05 : 0;
  return { cup, desconto, opts, ship, frete, pix, total: Math.max(0, base - pix + frete) };
}
