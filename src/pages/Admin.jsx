import { useState, useEffect, useMemo } from 'react';
import { brl, onlyDigits, STATUS, COUPONS, FREE_SHIP, CATS, UFS, maskCPF, maskCEP, maskTel, maskCard, maskVal, validCPF, luhn, cardBrand, calcFrete } from '../lib/utils';
import { Art, ICONS } from '../components/Art';
import { I, Stars, off } from '../components/Icons';
import { seed } from '../data/products';

export function Admin({ ctx }) {
  const { db, setDb, notify } = ctx;
  const [tab, setTab] = useState('visao');
  const [np, setNp] = useState({ nome: '', cat: 'Tecnologia', preco: '', estoque: '', icon: 'caixa', cor: '#e6dccd', desc: '' });
  const valid = db.orders.filter(o => o.status >= 1);
  const fat = valid.reduce((s, o) => s + o.total, 0);
  const byCat = CATS.map(c => [c, valid.reduce((s, o) => s + o.itens.filter(i => i.cat === c).reduce((a, i) => a + i.preco * i.qty, 0), 0)]);
  const maxC = Math.max(1, ...byCat.map(x => x[1]));
  const low = db.products.filter(p => p.estoque <= 5);
  const valorEstoque = db.products.reduce((s, p) => s + p.preco * p.estoque, 0);
  const top = {}; valid.forEach(o => o.itens.forEach(i => top[i.nome] = (top[i.nome] || 0) + i.qty));
  const topList = Object.entries(top).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const edit = (id, k, v) => setDb(d => ({ ...d, products: d.products.map(p => p.id === id ? { ...p, [k]: v } : p) }));
  const add = () => {
    if (!np.nome.trim() || !(+np.preco > 0)) return notify('Preencha nome e preço');
    const id = Math.max(0, ...db.products.map(p => p.id)) + 1;
    setDb(d => ({ ...d, products: [{ id, nome: np.nome.trim(), cat: np.cat, preco: +(+np.preco).toFixed(2), estoque: Math.max(0, parseInt(np.estoque) || 0), icon: np.icon, cor: np.cor, desc: np.desc || 'Novo produto da Lumen Store.', nota: 5, aval: 0 }, ...d.products] }));
    setNp({ ...np, nome: '', preco: '', estoque: '', desc: '' }); notify('Produto cadastrado');
  };
  return <div className="wrap page">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
      <div><h1>Painel administrativo</h1><p className="sub" style={{ marginBottom: 18 }}>Gerencie catálogo, estoque e pedidos da loja.</p></div>
      <button className="btn ghost sm" style={{ marginBottom: 18 }} onClick={() => { setDb(seed()); notify('Dados de demonstração restaurados'); }}>Restaurar dados de demonstração</button>
    </div>
    <div className="tabs">{[['visao', 'Visão geral'], ['produtos', `Produtos (${db.products.length})`], ['pedidos', `Pedidos (${db.orders.length})`]].map(([k, n]) => <button key={k} className={'tab ' + (tab === k ? 'on' : '')} onClick={() => setTab(k)}>{n}</button>)}</div>

    {tab === 'visao' && <>
      <div className="kpis">
        <div className="kpi"><small>Faturamento</small><b>{brl(fat)}</b><span>pedidos pagos</span></div>
        <div className="kpi"><small>Pedidos</small><b>{db.orders.length}</b><span>{db.orders.filter(o => o.status === 0).length} aguardando pagamento</span></div>
        <div className="kpi"><small>Ticket médio</small><b>{brl(valid.length ? fat / valid.length : 0)}</b><span>por pedido pago</span></div>
        <div className="kpi"><small>Valor em estoque</small><b>{brl(valorEstoque)}</b><span>{db.products.reduce((s, p) => s + p.estoque, 0)} unidades</span></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 16 }}>
        <div className="panel"><h3 className="serif" style={{ marginBottom: 16 }}>Vendas por categoria</h3>
          {fat === 0 ? <p className="note">Ainda não há vendas pagas. Faça um pedido na loja para ver os números aqui.</p> :
            <div className="bars">{byCat.map(([c, v]) => <div className="bar" key={c}><b>{c}</b><div className="tr"><i style={{ width: v / maxC * 100 + '%' }} /></div><span>{brl(v)}</span></div>)}</div>}
        </div>
        <div className="panel"><h3 className="serif" style={{ marginBottom: 12 }}>Estoque baixo</h3>
          {low.length ? low.map(p => <div className="row" key={p.id} style={{ padding: '6px 0', borderBottom: '1px solid #f0ebe3' }}><span>{p.nome}</span><span className="low">{p.estoque === 0 ? 'Esgotado' : `${p.estoque} un.`}</span></div>) : <p className="note">Tudo em ordem.</p>}
        </div>
        <div className="panel"><h3 className="serif" style={{ marginBottom: 12 }}>Mais vendidos</h3>
          {topList.length ? topList.map(([n, q], i) => <div className="row" key={n} style={{ padding: '6px 0', borderBottom: '1px solid #f0ebe3' }}><span>{i + 1}. {n}</span><b>{q} un.</b></div>) : <p className="note">Sem vendas pagas ainda.</p>}
        </div>
      </div>
    </>}

    {tab === 'produtos' && <>
      <div className="panel" style={{ marginBottom: 16 }}>
        <h3 className="serif" style={{ marginBottom: 14 }}>Cadastrar produto</h3>
        <div className="fgrid">
          <div className="field c3"><label>Nome</label><input className="inp" value={np.nome} onChange={e => setNp({ ...np, nome: e.target.value })} /></div>
          <div className="field c1" style={{ gridColumn: 'span 1' }}><label>Preço</label><input className="inp" type="number" min="0" step="0.01" value={np.preco} onChange={e => setNp({ ...np, preco: e.target.value })} /></div>
          <div className="field c1" style={{ gridColumn: 'span 1' }}><label>Estoque</label><input className="inp" type="number" min="0" value={np.estoque} onChange={e => setNp({ ...np, estoque: e.target.value })} /></div>
          <div className="field" style={{ gridColumn: 'span 1' }}><label>Cor</label><input className="inp" type="color" style={{ padding: 4 }} value={np.cor} onChange={e => setNp({ ...np, cor: e.target.value })} /></div>
          <div className="field c2"><label>Categoria</label><select className="inp" style={{ width: '100%', height: 44 }} value={np.cat} onChange={e => setNp({ ...np, cat: e.target.value })}>{CATS.map(c => <option key={c}>{c}</option>)}</select></div>
          <div className="field c2"><label>Ilustração</label><select className="inp" style={{ width: '100%', height: 44 }} value={np.icon} onChange={e => setNp({ ...np, icon: e.target.value })}>{Object.keys(ICONS).map(c => <option key={c}>{c}</option>)}</select></div>
          <div className="field c2" style={{ justifyContent: 'flex-end' }}><div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><div style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}><Art p={np} /></div><button className="btn pri" style={{ flex: 1 }} onClick={add}>Cadastrar</button></div></div>
          <div className="field c6"><label>Descrição</label><input className="inp" value={np.desc} onChange={e => setNp({ ...np, desc: e.target.value })} placeholder="Opcional" /></div>
        </div>
      </div>
      <div className="panel tablewrap" style={{ padding: 12 }}>
        <table><thead><tr><th></th><th>Produto</th><th>Categoria</th><th>Preço (R$)</th><th>Estoque</th><th>Destaque</th><th></th></tr></thead>
          <tbody>{db.products.map(p => <tr key={p.id}>
            <td><div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden' }}><Art p={p} /></div></td>
            <td style={{ fontWeight: 600, minWidth: 180 }}>{p.nome}</td>
            <td>{p.cat}</td>
            <td><input className="inp" type="number" min="0" step="0.01" value={p.preco} onChange={e => edit(p.id, 'preco', Math.max(0, +e.target.value))} /></td>
            <td><input className={'inp ' + (p.estoque <= 5 ? 'low' : '')} style={{ width: 80 }} type="number" min="0" value={p.estoque} onChange={e => edit(p.id, 'estoque', Math.max(0, parseInt(e.target.value) || 0))} /></td>
            <td><input type="checkbox" style={{ accentColor: 'var(--accent)', width: 16, height: 16 }} checked={!!p.destaque} onChange={e => edit(p.id, 'destaque', e.target.checked)} /></td>
            <td><button className="link" onClick={() => { setDb(d => ({ ...d, products: d.products.filter(x => x.id !== p.id), cart: d.cart.filter(c => c.id !== p.id), favs: d.favs.filter(x => x !== p.id) })); notify('Produto removido'); }}>Excluir</button></td>
          </tr>)}</tbody></table>
      </div>
    </>}

    {tab === 'pedidos' && <div className="panel tablewrap" style={{ padding: 12 }}>
      {!db.orders.length ? <p className="note" style={{ padding: 12 }}>Nenhum pedido ainda. Faça uma compra na loja para vê-la aqui.</p> :
        <table><thead><tr><th>Pedido</th><th>Data</th><th>Cliente</th><th>Itens</th><th>Pagamento</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>{db.orders.map(o => <tr key={o.id}>
            <td><b>#{o.id}</b></td>
            <td>{new Date(o.data).toLocaleDateString('pt-BR')}</td>
            <td>{o.cliente.nome}<div className="note">{o.endereco.cidade}/{o.endereco.uf}</div></td>
            <td>{o.itens.reduce((s, i) => s + i.qty, 0)}</td>
            <td>{o.pagamento === 'pix' ? 'Pix' : o.pagamento === 'boleto' ? 'Boleto' : `Cartão ${o.parcelas}x`}</td>
            <td><b>{brl(o.total)}</b></td>
            <td><select className="inp" value={o.status} onChange={e => setDb(d => ({ ...d, orders: d.orders.map(x => x.id === o.id ? { ...x, status: +e.target.value } : x) }))}>{STATUS.map((s, i) => <option key={s} value={i}>{s}</option>)}<option value={-1}>Cancelado</option></select></td>
          </tr>)}</tbody></table>}
    </div>}
  </div>;
}

