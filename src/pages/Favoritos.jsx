import { useState, useEffect, useMemo } from 'react';
import { brl, onlyDigits, STATUS, COUPONS, FREE_SHIP, CATS, UFS, maskCPF, maskCEP, maskTel, maskCard, maskVal, validCPF, luhn, cardBrand, calcFrete } from '../lib/utils';
import { Art, ICONS } from '../components/Art';
import { I, Stars, off } from '../components/Icons';
import { ProductCard } from '../components/ProductCard';

export function Favoritos({ ctx }) {
  const list = ctx.db.favs.map(ctx.P).filter(Boolean);
  return <div className="wrap page"><h1>Favoritos</h1><p className="sub">{list.length} {list.length === 1 ? 'produto salvo' : 'produtos salvos'}</p>
    {list.length ? <div className="grid">{list.map(p => <ProductCard key={p.id} p={p} ctx={ctx} />)}</div>
      : <div className="empty"><h3>Nenhum favorito ainda</h3><p>Toque no ♡ de um produto para salvá-lo aqui.</p><button className="btn dark sm" style={{ marginTop: 16 }} onClick={() => ctx.go('loja')}>Explorar a loja</button></div>}
  </div>;
}
