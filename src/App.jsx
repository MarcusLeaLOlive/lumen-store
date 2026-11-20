import { useState, useEffect, useRef } from 'react';
import { brl, load, save, FREE_SHIP, CATS } from './lib/utils';
import { seed } from './data/products';
import { I } from './components/Icons';
import { CartDrawer } from './components/CartDrawer';
import { ProductModal } from './components/ProductModal';
import { Store } from './pages/Store';
import { Checkout } from './pages/Checkout';
import { Favoritos } from './pages/Favoritos';
import { Pedidos } from './pages/Pedidos';
import { Admin } from './pages/Admin';

const ROUTES = ['loja', 'favoritos', 'pedidos', 'admin', 'checkout'];
const getRoute = () => { const h = (location.hash || '').replace('#', ''); return ROUTES.includes(h) ? h : 'loja'; };

export default function App() {
  const [db, setDb] = useState(() => { const d = load(); return d && d.products ? { ...seed(), ...d } : seed(); });
  const [route, setRoute] = useState(getRoute());
  const [cartOpen, setCartOpen] = useState(false);
  const [sel, setSel] = useState(null);
  const [toast, setToast] = useState(null);
  const [f, setF] = useState({ q: '', cat: 'Todas', max: 1200, sale: false, stock: false, sort: 'rel' });
  const tRef = useRef();

  useEffect(() => save(db), [db]);
  useEffect(() => { const h = () => { setRoute(getRoute()); window.scrollTo(0, 0); }; window.addEventListener('hashchange', h); return () => window.removeEventListener('hashchange', h); }, []);
  useEffect(() => { document.body.style.overflow = (cartOpen || sel) ? 'hidden' : ''; }, [cartOpen, sel]);

  const go = r => { if (location.hash !== '#' + r) location.hash = r; else { setRoute(r); window.scrollTo(0, 0); } };
  const notify = msg => { clearTimeout(tRef.current); setToast({ msg, k: Date.now() }); tRef.current = setTimeout(() => setToast(null), 2600); };
  const P = id => db.products.find(p => p.id === id);

  const cartItems = db.cart.map(c => ({ ...c, p: P(c.id) })).filter(c => c.p);
  const cartCount = cartItems.reduce((s, c) => s + c.qty, 0);
  const subtotal = cartItems.reduce((s, c) => s + c.qty * c.p.preco, 0);

  function addToCart(p, qty = 1, variante = '') {
    if (!variante) variante = (p.cores && p.cores[0]) || (p.tamanhos && p.tamanhos[0]) || '';
    const key = p.id + '|' + variante;
    const inCart = db.cart.filter(c => c.id === p.id).reduce((s, c) => s + c.qty, 0);
    if (inCart + qty > p.estoque) { notify(p.estoque === 0 ? 'Produto esgotado' : `Só temos ${p.estoque} em estoque`); return false; }
    setDb(d => {
      const ex = d.cart.find(c => c.key === key);
      return { ...d, cart: ex ? d.cart.map(c => c.key === key ? { ...c, qty: c.qty + qty } : c) : [...d.cart, { key, id: p.id, qty, variante }] };
    });
    notify(`✓ ${p.nome.split(' ').slice(0, 3).join(' ')} adicionado à sacola`);
    return true;
  }
  function setQty(key, qty) {
    setDb(d => {
      const it = d.cart.find(c => c.key === key); const p = d.products.find(x => x.id === it.id);
      const others = d.cart.filter(c => c.id === it.id && c.key !== key).reduce((s, c) => s + c.qty, 0);
      if (qty + others > p.estoque) { notify(`Só temos ${p.estoque} em estoque`); return d; }
      return { ...d, cart: qty <= 0 ? d.cart.filter(c => c.key !== key) : d.cart.map(c => c.key === key ? { ...c, qty } : c) };
    });
  }
  const toggleFav = id => { const on = db.favs.includes(id); setDb(d => ({ ...d, favs: on ? d.favs.filter(x => x !== id) : [...d.favs, id] })); notify(on ? 'Removido dos favoritos' : '♥ Salvo nos favoritos'); };

  const ctx = { db, setDb, addToCart, setQty, toggleFav, notify, go, setSel, cartItems, subtotal, P, setCartOpen };

  return (
    <>
      <div className="promo">Frete grátis acima de <b>{brl(FREE_SHIP)}</b> · Use <b>BEMVINDO10</b> e ganhe 10% OFF · 5% de desconto no Pix</div>
      <header>
        <div className="wrap hbar">
          <a className="logo" href="#loja" onClick={() => setF(x => ({ ...x, q: '', cat: 'Todas' }))} style={{ textDecoration: 'none', color: 'inherit' }}><i></i>Lumen</a>
          <div className="search">
            {I.search}
            <input placeholder="Buscar produtos, categorias…" value={f.q} onChange={e => { setF({ ...f, q: e.target.value }); if (route !== 'loja') go('loja'); }} />
          </div>
          <nav className="main">
            <a href="#loja" className={route === 'loja' ? 'on' : ''}>{I.store}<span className="lbl">Loja</span></a>
            <a href="#favoritos" className={route === 'favoritos' ? 'on' : ''}>{I.heart}<span className="lbl">Favoritos</span>{db.favs.length > 0 && <span className="badge">{db.favs.length}</span>}</a>
            <a href="#pedidos" className={route === 'pedidos' ? 'on' : ''}>{I.box}<span className="lbl">Pedidos</span></a>
            <a href="#admin" className={route === 'admin' ? 'on' : ''}>{I.grid}<span className="lbl">Admin</span></a>
          </nav>
          <button className="cartbtn" onClick={() => setCartOpen(true)}>{I.bag}<span className="lbl">Sacola</span><span className="badge">{cartCount}</span></button>
        </div>
      </header>

      <main>
        {route === 'loja' && <Store ctx={ctx} f={f} setF={setF} />}
        {route === 'favoritos' && <Favoritos ctx={ctx} />}
        {route === 'pedidos' && <Pedidos ctx={ctx} />}
        {route === 'admin' && <Admin ctx={ctx} />}
        {route === 'checkout' && <Checkout ctx={ctx} />}
      </main>

      <footer>
        <div className="wrap">
          <div className="cols">
            <div><div className="logo" style={{ color: '#fff', marginBottom: 12 }}><i></i>Lumen</div><p style={{ maxWidth: 300 }}>Objetos bem feitos para o dia a dia. Curadoria de tecnologia, moda e casa com entrega para todo o Brasil.</p></div>
            <div><h5>Loja</h5><ul>{CATS.map(c => <li key={c}><a onClick={() => { setF(x => ({ ...x, cat: c, q: '' })); go('loja'); }}>{c}</a></li>)}</ul></div>
            <div><h5>Minha conta</h5><ul><li><a href="#pedidos">Meus pedidos</a></li><li><a href="#favoritos">Favoritos</a></li><li><a onClick={() => setCartOpen(true)}>Sacola</a></li></ul></div>
            <div><h5>Atendimento</h5><ul><li>Seg–Sex, 9h às 18h</li><li>contato@lumenstore.com.br</li><li>Trocas em até 30 dias</li></ul></div>
          </div>
          <div className="bt"><span>© 2026 Lumen Store · Projeto de portfólio — dados e pagamentos simulados</span><span>Pix · Cartão · Boleto</span></div>
        </div>
      </footer>

      {cartOpen && <CartDrawer ctx={ctx} onClose={() => setCartOpen(false)} />}
      {sel && <ProductModal ctx={ctx} p={P(sel)} onClose={() => setSel(null)} />}
      {toast && <div className="toast" key={toast.k}>{toast.msg}</div>}
    </>
  );
}
