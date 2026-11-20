import { useState, useEffect, useMemo } from 'react';
import { brl, onlyDigits, STATUS, COUPONS, FREE_SHIP, CATS, UFS, maskCPF, maskCEP, maskTel, maskCard, maskVal, validCPF, luhn, cardBrand, calcFrete } from '../lib/utils';
import { Art, ICONS } from '../components/Art';
import { I, Stars, off } from '../components/Icons';

export function Pedidos({ ctx }) {
  const { db, setDb, notify, addToCart, P } = ctx;
  const setStatus = (id, s) => setDb(d => ({ ...d, orders: d.orders.map(o => o.id === id ? { ...o, status: s } : o) }));
  return <div className="wrap page"><h1>Meus pedidos</h1><p className="sub">Acompanhe a entrega e o pagamento das suas compras.</p>
    {!db.orders.length ? <div className="empty"><h3>Você ainda não fez pedidos</h3><p>Quando finalizar uma compra, ela aparece aqui.</p><button className="btn dark sm" style={{ marginTop: 16 }} onClick={() => ctx.go('loja')}>Começar a comprar</button></div> :
      db.orders.map(o => <div className="order" key={o.id}>
        <div className="top">
          <div><div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}><b style={{ fontSize: 17 }}>Pedido #{o.id}</b>
            <span className={'pill ' + (o.status === -1 ? '' : o.status >= 4 ? 'green' : o.status === 0 ? '' : 'green')} style={o.status === 0 ? { background: '#fbecd3', color: '#8a5a12' } : o.status === -1 ? { background: '#f6dedb', color: '#a33' } : {}}>{o.status === -1 ? 'Cancelado' : STATUS[o.status]}</span></div>
            <div className="note">{new Date(o.data).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })} · {o.pagamento === 'pix' ? 'Pix' : o.pagamento === 'boleto' ? 'Boleto' : `Cartão ${o.parcelas}x`} · {o.entrega?.nome}</div></div>
          <div style={{ textAlign: 'right' }}><div className="note">Total</div><b style={{ fontSize: 20 }}>{brl(o.total)}</b></div>
        </div>
        {o.status >= 0 && <div className="timeline">{STATUS.map((s, i) => <div key={s} className={'tl ' + (i <= o.status ? 'on' : '')}><i />{s}</div>)}</div>}
        <div className="oitems">{o.itens.map((i, k) => <div className="oitem" key={k}><div className="thumb"><Art p={i} /></div>{i.qty}× {i.nome}{i.variante && <span className="note"> · {i.variante}</span>}</div>)}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          {o.status === 0 && <button className="btn pri sm" onClick={() => { setStatus(o.id, 1); notify('Pagamento confirmado!'); }}>Simular pagamento</button>}
          {o.status >= 0 && o.status < 3 && <button className="btn ghost sm" onClick={() => { setDb(d => ({ ...d, orders: d.orders.map(x => x.id === o.id ? { ...x, status: -1 } : x), products: d.products.map(p => { const q = o.itens.filter(i => i.id === p.id).reduce((s, i) => s + i.qty, 0); return q ? { ...p, estoque: p.estoque + q } : p; }) })); notify('Pedido cancelado e estoque devolvido'); }}>Cancelar pedido</button>}
          <button className="btn ghost sm" onClick={() => { let ok = 0; o.itens.forEach(i => { const p = P(i.id); if (p && p.estoque > 0 && addToCart(p, 1, i.variante)) ok++; }); if (ok) ctx.setCartOpen(true); }}>Comprar novamente</button>
        </div>
        <div className="note" style={{ marginTop: 12 }}>Entrega em: {o.endereco.rua}, {o.endereco.num} · {o.endereco.cidade}/{o.endereco.uf} · CEP {o.endereco.cep}</div>
      </div>)}
  </div>;
}
