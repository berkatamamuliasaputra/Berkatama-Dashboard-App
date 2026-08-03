// PDF and HTML Print Export utilities for Purchasing

import { fmtRp, parseIDNumber, invTerbilang } from './formatters';

export function printQuotationPDF(data: {
  noSurat: string;
  tanggal: string;
  namaCustomer: string;
  namaPerusahaan: string;
  items: Array<{
    namaItem: string;
    gambar?: string;
    jumlah: number;
    satuan: string;
    hargaModal: number;
    profit: number;
    hargaSatuan: number;
  }>;
  lainLain?: number;
  catatan?: string;
  subTotal: number;
  pajak: number;
  ppnRate: number;
  ppnLabel: string;
  grandTotal: number;
}) {
  const validItems = data.items.filter(i => i.namaItem && i.namaItem.trim());
  const emptyRowCount = Math.max(0, 3 - validItems.length);
  const BB = '#1a5cad';
  const LOGO = 'https://docs.google.com/drawings/d/e/2PACX-1vT3QpvI0MKSmDoilYUG7si-kizLx9UxTgcTLj18ueAQ4XHfRrNlrxOhQLmtJUgrXu623dC0Ek3qeeLZ/pub?w=480&h=360';

  function fD(d: string) {
    if (!d) return 'DD/MM/YYYY';
    try {
      return new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return d;
    }
  }

  function esc(s: string) {
    return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  const itemRows = validItems.map(it => `
    <tr>
      <td class="il">${esc(it.namaItem)}</td>
      <td class="ic">${it.gambar ? `<img src="${it.gambar}" style="max-width:80px;max-height:58px;object-fit:contain;display:block;margin:auto" onerror="this.style.display='none'">` : ''}</td>
      <td class="ic">${it.jumlah}</td>
      <td class="ic">${esc(it.satuan)}</td>
      <td class="ir">${fmtRp(it.hargaSatuan)}</td>
      <td class="ir fw">${fmtRp(it.jumlah * it.hargaSatuan)}</td>
    </tr>
  `).join('');

  let emptyRows = '';
  for (let i = 0; i < emptyRowCount; i++) {
    emptyRows += '<tr><td style="height:55px">&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>';
  }

  const css = `
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,Helvetica,sans-serif;padding:22px 28px;color:#1a1a1a;font-size:12px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    @page{margin:10mm 14mm;size:A4}
    .hd{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:22px}
    .hd-left{display:flex;align-items:flex-start;gap:12px}
    .hd-logo{width:70px;height:auto}
    .co-name{font-size:13.5px;font-weight:900;color:${BB};margin-bottom:5px}
    .co-detail{font-size:9.5px;color:#374151;line-height:1.7}
    .qt-title{font-size:30px;font-weight:900;color:${BB};letter-spacing:2px;align-self:center}
    .info-row{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px}
    .info-left{flex:1;margin-right:16px}
    .info-right{width:42%;flex-shrink:0}
    .kpd-hd{background:${BB};color:#fff;font-weight:700;font-size:11px;padding:6px 10px}
    .kpd-name{font-weight:700;font-size:12.5px;padding:7px 0 3px}
    .kpd-co{font-size:11px;color:#374151}
    .nt{width:100%;border-collapse:collapse}
    .nt th{background:${BB};color:#fff;padding:7px 12px;text-align:center;font-size:11px;font-weight:700;border:1px solid #1354a0}
    .nt td{padding:7px 12px;text-align:center;font-size:11.5px;border:1px solid #d1d5db}
    .it{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:16px}
    .it thead th{background:${BB};color:#fff;padding:8px 10px;font-weight:700;border:1px solid #1354a0}
    .it tbody td{padding:8px 10px;border:1px solid #d1d5db;vertical-align:middle}
    .il{text-align:left}.ic{text-align:center}.ir{text-align:right}.fw{font-weight:700}
    .tw{display:flex;justify-content:flex-end;margin-bottom:20px}
    .tt{width:42%;border-collapse:collapse;font-size:11.5px}
    .tt td{padding:7px 12px;border:1px solid #d1d5db}.tl{font-weight:600}.tr2{text-align:right}
    .gr{background:${BB};color:#fff;font-weight:900;font-size:13px}
    .ib{border:1px solid #9ca3af;padding:10px 14px;max-width:52%;border-radius:2px}
    .il2{font-weight:700;font-size:10.5px;margin-bottom:4px}
    .it2{font-size:10px;color:#374151;white-space:pre-wrap;line-height:1.75}
    .pbtn{position:fixed;bottom:20px;right:20px;background:${BB};color:#fff;border:none;padding:10px 22px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.25)}
    @media print{.pbtn{display:none}}
  `;

  const html = `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Quotation ${data.noSurat}</title><style>${css}</style></head><body>
    <button class="pbtn" onclick="window.print()">🖨 Cetak / Simpan PDF</button>
    <div class="hd">
      <div class="hd-left">
        <img class="hd-logo" src="${LOGO}" alt="BMS" onerror="this.style.display='none'">
        <div>
          <div class="co-name">PT. BERKATAMA MULIA SAPUTRA</div>
          <div class="co-detail">Brand Office : Dsn. Gamping Kulon RT. 004 RW. 002<br>Krian<br>Email : berkatama.ms@gmail.com<br>Telepon : (031) 99899266</div>
        </div>
      </div>
      <div class="qt-title">QUOTATION</div>
    </div>
    <div class="info-row">
      <div class="info-left">
        <div class="kpd-hd">Kepada Yth :</div>
        <div class="kpd-name">${esc(data.namaPerusahaan || '&nbsp;')}</div>
        ${data.namaCustomer ? `<div class="kpd-co">u.p. ${esc(data.namaCustomer)}</div>` : '<div class="kpd-co">&nbsp;</div>'}
      </div>
      <div class="info-right">
        <table class="nt">
          <thead><tr><th>Nomor</th><th>Tanggal</th></tr></thead>
          <tbody><tr><td>${esc(data.noSurat)}</td><td>${fD(data.tanggal)}</td></tr></tbody>
        </table>
      </div>
    </div>
    <table class="it">
      <thead><tr>
        <th style="width:30%;text-align:left">Item</th>
        <th style="width:20%">Gambar</th>
        <th style="width:8%">Jumlah</th>
        <th style="width:8%">Satuan</th>
        <th style="width:17%">Harga Satuan</th>
        <th style="width:17%">Total</th>
      </tr></thead>
      <tbody>${itemRows}${emptyRows}</tbody>
    </table>
    <div class="tw">
      <table class="tt">
        <tr><td class="tl">Sub Total</td><td class="tr2" style="font-weight:700">${fmtRp(data.subTotal)}</td></tr>
        <tr><td style="font-weight:400">${esc(data.ppnLabel || 'Tanpa PPN')}</td><td class="tr2">${data.ppnRate > 0 ? fmtRp(data.pajak) : '-'}</td></tr>
        <tr><td style="font-weight:400">Lain - Lain</td><td class="tr2">${data.lainLain ? fmtRp(data.lainLain) : '-'}</td></tr>
        <tr class="gr"><td class="tl">Grand Total</td><td class="tr2">${fmtRp(data.grandTotal)}</td></tr>
      </table>
    </div>
    <div class="ib"><div class="il2">Informasi :</div><div class="it2">${esc(data.catatan || '')}</div></div>
  </body></html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 600);
  }
}

export function printInvoicePDF(data: {
  tipe: string;
  noFaktur: string;
  tanggal: string;
  noPO?: string;
  fakturPajak?: string;
  term?: string;
  jatuhTempo?: string;
  namaPerusahaan: string;
  alamat?: string;
  npwp?: string;
  keterangan?: string;
  items: Array<{
    namaBarang: string;
    qty: number;
    unit: string;
    hargaSatuan: number;
  }>;
  hargaJual: number;
  potongan?: number;
  uangMuka?: number;
  dpp: number;
  ppn: number;
  total: number;
}) {
  const items = data.items.filter(i => i.namaBarang && String(i.namaBarang).trim());

  function esc(s: string) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function fD(d: string) {
    if (!d || d === '-') return d || '-';
    try { return new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
    catch { return d; }
  }
  function fN(n: any) {
    if (n === null || n === undefined || n === '') return '';
    const v = Math.round(parseIDNumber(n));
    if (v === 0) return '-';
    return new Intl.NumberFormat('id-ID').format(v);
  }

  const judul = (data.tipe === 'NONPPN') ? 'F A K T U R' : 'FAKTUR / INVOICE';
  const isCOD = data.tipe === 'COD';
  const isNonPPN = data.tipe === 'NONPPN';
  const dppLabel = isNonPPN ? 'DPP NILAI LAIN' : 'DASAR PENGENAAN PAJAK';

  let keterangan = data.keterangan || '';
  if (!keterangan) {
    if (isCOD) keterangan = 'CBD';
    else if (data.term) keterangan = 'Term of Payment : ' + data.term;
  }
  const jatuhTempoStr = isCOD ? '-' : (data.jatuhTempo ? fD(data.jatuhTempo) : '-');

  const hj = data.hargaJual || 0;
  const pt = data.potongan || 0;
  const dp = data.uangMuka || 0;
  const dpp = data.dpp || 0;
  const ppn = data.ppn || 0;
  const tot = data.total || 0;

  const MIN_ROWS = 15;
  let itemHTML = '';
  items.forEach((it, i) => {
    const sub = Math.round(parseIDNumber(it.qty) * parseIDNumber(it.hargaSatuan));
    itemHTML += `
      <tr>
        <td class="c b" style="width:5%">${i + 1}</td>
        <td class="l b" style="width:45%">${esc(it.namaBarang)}</td>
        <td class="c b" style="width:8%">${it.qty % 1 === 0 ? it.qty : parseFloat(String(it.qty)).toFixed(2)}</td>
        <td class="c b" style="width:8%">${esc(it.unit || 'KG')}</td>
        <td class="r b" style="width:17%">${fN(parseIDNumber(it.hargaSatuan))}</td>
        <td class="r b" style="width:17%">${fN(sub)}</td>
      </tr>`;
  });

  for (let ei = items.length; ei < MIN_ROWS; ei++) {
    itemHTML += '<tr><td class="b eh">&nbsp;</td><td class="b eh"></td><td class="b eh"></td><td class="b eh"></td><td class="b eh"></td><td class="b eh"></td></tr>';
  }

  const css = `
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;font-size:11pt;color:#000;background:#fff;padding:8mm 10mm;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    @page{size:A4 portrait;margin:6mm 8mm}
    table{border-collapse:collapse;width:100%}
    .b{border:1px solid #000}
    .bt{border-top:1px solid #000}
    .bb{border-bottom:1px solid #000}
    .bl{border-left:1px solid #000}
    .br{border-right:1px solid #000}
    .btb{border-top:1px solid #000;border-bottom:1px solid #000}
    .c{text-align:center}.l{text-align:left}.r{text-align:right}
    .bold{font-weight:bold}
    .eh{height:18pt}
    .pbtn{position:fixed;bottom:14px;right:14px;background:#0a1e35;color:#d4af6a;border:1.5px solid #d4af6a;border-radius:8px;padding:7px 18px;font-size:11px;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.3);z-index:9999}
    @media print{.pbtn{display:none}}
  `;

  const html = `<!DOCTYPE html><html lang="id"><head>
    <meta charset="UTF-8"><title>${esc(data.noFaktur)}</title>
    <style>${css}</style></head><body>
    <button class="pbtn" onclick="window.print()">🖨 Cetak / Simpan PDF</button>
    <table>
      <tr><td colspan="6" class="l bold bt bl br" style="font-size:13pt;padding:3px 6px">PT. BERKATAMA MULIA SAPUTRA</td></tr>
      <tr><td colspan="6" class="l bl br" style="font-size:10pt;padding:1px 6px">Dsn. Gamping Kulon RT. 004 RW. 002 Jerukgamping, Krian Kab. Sidoarjo Jawa Timur</td></tr>
      <tr><td colspan="6" class="btb bl br" style="height:4px"></td></tr>
      <tr>
        <td rowspan="2" colspan="2" class="c bold b" style="font-size:13pt;vertical-align:middle">${esc(judul)}</td>
        <td colspan="3" class="l bold bt bl" style="padding:2px 6px;font-size:10pt">Nomor Faktur Penjualan</td>
        <td class="l bold bt bl br" style="padding:2px 6px;font-size:10pt">Tanggal</td>
      </tr>
      <tr>
        <td colspan="3" class="l bb bl" style="padding:2px 6px;font-size:11pt">${esc(data.noFaktur || '')}</td>
        <td class="l bb bl br" style="padding:2px 6px;font-size:11pt">${fD(data.tanggal)}</td>
      </tr>
      <tr>
        <td colspan="2" class="l bt bl br" style="padding:2px 6px">Kepada Yth,</td>
        <td colspan="4" class="l bold bt bl br" style="padding:2px 6px;font-size:10pt">Nomor Surat Pemesanan</td>
      </tr>
      <tr>
        <td colspan="2" class="l bold bl br" style="padding:2px 6px">${esc(data.namaPerusahaan || '')}</td>
        <td colspan="4" class="l bb bl br" style="padding:2px 6px">${esc(data.noPO || '')}</td>
      </tr>
      <tr>
        <td colspan="2" class="l bl br" style="padding:1px 6px;font-size:10pt">${esc((data.alamat || '').split('\n')[0] || '')}</td>
        <td colspan="4" class="l bold bt bl br" style="padding:2px 6px;font-size:10pt">Nomor Faktur Pajak</td>
      </tr>
      <tr>
        <td colspan="2" class="l bl br" style="padding:1px 6px;font-size:10pt">${esc((data.alamat || '').split('\n').slice(1).join(' ') || '')}</td>
        <td colspan="4" class="l bb bl br" style="padding:2px 6px">${esc(data.fakturPajak || '-')}</td>
      </tr>
      <tr>
        <td rowspan="2" colspan="2" class="l bl br" style="padding:1px 6px;font-size:10pt;vertical-align:top">&nbsp;</td>
        <td colspan="4" class="l bold bt bl br" style="padding:2px 6px;font-size:10pt">Tanggal Jatuh Tempo</td>
      </tr>
      <tr><td colspan="4" class="l bl br" style="padding:2px 6px">${jatuhTempoStr}</td></tr>
      <tr>
        <td class="l bl bt" style="padding:2px 4px;font-size:10pt">NPWP&nbsp;&nbsp;&nbsp;:</td>
        <td class="l bt br" style="padding:2px 4px;font-size:10pt;font-weight:bold">${esc(data.npwp || '')}</td>
        <td colspan="4" class="l bold bt bl br" style="padding:2px 6px;font-size:10pt">Keterangan</td>
      </tr>
      <tr>
        <td colspan="2" class="bl br" style="height:4px"></td>
        <td colspan="4" rowspan="2" class="l bl br bb" style="padding:3px 6px;font-size:10.5pt;vertical-align:middle">${esc(keterangan)}</td>
      </tr>
      <tr><td colspan="2" class="bl br bb" style="height:4px"></td></tr>
      <tr><td colspan="6" class="l bl br bb" style="padding:3px 6px;font-style:italic;font-size:10pt">Barang dan spesifikasi adalah sebagai berikut :</td></tr>
      <tr>
        <td class="c bold b" style="padding:4px 2px">NO</td>
        <td class="c bold b" style="padding:4px 6px">BARANG DAN SPESIFIKASI</td>
        <td class="c bold b" style="padding:4px 2px">QTY</td>
        <td class="c bold b" style="padding:4px 2px">UNIT</td>
        <td class="c bold b" style="padding:4px 4px">HARGA SATUAN</td>
        <td class="c bold b" style="padding:4px 4px">SUB TOTAL IDR</td>
      </tr>
      ${itemHTML}
      <tr>
        <td colspan="4" class="c bold bt bb bl br" style="padding:3px 6px;vertical-align:top">Terbilang</td>
        <td class="l bold bt bb bl br" style="padding:3px 4px">HARGA JUAL</td>
        <td class="r bold bt bb bl br" style="padding:3px 8px">${fN(hj)}</td>
      </tr>
      <tr>
        <td rowspan="5" colspan="4" class="l bold bl br" style="padding:4px 8px;vertical-align:top;font-size:10.5pt">${esc(invTerbilang(tot))}</td>
        <td class="l bt bb bl br" style="padding:3px 4px">POTONGAN HARGA</td>
        <td class="r bt bb bl br" style="padding:3px 8px">${pt > 0 ? fN(pt) : '-'}</td>
      </tr>
      <tr>
        <td class="l bt bb bl br" style="padding:3px 4px">UANG MUKA</td>
        <td class="r bt bb bl br" style="padding:3px 8px">${dp > 0 ? fN(dp) : '-'}</td>
      </tr>
      <tr>
        <td class="l bt bb bl br" style="padding:3px 4px">${dppLabel}</td>
        <td class="r bt bb bl br" style="padding:3px 8px">${fN(dpp)}</td>
      </tr>
      <tr>
        <td class="l bt bb bl br" style="padding:3px 4px">PPN 12%</td>
        <td class="r bt bb bl br" style="padding:3px 8px">${fN(ppn)}</td>
      </tr>
      <tr>
        <td class="l bold b" style="padding:4px 4px">TOTAL</td>
        <td class="r bold b" style="padding:4px 8px">${fN(tot)}</td>
      </tr>
      <tr>
        <td colspan="2" rowspan="7" class="l b" style="padding:6px 8px;font-size:10pt;vertical-align:top;line-height:1.7">
          Pembayaran dengan Bilyet Giro / Melalui<br>T. Transfer harap diatasnamakan / ditujukan :<br><br>
          <strong style="font-size:11.5pt">MANDIRI</strong><br>
          <span style="font-size:11pt;font-weight:bold;letter-spacing:1px">1410 0975 975 20</span><br>
          a/n PT BERKATAMA MULIA SAPUTRA
        </td>
        <td colspan="4" rowspan="7" class="c b" style="padding:6px;vertical-align:top;font-size:11pt">
          Hormat Kami,<br><br><br><br><br><br><br>
          <span style="border-top:1.5px solid #000;padding-top:3px;font-weight:bold;font-size:11pt;display:inline-block;min-width:180px">Deo Fajar Andyka, S.Kom</span>
        </td>
      </tr>
      <tr></tr><tr></tr><tr></tr><tr></tr><tr></tr><tr></tr>
    </table>
  </body></html>`;

  const win = window.open('', '_blank', 'width=900,height=750,scrollbars=yes');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

export function printSuratJalanPDF(data: {
  noSuratJalan: string;
  noOrder: string;
  tanggal: string;
  namaCustomer: string;
  alamatCustomer?: string;
  items: Array<{
    banyaknya: string | number;
    namaBarang: string;
  }>;
}) {
  const LOGO = 'https://docs.google.com/drawings/d/e/2PACX-1vT3QpvI0MKSmDoilYUG7si-kizLx9UxTgcTLj18ueAQ4XHfRrNlrxOhQLmtJUgrXu623dC0Ek3qeeLZ/pub?w=480&h=360';
  const STAMP_SIGNATURE_URL = 'https://docs.google.com/drawings/d/e/2PACX-1vT3J3_4-8FwTLgK9hE7TGh3vPWqtVmcGTgMYsY2KJXzEdAgTtdDGKV3EWUFHxOrVrm5rnO_luz99LhB/pub?w=960&h=720';

  function esc(s: string) {
    return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function formatDateID(dStr: string) {
    if (!dStr) return '...........................................';
    try {
      const dt = new Date(dStr + 'T00:00:00');
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}`;
    } catch {
      return dStr;
    }
  }

  const validItems = (data.items || []).filter(i => i && (i.namaBarang || '').trim());
  const TOTAL_GRID_ROWS = 10;
  const emptyRowCount = Math.max(0, TOTAL_GRID_ROWS - validItems.length);

  let itemRows = validItems.map(it => `
    <tr>
      <td class="col-qty">${esc(String(it.banyaknya || ''))}</td>
      <td class="col-item">${esc(it.namaBarang)}</td>
    </tr>
  `).join('');

  for (let i = 0; i < emptyRowCount; i++) {
    itemRows += `
      <tr>
        <td class="col-qty">&nbsp;</td>
        <td class="col-item">&nbsp;</td>
      </tr>
    `;
  }

  const dateDisplay = data.tanggal ? formatDateID(data.tanggal) : '...........................................';
  const customerDisplay = data.namaCustomer ? esc(data.namaCustomer) : '...........................................';
  const addressDisplay = data.alamatCustomer ? esc(data.alamatCustomer) : '...........................................';
  const orderDisplay = data.noOrder ? esc(data.noOrder) : '...........................................';
  const sjDisplay = data.noSuratJalan ? esc(data.noSuratJalan) : '...........................................';

  const css = `
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,Helvetica,sans-serif;padding:20px 28px;color:#000;font-size:12px;-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#fff}
    @page{margin:8mm 10mm;size:A4 portrait}

    /* Header Styling */
    .header-table{width:100%;border-collapse:collapse;margin-bottom:8px}
    .header-table td{vertical-align:top}
    
    .cop-logo-box{display:flex;align-items:center;gap:12px;margin-bottom:6px}
    .cop-logo{width:50px;height:auto;object-fit:contain}
    .cop-title{font-size:18px;font-weight:900;color:#0e38a2;letter-spacing:0.3px;font-family:Arial,sans-serif}
    
    .cop-info{font-size:11px;color:#0e38a2;font-weight:700;line-height:1.5;margin-top:2px}
    .cop-info-row{display:flex;align-items:flex-start}
    .cop-info-lbl{width:65px;shrink:0}
    .cop-info-val{flex:1}

    /* Right Header Block */
    .right-info{font-size:11.5px;color:#000;line-height:1.8;padding-left:15px}
    .right-info .location-date{font-size:12px;font-weight:700;margin-bottom:4px}
    .right-info .field-row{display:flex;align-items:baseline;margin-bottom:1px}
    .right-info .field-lbl{width:115px;font-weight:700;shrink:0}
    .right-info .field-val{font-weight:700;color:#000;word-break:break-word}

    /* Document Title */
    .doc-title{text-align:center;font-size:22px;font-weight:900;letter-spacing:2px;color:#000;margin:10px 0 14px;text-transform:uppercase}

    /* Table Grid */
    .sj-table{width:100%;border-collapse:collapse;margin-bottom:10px;border:1.5px solid #000}
    .sj-table th{border:1.5px solid #000;padding:6px 10px;font-size:12px;font-weight:900;text-align:center;background:#fff;letter-spacing:1px;color:#000}
    .sj-table td{border:1.5px solid #000;padding:6px 12px;font-size:11.5px;height:28px;vertical-align:middle;color:#000}
    .col-qty{width:22%;text-align:center;font-weight:700}
    .col-item{width:78%;text-align:left;font-weight:600}

    /* Notice Text */
    .notice-text{font-size:11px;font-weight:700;color:#000;margin-bottom:28px}

    /* Footer & Signatures */
    .footer-grid{display:flex;justify-content:space-between;align-items:flex-end;margin-top:5px}
    .sig-section{display:flex;gap:60px;align-items:flex-start;padding-left:20px}
    .sig-box{text-align:center;min-width:160px;position:relative}
    .sig-title{font-size:12px;font-weight:700;margin-bottom:4px;color:#000}
    .sig-stamp-box{height:80px;display:flex;align-items:center;justify-content:center;position:relative;margin:2px 0}
    .sig-stamp-img{max-width:160px;max-height:80px;object-fit:contain;mix-blend-mode:multiply;display:block;margin:auto}
    .sig-line{font-size:11.5px;font-weight:700;color:#000}
    .sig-comp{font-size:10px;font-weight:900;color:#0e38a2;margin-top:4px;letter-spacing:0.5px}

    /* Copy Distribution Box */
    .copy-box{border:1.5px solid #000;border-radius:10px;padding:8px 14px;font-size:10.5px;font-weight:700;line-height:1.7;background:#fff;width:260px}
    .copy-row{display:flex;justify-content:space-between;gap:6px}
    .copy-lbl{width:110px}

    .pbtn{position:fixed;bottom:20px;right:20px;background:#0e38a2;color:#fff;border:none;padding:10px 22px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.25);z-index:999}
    @media print{.pbtn{display:none}}
  `;

  const html = `<!DOCTYPE html><html lang="id"><head>
    <meta charset="UTF-8"><title>Surat Jalan ${esc(data.noSuratJalan || 'BMS')}</title>
    <style>${css}</style></head><body>
    <button class="pbtn" onclick="window.print()">🖨 Cetak / Simpan PDF Surat Jalan</button>
    
    <table class="header-table">
      <tr>
        <td style="width:54%">
          <div class="cop-logo-box">
            <img class="cop-logo" src="${LOGO}" alt="BMS Logo" referrerpolicy="no-referrer">
            <div class="cop-title">PT. BERKATAMA MULIA SAPUTRA</div>
          </div>
          <div class="cop-info">
            <div class="cop-info-row">
              <span class="cop-info-lbl">Alamat</span>
              <span class="cop-info-val">: Dusun Gamping Kulon RT.004 RW.002 Ds. Jeruk Gamping<br>&nbsp; Krian - Sidoarjo 61262</span>
            </div>
            <div class="cop-info-row">
              <span class="cop-info-lbl">Telp</span>
              <span class="cop-info-val">: 081217303709</span>
            </div>
            <div class="cop-info-row">
              <span class="cop-info-lbl">Email</span>
              <span class="cop-info-val">: berkatama.ms@gmail.com</span>
            </div>
          </div>
        </td>
        <td style="width:46%">
          <div class="right-info">
            <div class="location-date">Krian, ${dateDisplay}</div>
            <div class="field-row">
              <span class="field-lbl">Kepada Yth.</span>
              <span class="field-val">${customerDisplay}</span>
            </div>
            <div class="field-row" style="margin-bottom:6px">
              <span class="field-lbl">&nbsp;</span>
              <span class="field-val" style="font-weight:600;font-size:11px">${addressDisplay}</span>
            </div>
            <div class="field-row">
              <span class="field-lbl">No. Order</span>
              <span>: <strong class="field-val">${orderDisplay}</strong></span>
            </div>
            <div class="field-row">
              <span class="field-lbl">No.Surat Jalan</span>
              <span>: <strong class="field-val">${sjDisplay}</strong></span>
            </div>
          </div>
        </td>
      </tr>
    </table>

    <div class="doc-title">SURAT JALAN</div>

    <table class="sj-table">
      <thead>
        <tr>
          <th style="width:22%">BANYAKNYA</th>
          <th style="width:78%">NAMA BARANG</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <div class="notice-text">
      Perhatian : Barang Yang Sudah Dibeli Tidak Dapat Ditukarkan Kembali
    </div>

    <div class="footer-grid">
      <div class="sig-section">
        <div class="sig-box">
          <div class="sig-title">Penerima</div>
          <div class="sig-stamp-box"></div>
          <div class="sig-line">( ........................................... )</div>
        </div>

        <div class="sig-box">
          <div class="sig-title">Pengirim</div>
          <div class="sig-stamp-box">
            <img src="${STAMP_SIGNATURE_URL}" alt="Stempel & TTD" class="sig-stamp-img" referrerpolicy="no-referrer">
          </div>
          <div class="sig-line">( ........................................... )</div>
          <div class="sig-comp">PT. BERKATAMA MULIA SAPUTRA</div>
        </div>
      </div>

      <div class="copy-box">
        <div class="copy-row"><span class="copy-lbl">- Lembar Putih</span><span>: u/ Penagihan</span></div>
        <div class="copy-row"><span class="copy-lbl">- Lembar Merah</span><span>: u/ Gudang Customer</span></div>
        <div class="copy-row"><span class="copy-lbl">- Lembar Hijau</span><span>: u/ PT. BERKATAMA MULIA SAPUTRA</span></div>
        <div class="copy-row"><span class="copy-lbl">- Lembar Kuning</span><span>: u/ Satpam</span></div>
      </div>
    </div>
  </body></html>`;

  const win = window.open('', '_blank', 'width=900,height=750,scrollbars=yes');
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  }
}
