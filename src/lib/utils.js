// Formatação, máscaras, validações, cupons e cálculo de frete
export const brl = v => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const onlyDigits = s => (s || '').replace(/\D/g, '');
export const STORE_KEY = 'lumen-store-v1';
export const load = () => { try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) { return null; } };
export const save = d => { try { localStorage.setItem(STORE_KEY, JSON.stringify(d)); } catch (e) {} };
export const STATUS = ['Aguardando pagamento', 'Pagamento aprovado', 'Em separação', 'Enviado', 'Entregue'];
export const COUPONS = {
  BEMVINDO10: { tipo: 'pct', valor: 10, label: '10% de desconto' },
  FRETEGRATIS: { tipo: 'frete', valor: 0, label: 'Frete grátis' },
  LUMEN50: { tipo: 'fixo', valor: 50, label: 'R$ 50 OFF (acima de R$ 400)', min: 400 },
};
export const FREE_SHIP = 299;
export const CATS = ['Tecnologia', 'Moda', 'Acessórios', 'Casa'];

export const maskCPF = v => onlyDigits(v).slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
export const maskCEP = v => onlyDigits(v).slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
export const maskTel = v => { const d = onlyDigits(v).slice(0, 11); return d.length <= 10 ? d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2') : d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2'); };
export const maskCard = v => onlyDigits(v).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
export const maskVal = v => onlyDigits(v).slice(0, 4).replace(/(\d{2})(\d)/, '$1/$2');
export function validCPF(c) {
  c = onlyDigits(c); if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
  let s = 0; for (let i = 0; i < 9; i++) s += +c[i] * (10 - i); let r = (s * 10) % 11 % 10; if (r !== +c[9]) return false;
  s = 0; for (let i = 0; i < 10; i++) s += +c[i] * (11 - i); r = (s * 10) % 11 % 10; return r === +c[10];
}
export function luhn(n) { n = onlyDigits(n); let s = 0, alt = false; for (let i = n.length - 1; i >= 0; i--) { let d = +n[i]; if (alt) { d *= 2; if (d > 9) d -= 9; } s += d; alt = !alt; } return n.length === 16 && s % 10 === 0; }
export function cardBrand(n) { n = onlyDigits(n); if (/^4/.test(n)) return 'VISA'; if (/^5[1-5]/.test(n)) return 'MASTERCARD'; if (/^3[47]/.test(n)) return 'AMEX'; if (/^(636|438935|504175|451416|509)/.test(n)) return 'ELO'; return 'CARTÃO'; }

export const UFS = { 0: 'SP', 1: 'SP', 2: 'RJ', 3: 'MG', 4: 'BA', 5: 'PE', 6: 'CE', 7: 'DF', 8: 'PR', 9: 'RS' };
export function calcFrete(cep, subtotal, cupom) {
  const d = onlyDigits(cep); if (d.length !== 8) return null;
  const reg = +d[0];
  const base = 14.9 + reg * 2.3, dias = 3 + Math.round(reg * 0.8);
  const free = subtotal >= FREE_SHIP || (cupom && COUPONS[cupom]?.tipo === 'frete');
  return [
    { id: 'pac', nome: 'Econômica', preco: free ? 0 : +base.toFixed(2), prazo: `${dias}–${dias + 3} dias úteis` },
    { id: 'sedex', nome: 'Expressa', preco: +(base * 1.75).toFixed(2), prazo: `${Math.max(1, Math.ceil(dias / 2))}–${Math.ceil(dias / 2) + 1} dias úteis` },
  ];
}
