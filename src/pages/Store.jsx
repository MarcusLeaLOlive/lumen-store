import { useState, useEffect, useMemo } from 'react';
import { brl, onlyDigits, STATUS, COUPONS, FREE_SHIP, CATS, UFS, maskCPF, maskCEP, maskTel, maskCard, maskVal, validCPF, luhn, cardBrand, calcFrete } from '../lib/utils';
import { Art, ICONS } from '../components/Art';
import { I, Stars, off } from '../components/Icons';
import { ProductCard } from '../components/ProductCard';

export function Store({ ctx, f, setF }) {
  const { db, setSel } = ctx;
  const [showF, setShowF] = useState(false);
  const list = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    let l = db.products.filter(p =>
      (f.cat === 'Todas' || p.cat === f.cat) && p.preco <= f.max && (!f.sale || p.antigo) && (!f.stock || p.estoque > 0) &&
      (!q || (p.nome + ' ' + p.cat + ' ' + p.desc).toLowerCase().includes(q)));
    const s = { menor: (a, b) => a.preco - b.preco, maior: (a, b) => b.preco - a.preco, nota: (a, b) => b.nota - a.nota, off: (a, b) => off(b) - off(a), rel: (a, b) => (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0) || b.aval - a.aval };
    return [...l].sort(s[f.sort]);
  }, [db.products, f]);
  const hero = db.products.find(p => p.destaque && p.estoque > 0) || db.products[0];
  const showHero = !f.q && f.cat === 'Todas';
  const clear = () => setF({ q: '', cat: 'Todas', max: 1200, sale: false, stock: false, sort: 'rel' });

  return (
    <div className="wrap">
      {showHero && hero && <>
        <section className="hero">
          <div>
            <span className="pill sale">Coleção de verão · até {Math.max(...db.products.map(off))}% OFF</span>
            <h1 style={{ marginTop: 18 }}>Coisas boas, <em>bem feitas</em>, para todos os dias.</h1>
            <p>Uma curadoria de tecnologia, moda e casa escolhida a dedo. Parcele em até 10x sem juros ou pague no Pix com 5% de desconto.</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a className="btn pri" href="#catalogo">Ver produtos</a>
              <button className="btn ghost" onClick={() => setF({ ...f, sale: true })}>Só ofertas</button>
            </div>
            <div className="stats">
              <div><b>{db.products.length}</b><span>produtos</span></div>
              <div><b>4,7★</b><span>avaliação média</span></div>
              <div><b>48h</b><span>despacho</span></div>
            </div>
          </div>
          <div className="heroart" onClick={() => setSel(hero.id)}>
            <Art p={hero} />
            <div className="tag"><small>Destaque da semana</small><b>{hero.nome}</b><div style={{ marginTop: 2 }}><b style={{ color: 'var(--accent)' }}>{brl(hero.preco)}</b> {hero.antigo && <s style={{ color: 'var(--muted)', fontSize: 13 }}>{brl(hero.antigo)}</s>}</div></div>
          </div>
        </section>
        <div className="perks">
          {[[I.truck, 'Frete grátis', `Acima de ${brl(FREE_SHIP)}`], [I.card, '10x sem juros', 'Em todos os cartões'], [I.shield, 'Compra segura', 'Dados protegidos'], [I.back, 'Troca fácil', 'Até 30 dias']].map(([ic, t, s]) =>
            <div className="perk" key={t}><div className="ic">{ic}</div><div><b>{t}</b>{s}</div></div>)}
        </div>
      </>}

      <div id="catalogo" style={{ paddingTop: showHero ? 8 : 32, scrollMarginTop: 90 }}>
        <div className="cats">
          {['Todas', ...CATS].map(c => <button key={c} className={'chip ' + (f.cat === c ? 'on' : '')} onClick={() => setF({ ...f, cat: c })}>{c}</button>)}
        </div>
        <div className="catalog">
          <aside className={'filters ' + (showF ? 'open' : '')}>
            <div>
              <h4>Preço máximo</h4>
              <input type="range" min="50" max="1200" step="10" value={f.max} onChange={e => setF({ ...f, max: +e.target.value })} />
              <div className="row" style={{ fontSize: 13, color: 'var(--muted)' }}><span>R$ 50</span><b style={{ color: 'var(--ink)' }}>até {brl(f.max)}</b></div>
            </div>
            <div>
              <h4>Disponibilidade</h4>
              <label className="check"><input type="checkbox" checked={f.sale} onChange={e => setF({ ...f, sale: e.target.checked })} />Somente ofertas</label>
              <label className="check"><input type="checkbox" checked={f.stock} onChange={e => setF({ ...f, stock: e.target.checked })} />Em estoque</label>
            </div>
            <div>
              <h4>Categoria</h4>
              {['Todas', ...CATS].map(c => <label className="check" key={c}><input type="radio" name="cat" checked={f.cat === c} onChange={() => setF({ ...f, cat: c })} />{c}<span style={{ marginLeft: 'auto', color: 'var(--muted)', fontSize: 12 }}>{c === 'Todas' ? db.products.length : db.products.filter(p => p.cat === c).length}</span></label>)}
            </div>
            <button className="btn ghost sm" onClick={clear}>Limpar filtros</button>
          </aside>
          <div>
            <div className="toolbar">
              <div>
                <h2>{f.q ? `Resultados para “${f.q}”` : f.cat === 'Todas' ? 'Todos os produtos' : f.cat}</h2>
                <div className="count">{list.length} {list.length === 1 ? 'produto' : 'produtos'}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn ghost sm mobfilter" onClick={() => setShowF(!showF)}>{I.filter} Filtros</button>
                <select className="inp" value={f.sort} onChange={e => setF({ ...f, sort: e.target.value })}>
                  <option value="rel">Mais relevantes</option><option value="menor">Menor preço</option><option value="maior">Maior preço</option><option value="nota">Melhor avaliados</option><option value="off">Maior desconto</option>
                </select>
              </div>
            </div>
            {list.length ? <div className="grid">{list.map(p => <ProductCard key={p.id} p={p} ctx={ctx} />)}</div>
              : <div className="empty"><h3>Nada por aqui</h3><p>Nenhum produto corresponde aos filtros escolhidos.</p><button className="btn dark sm" style={{ marginTop: 16 }} onClick={clear}>Limpar filtros</button></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
