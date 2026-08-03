// Formatters and Calculation Helpers for Purchasing

export function parseIDNumber(x: any): number {
  if (x === null || x === undefined || x === '') return 0;
  if (typeof x === 'number') return isNaN(x) ? 0 : x;
  let s = String(x).trim();
  if (s === '') return 0;
  s = s.replace(/[^0-9.,\-]/g, '');
  if (s === '' || s === '-') return 0;

  const hasDot = s.indexOf('.') > -1;
  const hasComma = s.indexOf(',') > -1;

  if (hasDot && hasComma) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (hasComma && !hasDot) {
    s = s.replace(',', '.');
  } else if (hasDot && !hasComma) {
    const dotCount = (s.match(/\./g) || []).length;
    if (dotCount > 1) {
      s = s.replace(/\./g, '');
    } else {
      const afterDot = s.split('.')[1] || '';
      if (afterDot.length === 3) {
        s = s.replace(/\./g, '');
      }
    }
  }
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

export function fmtRp(x: any): string {
  if (x === null || x === undefined || x === '') return '—';
  const n = parseIDNumber(x);
  return 'Rp\u00A0' + new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(n));
}

export function fmtDate(x: string | Date | null | undefined): string {
  if (!x) return '—';
  try {
    const d = new Date(x);
    return isNaN(d.getTime()) ? String(x) : d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return String(x);
  }
}

export function fmtPct(profitVal: any, totalBeli: any, hargaJual: any): { text: string; isPos: boolean; pct: number } {
  const jual = parseIDNumber(hargaJual);
  const beli = parseIDNumber(totalBeli);
  let pct = 0;
  if (jual !== 0) {
    pct = ((jual - beli) / jual) * 100;
  } else {
    pct = parseIDNumber(profitVal);
  }
  const sign = pct >= 0 ? '+' : '';
  const fixed = Math.abs(pct) >= 100 ? pct.toFixed(1) : pct.toFixed(2);
  return {
    text: `${sign}${fixed}%`,
    isPos: pct >= 0,
    pct
  };
}

export function invTerbilang(n: number): string {
  n = Math.round(n);
  if (n === 0) return 'Nol Rupiah';
  const satuan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan',
    'Sepuluh', 'Sebelas', 'Dua Belas', 'Tiga Belas', 'Empat Belas', 'Lima Belas',
    'Enam Belas', 'Tujuh Belas', 'Delapan Belas', 'Sembilan Belas'];
  const tens = ['', '', 'Dua Puluh', 'Tiga Puluh', 'Empat Puluh', 'Lima Puluh', 'Enam Puluh', 'Tujuh Puluh', 'Delapan Puluh', 'Sembilan Puluh'];

  function ratusan(x: number): string {
    if (x < 20) return satuan[x] || '';
    if (x < 100) return tens[Math.floor(x / 10)] + (x % 10 ? ' ' + satuan[x % 10] : '');
    return (x < 200 ? 'Seratus' : satuan[Math.floor(x / 100)] + ' Ratus') + (x % 100 ? ' ' + ratusan(x % 100) : '');
  }

  function jutaan(x: number): string {
    if (x < 1000) return ratusan(x);
    if (x < 1e6) {
      const r = Math.floor(x / 1000);
      return (r === 1 ? 'Seribu' : ratusan(r) + ' Ribu') + (x % 1000 ? ' ' + ratusan(x % 1000) : '');
    }
    if (x < 1e9) return ratusan(Math.floor(x / 1e6)) + ' Juta' + (x % 1e6 ? ' ' + jutaan(x % 1e6) : '');
    if (x < 1e12) return ratusan(Math.floor(x / 1e9)) + ' Miliar' + (x % 1e9 ? ' ' + jutaan(x % 1e9) : '');
    return ratusan(Math.floor(x / 1e12)) + ' Triliun' + (x % 1e12 ? ' ' + jutaan(x % 1e12) : '');
  }

  return jutaan(n) + ' Rupiah';
}

export function spHargaJual(modal: number, costRatio: number): number {
  if (!costRatio || costRatio <= 0 || costRatio > 1) return modal;
  return modal / costRatio;
}

export function spKeuntungan(modal: number, costRatio: number): number {
  if (!costRatio || costRatio <= 0 || costRatio > 1) return 0;
  return (modal / costRatio) - modal;
}

export function spMarginPct(modal: number, costRatio: number): number {
  if (!costRatio || costRatio <= 0 || costRatio > 1) return 0;
  return (1 - costRatio) * 100;
}
