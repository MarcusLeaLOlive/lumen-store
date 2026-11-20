// Ilustrações SVG dos produtos (o site não usa imagens externas)
export const W = { fill: '#fff', opacity: .38 };
export const ICONS = {
  fone: <g><path d="M48 112V96a52 52 0 0 1 104 0v16" fill="none" stroke="currentColor" strokeWidth="11" strokeLinecap="round"/><rect x="34" y="104" width="32" height="54" rx="13"/><rect x="134" y="104" width="32" height="54" rx="13"/><rect x="42" y="114" width="10" height="34" rx="5" {...W}/></g>,
  caixa: <g><rect x="58" y="36" width="84" height="132" rx="20"/><circle cx="100" cy="122" r="27" {...W}/><circle cx="100" cy="122" r="10" fill="currentColor"/><circle cx="100" cy="70" r="12" {...W}/></g>,
  relogio: <g><rect x="80" y="26" width="40" height="148" rx="12" opacity=".5"/><circle cx="100" cy="100" r="44"/><circle cx="100" cy="100" r="33" fill="#fff" opacity=".92"/><path d="M100 100V78M100 100l15 9" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/><rect x="146" y="94" width="8" height="12" rx="3"/></g>,
  teclado: <g><rect x="24" y="72" width="152" height="66" rx="12"/>{Array.from({ length: 24 }).map((_, i) => <rect key={i} x={34 + (i % 8) * 17.5} y={82 + Math.floor(i / 8) * 15} width="13" height="11" rx="3" {...W}/>)}<rect x="62" y="125" width="76" height="7" rx="3" {...W}/></g>,
  tenis: <g><path d="M26 132c3-24 14-40 34-42l34-8c14 20 40 26 64 28 18 2 20 18 20 26v8H26z"/><rect x="24" y="146" width="154" height="11" rx="5.5" opacity=".45"/><path d="M68 98l10 14M84 92l10 14M100 88l10 14" stroke="#fff" strokeOpacity=".5" strokeWidth="5" strokeLinecap="round"/></g>,
  oculos: <g fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round"><circle cx="68" cy="104" r="27"/><circle cx="132" cy="104" r="27"/><path d="M95 100q5-9 10 0M41 96L24 84M159 96l17-12"/><circle cx="68" cy="104" r="20" fill="currentColor" opacity=".35" stroke="none"/><circle cx="132" cy="104" r="20" fill="currentColor" opacity=".35" stroke="none"/></g>,
  mochila: <g><path d="M74 58a26 26 0 0 1 52 0" fill="none" stroke="currentColor" strokeWidth="9"/><rect x="52" y="54" width="96" height="120" rx="28"/><rect x="70" y="116" width="60" height="40" rx="11" {...W}/><rect x="92" y="78" width="16" height="6" rx="3" {...W}/></g>,
  garrafa: <g><rect x="84" y="24" width="32" height="20" rx="5"/><rect x="70" y="46" width="60" height="130" rx="22"/><rect x="80" y="70" width="10" height="80" rx="5" {...W}/></g>,
  carteira: <g><rect x="40" y="62" width="120" height="82" rx="14"/><rect x="114" y="88" width="46" height="30" rx="8" {...W}/><circle cx="128" cy="103" r="5" fill="currentColor"/><path d="M52 62l70-22 10 22" opacity=".55"/></g>,
  luminaria: <g><path d="M66 46h68l22 56H44z"/><rect x="96" y="102" width="8" height="54"/><rect x="62" y="156" width="76" height="12" rx="6"/><ellipse cx="100" cy="104" rx="40" ry="5" {...W}/></g>,
  caneca: <g><rect x="52" y="62" width="80" height="98" rx="14"/><path d="M132 84h12a20 20 0 0 1 0 40h-12" fill="none" stroke="currentColor" strokeWidth="11"/><path d="M78 40c-6 8 6 10 0 18M100 36c-6 8 6 10 0 18" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity=".45"/></g>,
  planta: <g><path d="M68 122h64l-9 50H77z"/><path d="M100 122c0-40-32-52-44-64 34 0 44 28 44 64 0-42 26-64 48-70-10 34-36 46-48 70" /><rect x="64" y="118" width="72" height="10" rx="4"/></g>,
};
export function Art({ p, round }) {
  const c = p.cor || '#e6dccd';
  return (
    <div className="artbox" style={{ background: `radial-gradient(circle at 30% 25%, #ffffffaa, transparent 55%), linear-gradient(160deg, ${c}, ${shade(c, -14)})`, borderRadius: round || 0 }}>
      <svg viewBox="0 0 200 200" fill="currentColor">{ICONS[p.icon] || ICONS.caixa}</svg>
    </div>
  );
}
export function shade(hex, pct) {
  const n = parseInt(hex.slice(1), 16); const f = v => Math.max(0, Math.min(255, Math.round(v + v * pct / 100)));
  return '#' + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map(x => x.toString(16).padStart(2, '0')).join('');
}
