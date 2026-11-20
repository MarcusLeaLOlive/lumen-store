import { useState, useEffect, useMemo } from 'react';
import { brl, onlyDigits, STATUS, COUPONS, FREE_SHIP, CATS, UFS, maskCPF, maskCEP, maskTel, maskCard, maskVal, validCPF, luhn, cardBrand, calcFrete } from '../lib/utils';
import { Art, ICONS } from '../components/Art';
import { I, Stars, off } from '../components/Icons';
import { useTotals } from '../hooks/useTotals';

export function PixQR({ seedStr }) {
  let h = 0; for (const ch of seedStr) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const rnd = () => { h ^= h << 13; h >>>= 0; h ^= h >> 17; h ^= h << 5; h >>>= 0; return h / 4294967296; };
  const N = 25, cells = [];
  const inF = (x, y) => (x < 7 && y < 7) || (x >= N - 7 && y < 7) || (x < 7 && y >= N - 7);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!inF(x, y) && rnd() > .5) cells.push(<rect key={x + '-' + y} x={x} y={y} width="1" height="1" />);
  const F = (x, y) => <g key={'f' + x + y}><rect x={x} y={y} width="7" height="7" /><rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" /><rect x={x + 2} y={y + 2} width="3" height="3" /></g>;
  return <svg viewBox={`0 0 ${N} ${N}`} shapeRendering="crispEdges" fill="#1d1b18">{cells}{F(0, 0)}{F(N - 7, 0)}{F(0, N - 7)}</svg>;
}

export function Checkout({ ctx }) {
  const { db, setDb, cartItems, subtotal, notify, go } = ctx;
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(null);
  const [errs, setErrs] = useState({});
  const [shipId, setShipId] = useState('pac');
  const [pay, setPay] = useState('pix');
  const [parc, setParc] = useState(1);
  const [d, setD] = useState({ nome: '', email: '', cpf: '', tel: '', rua: '', num: '', comp: '', bairro: '', cidade: '', uf: '', cartao: '', titular: '', val: '', cvv: '' });
  const t = useTotals(ctx, shipId, pay);
  const up = (k, mask) => e => { const v = mask ? mask(e.target.value) : e.target.value; setD(x => ({ ...x, [k]: v })); if (errs[k]) setErrs(x => ({ ...x, [k]: null })); };

  useEffect(() => { // autopreenche cidade/UF a partir do CEP (simulado)
    const c = onlyDigits(db.cep);
    if (c.length === 8 && !d.uf) setD(x => ({ ...x, uf: UFS[c[0]], cidade: { SP: 'São Paulo', RJ: 'Rio de Janeiro', MG: 'Belo Horizonte', BA: 'Salvador', PE: 'Recife', CE: 'Fortaleza', DF: 'Brasília', PR: 'Curitiba', RS: 'Porto Alegre' }[UFS[c[0]]] }));
  }, [db.cep]);

  if (done) return (
    <div className="wrap page"><div className="success">
      <div className="chk">{I.check}</div>
      <h1>Pedido confirmado!</h1>
      <p className="sub">Obrigado, {done.cliente.nome.split(' ')[0]}. Seu pedido <b style={{ color: 'var(--ink)' }}>#{done.id}</b> foi registrado e você receberá as atualizações em <b style={{ color: 'var(--ink)' }}>{done.cliente.email}</b>.</p>
      {done.pagamento === 'pix' && <div className="panel" style={{ textAlign: 'left', marginBottom: 20 }}>
        <b>Pague com Pix para liberar o envio</b>
        <div className="pixbox" style={{ marginTop: 12 }}><PixQR seedStr={done.id} /><div style={{ flex: 1, minWidth: 200 }}>
          <div className="note" style={{ marginBottom: 6 }}>Pix copia e cola · válido por 30 min</div>
          <div className="code">{pixCode(done)}</div>
          <button className="btn dark sm" style={{ marginTop: 10 }} onClick={() => { try { navigator.clipboard.writeText(pixCode(done)).then(() => notify('Código Pix copiado'), () => notify('Selecione e copie o código')); } catch (e) { notify('Selecione e copie o código'); } }}>Copiar código</button>
        </div></div>
      </div>}
      {done.pagamento === 'boleto' && <div className="panel" style={{ textAlign: 'left', marginBottom: 20 }}><b>Boleto gerado</b><div className="code" style={{ marginTop: 8 }}>34191.79001 01043.510047 91020.150008 8 {String(Math.round(done.total * 100)).padStart(10, '0')}</div><div className="note" style={{ marginTop: 6 }}>Vencimento em 3 dias úteis. A compensação leva até 2 dias úteis.</div></div>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn dark" onClick={() => go('pedidos')}>Acompanhar pedido</button>
        <button className="btn ghost" onClick={() => go('loja')}>Continuar comprando</button>
      </div>
    </div></div>
  );

  if (!cartItems.length) return <div className="wrap page"><div className="empty"><h3>Sua sacola está vazia</h3><p>Adicione produtos antes de finalizar a compra.</p><button className="btn dark sm" style={{ marginTop: 16 }} onClick={() => go('loja')}>Ir para a loja</button></div></div>;

  const validate = s => {
    const e = {};
    if (s === 0) {
      if (d.nome.trim().split(/\s+/).length < 2) e.nome = 'Informe nome e sobrenome';
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) e.email = 'E-mail inválido';
      if (!validCPF(d.cpf)) e.cpf = 'CPF inválido';
      if (onlyDigits(d.tel).length < 10) e.tel = 'Telefone inválido';
    }
    if (s === 1) {
      if (onlyDigits(db.cep).length !== 8) e.cep = 'CEP inválido';
      ['rua', 'num', 'bairro', 'cidade'].forEach(k => { if (!d[k].trim()) e[k] = 'Obrigatório'; });
      if (!/^[A-Za-z]{2}$/.test(d.uf)) e.uf = 'UF';
    }
    if (s === 2 && pay === 'cartao') {
      if (!luhn(d.cartao)) e.cartao = 'Número de cartão inválido';
      if (d.titular.trim().length < 4) e.titular = 'Nome como no cartão';
      const [mm, aa] = d.val.split('/').map(Number);
      if (!mm || mm > 12 || !aa || (2000 + aa) < 2026 || ((2000 + aa) === 2026 && mm < 11)) e.val = 'Validade inválida';
      if (onlyDigits(d.cvv).length < 3) e.cvv = 'CVV';
    }
    setErrs(e); return !Object.keys(e).length;
  };
  const next = () => { if (validate(step)) { setStep(step + 1); window.scrollTo(0, 0); } };

  const finish = () => {
    const order = {
      id: 'LM' + String(Date.now()).slice(-7), data: new Date().toISOString(),
      itens: cartItems.map(c => ({ id: c.id, nome: c.p.nome, preco: c.p.preco, qty: c.qty, variante: c.variante, icon: c.p.icon, cor: c.p.cor, cat: c.p.cat })),
      subtotal, desconto: t.desconto + t.pix, frete: t.frete, total: t.total, cupom: db.cupom,
      pagamento: pay, parcelas: pay === 'cartao' ? parc : 1, entrega: t.ship,
      cliente: { nome: d.nome, email: d.email, cpf: d.cpf, tel: d.tel },
      endereco: { cep: db.cep, rua: d.rua, num: d.num, comp: d.comp, bairro: d.bairro, cidade: d.cidade, uf: d.uf.toUpperCase() },
      status: pay === 'cartao' ? 1 : 0,
    };
    setDb(x => ({
      ...x, orders: [order, ...x.orders], cart: [], cupom: '',
      products: x.products.map(p => { const q = order.itens.filter(i => i.id === p.id).reduce((s, i) => s + i.qty, 0); return q ? { ...p, estoque: Math.max(0, p.estoque - q) } : p; }),
    }));
    setDone(order); window.scrollTo(0, 0);
  };

  const E = k => errs[k] && <span className="errtxt">{errs[k]}</span>;
  const F = (k, label, cls, props = {}) => <div className={'field ' + cls}><label>{label}</label><input className={'inp ' + (errs[k] ? 'err' : '')} value={d[k]} onChange={up(k, props.mask)} {...props} mask={undefined} />{E(k)}</div>;
  const STEPS = ['Identificação', 'Entrega', 'Pagamento', 'Revisão'];

  return (
    <div className="wrap page">
      <h1>Finalizar compra</h1>
      <p className="sub">Ambiente de demonstração — nenhuma cobrança real é feita. Cartão de teste: 4111 1111 1111 1111.</p>
      <div className="checkout">
        <div>
          <div className="steps">{STEPS.map((s, i) => <button key={s} className={'step ' + (i === step ? 'on' : i < step ? 'ok' : '')} onClick={() => i < step && setStep(i)}><i>{i < step ? '✓' : i + 1}</i>{s}</button>)}</div>
          <div className="panel">
            {step === 0 && <div className="fgrid">
              {F('nome', 'Nome completo', 'c6', { placeholder: 'Maria da Silva', autoComplete: 'name' })}
              {F('email', 'E-mail', 'c6', { placeholder: 'voce@email.com', type: 'email', autoComplete: 'email' })}
              {F('cpf', 'CPF', 'c3', { placeholder: '000.000.000-00', mask: maskCPF, inputMode: 'numeric' })}
              {F('tel', 'Celular', 'c3', { placeholder: '(00) 00000-0000', mask: maskTel, inputMode: 'tel' })}
              <div className="c6 note">Dica: para testar, use o CPF 529.982.247-25.</div>
            </div>}
            {step === 1 && <>
              <div className="fgrid">
                <div className="field c2"><label>CEP</label><input className={'inp ' + (errs.cep ? 'err' : '')} value={db.cep} placeholder="00000-000" inputMode="numeric" onChange={e => setDb(x => ({ ...x, cep: maskCEP(e.target.value) }))} />{E('cep')}</div>
                {F('rua', 'Endereço', 'c4', { placeholder: 'Rua, avenida…' })}
                {F('num', 'Número', 'c2', { placeholder: '123' })}
                {F('comp', 'Complemento', 'c4', { placeholder: 'Apto, bloco (opcional)' })}
                {F('bairro', 'Bairro', 'c2')}
                {F('cidade', 'Cidade', 'c3')}
                {F('uf', 'UF', 'c1', { maxLength: 2, style: { textTransform: 'uppercase' } })}
              </div>
              {t.opts && <div style={{ marginTop: 22 }}>
                <div className="field" style={{ marginBottom: 8 }}><label>Forma de entrega</label></div>
                <div className="ship">{t.opts.map(o => <label key={o.id} className={'shipopt ' + (shipId === o.id ? 'on' : '')}><input type="radio" checked={shipId === o.id} onChange={() => setShipId(o.id)} /><div style={{ flex: 1 }}><b>{o.nome}</b><div className="note">{o.prazo}</div></div><b className={o.preco === 0 ? 'g' : ''} style={{ color: o.preco === 0 ? 'var(--green)' : '' }}>{o.preco === 0 ? 'Grátis' : brl(o.preco)}</b></label>)}</div>
              </div>}
            </>}
            {step === 2 && <>
              <div className="pay">
                {[['pix', 'Pix', '5% de desconto · aprovação imediata'], ['cartao', 'Cartão de crédito', 'Até 10x sem juros'], ['boleto', 'Boleto', 'Compensa em até 2 dias']].map(([k, n, s]) =>
                  <button key={k} className={'payopt ' + (pay === k ? 'on' : '')} onClick={() => setPay(k)}><b>{n}</b><small>{s}</small></button>)}
              </div>
              {pay === 'pix' && <div className="pixbox"><div style={{ fontSize: 40 }}>⚡</div><div><b>Pague {brl(t.total)} com Pix</b><div className="note">O QR Code e o código copia e cola aparecem depois de confirmar o pedido.</div></div></div>}
              {pay === 'boleto' && <div className="pixbox"><div style={{ fontSize: 40 }}>🧾</div><div><b>Boleto de {brl(t.total)}</b><div className="note">O boleto vence em 3 dias úteis. O pedido é enviado após a compensação.</div></div></div>}
              {pay === 'cartao' && <>
                <div className="cardpreview">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: 700 }}>{cardBrand(d.cartao)}</span><span>◉◉</span></div>
                  <div className="num">{(d.cartao || '•••• •••• •••• ••••').padEnd(19, '•')}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><div><small>Titular</small>{(d.titular || 'NOME DO TITULAR').toUpperCase()}</div><div><small>Validade</small>{d.val || 'MM/AA'}</div></div>
                </div>
                <div className="fgrid">
                  {F('cartao', 'Número do cartão', 'c6', { placeholder: '0000 0000 0000 0000', mask: maskCard, inputMode: 'numeric', autoComplete: 'cc-number' })}
                  {F('titular', 'Nome impresso no cartão', 'c6', { autoComplete: 'cc-name' })}
                  {F('val', 'Validade', 'c2', { placeholder: 'MM/AA', mask: maskVal, inputMode: 'numeric' })}
                  {F('cvv', 'CVV', 'c2', { placeholder: '123', mask: v => onlyDigits(v).slice(0, 4), inputMode: 'numeric' })}
                  <div className="field c2"><label>Parcelas</label><select className="inp" style={{ width: '100%', height: 44 }} value={parc} onChange={e => setParc(+e.target.value)}>{Array.from({ length: 10 }, (_, i) => i + 1).filter(n => t.total / n >= 20 || n === 1).map(n => <option key={n} value={n}>{n}x de {brl(t.total / n)}</option>)}</select></div>
                </div>
              </>}
            </>}
            {step === 3 && <div style={{ display: 'grid', gap: 16 }}>
              {[['Cliente', `${d.nome} · ${d.email} · CPF ${d.cpf}`, 0], ['Entrega', `${d.rua}, ${d.num}${d.comp ? ' – ' + d.comp : ''} · ${d.bairro} · ${d.cidade}/${d.uf.toUpperCase()} · CEP ${db.cep} — ${t.ship?.nome} (${t.ship?.prazo})`, 1],
                ['Pagamento', pay === 'pix' ? 'Pix (5% de desconto)' : pay === 'boleto' ? 'Boleto bancário' : `${cardBrand(d.cartao)} final ${onlyDigits(d.cartao).slice(-4)} · ${parc}x de ${brl(t.total / parc)}`, 2]].map(([h, v, s]) =>
                  <div key={h} className="row" style={{ alignItems: 'flex-start', gap: 16, borderBottom: '1px solid var(--line)', paddingBottom: 14 }}><div><div className="field"><label>{h}</label></div><div style={{ marginTop: 4 }}>{v}</div></div><button className="link" onClick={() => setStep(s)}>alterar</button></div>)}
              <label className="check"><input type="checkbox" defaultChecked />Quero receber ofertas por e-mail</label>
            </div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, gap: 10 }}>
              {step > 0 ? <button className="btn ghost" onClick={() => setStep(step - 1)}>Voltar</button> : <button className="btn ghost" onClick={() => go('loja')}>Continuar comprando</button>}
              {step < 3 ? <button className="btn dark" onClick={next}>Continuar</button> : <button className="btn pri" onClick={finish}>Confirmar pedido · {brl(t.total)}</button>}
            </div>
          </div>
        </div>
        <div className="panel summary">
          <h3 className="serif" style={{ fontSize: 22, marginBottom: 8 }}>Resumo</h3>
          {cartItems.map(c => <div className="li" key={c.key}><div className="thumb"><Art p={c.p} /><em>{c.qty}</em></div><div style={{ flex: 1, lineHeight: 1.25 }}><b style={{ fontSize: 13 }}>{c.p.nome}</b>{c.variante && <div className="note">{c.variante}</div>}</div><b>{brl(c.qty * c.p.preco)}</b></div>)}
          <div style={{ borderTop: '1px solid var(--line)', marginTop: 8, paddingTop: 12, display: 'grid', gap: 8 }}>
            <div className="row"><span>Subtotal</span><span>{brl(subtotal)}</span></div>
            {t.desconto > 0 && <div className="row"><span>Cupom {db.cupom}</span><span className="g">−{brl(t.desconto)}</span></div>}
            {t.pix > 0 && <div className="row"><span>Desconto Pix (5%)</span><span className="g">−{brl(t.pix)}</span></div>}
            <div className="row"><span>Frete</span><span className={t.frete === 0 && t.ship ? 'g' : ''}>{t.ship ? (t.frete === 0 ? 'Grátis' : brl(t.frete)) : '—'}</span></div>
            <div className="row tot"><span>Total</span><span>{brl(t.total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
export const pixCode = o => `00020126580014BR.GOV.BCB.PIX0136lumen-store-demo-${o.id.toLowerCase()}5204000053039865406${o.total.toFixed(2)}5802BR5911LUMEN STORE6009SAO PAULO62070503***6304${o.id.slice(-4)}`;
