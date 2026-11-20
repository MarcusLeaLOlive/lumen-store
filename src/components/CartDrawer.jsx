import { useState, useEffect, useMemo } from 'react';
import { brl, onlyDigits, STATUS, COUPONS, FREE_SHIP, CATS, UFS, maskCPF, maskCEP, maskTel, maskCard, maskVal, validCPF, luhn, cardBrand, calcFrete } from '../lib/utils';
import { Art, ICONS } from '../components/Art';
import { I, Stars, off } from '../components/Icons';
import { useTotals } from '../hooks/useTotals';

export function CartDrawer({ ctx, onClose }) {
  const { db, setDb, cartItems, subtotal, setQty, notify, go } = ctx;
  const [code, setCode] = useState('');
  const t = useTotals(ctx, 'pac');
  const falta = FREE_SHIP - subtotal;
  const apply = () => {
    const c = code.trim().toUpperCase();
    if (!COUPONS[c]) return notify('Cupom inválido');
    if (COUPONS[c].min && subtotal < COUPONS[c].min) return notify(`Cupom válido para compras acima de ${brl(COUPONS[c].min)}`);
    setDb(d => ({ ...d, cupom: c })); setCode(''); notify(`Cupom ${c} aplicado: ${COUPONS[c].label}`);
  };
  useEffect(() => { const k = e => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, []);
  return (
    <>
      <div className="ov" onClick={onClose} />
      <div className="drawer">
        <div className="hd"><h3>Sacola <span className="note" style={{ fontSize: 14 }}>({cartItems.reduce((s, c) => s + c.qty, 0)} itens)</span></h3><button className="x" onClick={onClose}>{I.x}</button></div>
        {cartItems.length === 0 ? (
          <div className="items" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: 48 }}>🛍️</div>
            <h3 className="serif" style={{ fontSize: 22 }}>Sua sacola está vazia</h3>
            <p className="note" style={{ fontSize: 14 }}>Explore a loja e adicione seus favoritos.</p>
            <button className="btn dark" onClick={() => { onClose(); go('loja'); }}>Continuar comprando</button>
          </div>
        ) : <>
          <div className="items">
            <div className="panel" style={{ padding: 14 }}>
              <div className="note" style={{ marginBottom: 8, fontSize: 13 }}>{falta > 0 ? <>Faltam <b style={{ color: 'var(--ink)' }}>{brl(falta)}</b> para ganhar <b>frete grátis</b></> : <b style={{ color: 'var(--green)' }}>🎉 Você ganhou frete grátis!</b>}</div>
              <div className="freebar"><i style={{ width: Math.min(100, subtotal / FREE_SHIP * 100) + '%' }} /></div>
            </div>
            {cartItems.map(c => (
              <div className="citem" key={c.key}>
                <div className="thumb"><Art p={c.p} /></div>
                <div>
                  <div className="nm">{c.p.nome}</div>
                  {c.variante && <div className="vr">{c.p.tamanhos ? 'Tam.' : 'Cor'}: {c.variante}</div>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                    <div className="qty"><button onClick={() => setQty(c.key, c.qty - 1)}>−</button><span>{c.qty}</span><button onClick={() => setQty(c.key, c.qty + 1)}>+</button></div>
                    <button className="link" onClick={() => setQty(c.key, 0)}>Remover</button>
                  </div>
                </div>
                <b>{brl(c.qty * c.p.preco)}</b>
              </div>
            ))}
          </div>
          <div className="ft">
            {db.cupom ? <div className="row"><span className="pill green">🏷 {db.cupom} — {COUPONS[db.cupom].label}</span><button className="link" onClick={() => setDb(d => ({ ...d, cupom: '' }))}>remover</button></div>
              : <div className="inline"><input className="inp" placeholder="Cupom de desconto" value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && apply()} /><button className="btn ghost sm" style={{ height: 40 }} onClick={apply}>Aplicar</button></div>}
            <div className="inline"><input className="inp" placeholder="CEP para calcular frete" value={db.cep} onChange={e => setDb(d => ({ ...d, cep: maskCEP(e.target.value) }))} /></div>
            <div className="row"><span>Subtotal</span><span>{brl(subtotal)}</span></div>
            {t.desconto > 0 && <div className="row"><span>Desconto</span><span className="g">−{brl(t.desconto)}</span></div>}
            <div className="row"><span>Frete {t.ship && <span className="note">({t.ship.nome})</span>}</span><span className={t.frete === 0 && t.ship ? 'g' : ''}>{t.ship ? (t.frete === 0 ? 'Grátis' : brl(t.frete)) : 'informe o CEP'}</span></div>
            <div className="row tot"><span>Total</span><span>{brl(t.total)}</span></div>
            <div className="note" style={{ textAlign: 'right', marginTop: -6 }}>ou {brl((subtotal - t.desconto) * .95 + t.frete)} no Pix</div>
            <button className="btn pri" onClick={() => { onClose(); go('checkout'); }}>Finalizar compra</button>
            {!db.cupom && <div className="note" style={{ textAlign: 'center' }}>Experimente: BEMVINDO10 · FRETEGRATIS · LUMEN50</div>}
          </div>
        </>}
      </div>
    </>
  );
}
