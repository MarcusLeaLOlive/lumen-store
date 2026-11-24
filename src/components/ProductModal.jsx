import { useState, useEffect, useMemo } from 'react';
import { brl, onlyDigits, STATUS, COUPONS, FREE_SHIP, CATS, UFS, maskCPF, maskCEP, maskTel, maskCard, maskVal, validCPF, luhn, cardBrand, calcFrete } from '../lib/utils';
import { Art, ICONS } from '../components/Art';
import { I, Stars, StarRow, off } from '../components/Icons';
import { REVIEWS } from '../data/products';

export function ProductModal({ p, ctx, onClose }) {
  const opts = p.tamanhos || p.cores || [];
  const [v, setV] = useState(opts[0] || '');
  const [q, setQ] = useState(1);
  const [cep, setCep] = useState(ctx.db.cep || '');
  const fav = ctx.db.favs.includes(p.id);
  const fr = calcFrete(cep, p.preco * q, ctx.db.cupom);
  const revs = [REVIEWS[p.id % 5], REVIEWS[(p.id + 2) % 5]];
  const related = ctx.db.products.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 3);
  useEffect(() => { const k = e => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, []);
  return (
    <>
      <div className="ov" onClick={onClose} />
      <div className="modal">
        <div className="box">
          <button className="x" onClick={onClose}>{I.x}</button>
          <div className="pa"><Art p={p} /></div>
          <div className="pi">
            <div style={{ display: 'flex', gap: 6 }}><span className="pill">{p.cat}</span>{off(p) > 0 && <span className="pill sale">-{off(p)}%</span>}</div>
            <h2>{p.nome}</h2>
            <Stars n={p.nota} c={p.aval} />
            <div className="bigprice"><b>{brl(p.preco)}</b>{p.antigo && <s>{brl(p.antigo)}</s>}
              <div className="note" style={{ fontSize: 14 }}>em até 10x de {brl(p.preco / 10)} sem juros · <b style={{ color: 'var(--green)' }}>{brl(p.preco * .95)} no Pix</b></div></div>
            <p style={{ color: 'var(--muted)' }}>{p.desc}</p>
            {opts.length > 0 && <div><div className="field"><label>{p.tamanhos ? 'Tamanho' : 'Cor'}: <span style={{ color: 'var(--ink)', textTransform: 'none' }}>{v}</span></label></div>
              <div className="opts" style={{ marginTop: 8 }}>{opts.map(o => <button key={o} className={'opt ' + (v === o ? 'on' : '')} onClick={() => setV(o)}>{o}</button>)}</div></div>}
            <div className="note">{p.estoque === 0 ? <b style={{ color: '#c0392b' }}>Produto esgotado</b> : p.estoque <= 5 ? <b className="low">Restam apenas {p.estoque} unidades</b> : <span style={{ color: 'var(--green)', fontWeight: 700 }}>● Em estoque — envio em até 48h</span>}</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <div className="qty lg"><button onClick={() => setQ(Math.max(1, q - 1))}>−</button><span>{q}</span><button onClick={() => setQ(Math.min(p.estoque || 1, q + 1))}>+</button></div>
              <button className="btn pri" style={{ flex: 1 }} disabled={p.estoque === 0} onClick={() => { if (ctx.addToCart(p, q, v)) { onClose(); ctx.setCartOpen(true); } }}>Adicionar à sacola</button>
              <button className={'btn ghost fav-btn'} style={{ width: 46, padding: 0, color: fav ? 'var(--accent)' : '' }} onClick={() => ctx.toggleFav(p.id)} aria-label="Favoritar"><span className={'fav ' + (fav ? 'on' : '')} style={{ position: 'static', background: 'none', width: 'auto', height: 'auto' }}>{I.heart}</span></button>
            </div>
            <div className="panel" style={{ padding: 14 }}>
              <div className="field"><label>Calcular frete</label>
                <input className="inp" placeholder="Digite seu CEP" value={cep} onChange={e => { const m = maskCEP(e.target.value); setCep(m); if (onlyDigits(m).length === 8) ctx.setDb(d => ({ ...d, cep: m })); }} /></div>
              {fr && <div className="ship" style={{ marginTop: 8 }}>{fr.map(o => <div key={o.id} className="row"><span>{o.nome} · <span className="note">{o.prazo}</span></span><b className={o.preco === 0 ? 'g' : ''}>{o.preco === 0 ? 'Grátis' : brl(o.preco)}</b></div>)}</div>}
            </div>
            <div>
              <div className="field" style={{ marginBottom: 8 }}><label>Avaliações</label></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {revs.map(([n, s, t]) => <div className="review" key={n}><div className="row"><b>{n}</b><StarRow n={s} /></div><div style={{ color: 'var(--muted)' }}>{t}</div></div>)}
              </div>
            </div>
            {related.length > 0 && <div>
              <div className="field" style={{ marginBottom: 8 }}><label>Você também pode gostar</label></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {related.map(r => <button key={r.id} onClick={() => ctx.setSel(r.id)} style={{ textAlign: 'left' }}><div style={{ aspectRatio: '1/1', borderRadius: 12, overflow: 'hidden' }}><Art p={r} /></div><div style={{ fontSize: 12, fontWeight: 700, marginTop: 4, lineHeight: 1.2 }}>{r.nome}</div><div style={{ fontSize: 12 }}>{brl(r.preco)}</div></button>)}
              </div>
            </div>}
          </div>
        </div>
      </div>
    </>
  );
}
