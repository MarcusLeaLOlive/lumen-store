import { useState, useEffect, useMemo } from 'react';
import { brl, onlyDigits, STATUS, COUPONS, FREE_SHIP, CATS, UFS, maskCPF, maskCEP, maskTel, maskCard, maskVal, validCPF, luhn, cardBrand, calcFrete } from '../lib/utils';
import { Art, ICONS } from '../components/Art';
import { I, Stars, off } from '../components/Icons';

export function ProductCard({ p, ctx }) {
  const fav = ctx.db.favs.includes(p.id);
  return (
    <div className="card">
      <div className="badges">
        {off(p) > 0 && <span className="pill sale">-{off(p)}%</span>}
        {p.estoque === 0 ? <span className="pill">Esgotado</span> : p.estoque <= 5 && <span className="pill" style={{ background: '#fbecd3', color: '#8a5a12' }}>Últimas {p.estoque}</span>}
      </div>
      <button className={'fav ' + (fav ? 'on' : '')} onClick={() => ctx.toggleFav(p.id)} aria-label="Favoritar">{I.heart}</button>
      <div className="art" onClick={() => ctx.setSel(p.id)} style={{ opacity: p.estoque === 0 ? .6 : 1 }}><Art p={p} /></div>
      <div className="body">
        <div className="cat">{p.cat}</div>
        <div className="name" onClick={() => ctx.setSel(p.id)}>{p.nome}</div>
        <Stars n={p.nota} c={p.aval} />
        <div className="price"><b>{brl(p.preco)}</b>{p.antigo && <s>{brl(p.antigo)}</s>}</div>
        <div className="inst">10x de {brl(p.preco / 10)} · {brl(p.preco * .95)} no Pix</div>
        <button className="btn dark sm add" disabled={p.estoque === 0} onClick={() => (p.cores || p.tamanhos) ? ctx.setSel(p.id) : ctx.addToCart(p)}>
          {p.estoque === 0 ? 'Esgotado' : (p.cores || p.tamanhos) ? 'Escolher opção' : 'Adicionar à sacola'}
        </button>
      </div>
    </div>
  );
}
