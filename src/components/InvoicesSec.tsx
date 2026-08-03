import React, { useState } from 'react';
import { Search, RotateCw, Plus, Download, Edit, Trash2, Printer, FileText, PlusCircle, Building } from 'lucide-react';
import { Invoice, InvoiceItem, NpwpRecord } from '../types';
import { fmtRp, fmtDate, parseIDNumber, invTerbilang } from '../utils/formatters';
import { printInvoicePDF } from '../utils/pdfGenerators';

interface InvoicesSecProps {
  data: Invoice[];
  npwpDatabase: NpwpRecord[];
  onRefresh: () => void;
  onSave: (record: Invoice, isEdit: boolean) => void;
  onDelete: (record: Invoice) => void;
  onInspect: (record: Invoice) => void;
}

export const InvoicesSec: React.FC<InvoicesSecProps> = ({
  data,
  npwpDatabase,
  onRefresh,
  onSave,
  onDelete,
  onInspect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Invoice | null>(null);

  // Form State
  const [tipe, setTipe] = useState<'TEMPO' | 'KODE007' | 'COD' | 'NONPPN'>('TEMPO');
  const [noFaktur, setNoFaktur] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [noPo, setNoPo] = useState('');
  const [fakturPajak, setFakturPajak] = useState('');
  const [term, setTerm] = useState('Net 30 (30 days from invoice date)');
  const [jatuhTempo, setJatuhTempo] = useState('');
  const [namaPerusahaan, setNamaPerusahaan] = useState('');
  const [alamat, setAlamat] = useState('');
  const [npwp, setNpwp] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [status, setStatus] = useState('Belum Lunas');

  // Items
  const [invItems, setInvItems] = useState<InvoiceItem[]>([
    { id: 1, namaBarang: '', qty: 1, unit: 'KG', hargaSatuan: 0 }
  ]);

  // Adjustments
  const [hasDiskon, setHasDiskon] = useState(false);
  const [diskonType, setDiskonType] = useState<'nominal' | 'persen'>('nominal');
  const [potongan, setPotongan] = useState<number | string>('');

  const [hasDp, setHasDp] = useState(false);
  const [uangMuka, setUangMuka] = useState<number | string>('');

  // Autocomplete
  const [searchCustQuery, setSearchCustQuery] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  const filtered = data.filter(r => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (r['ID Invoice'] || '').toLowerCase().includes(q) ||
      (r['Nama Customer'] || '').toLowerCase().includes(q) ||
      (r['Invoice Title'] || '').toLowerCase().includes(q) ||
      (r['Nomer PO'] || '').toLowerCase().includes(q)
    );
  });

  const handleOpenCreateInvoice = () => {
    setEditingRecord(null);
    const dateStr = new Date().toISOString().slice(0, 10);
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(2);
    const seq = data.length + 1;
    const autoNo = `BMS.INV.40.${yy}${mm}.${String(seq).padStart(5, '0')}`;

    setTipe('TEMPO');
    setNoFaktur(autoNo);
    setTanggal(dateStr);
    setNoPo('');
    setFakturPajak('');
    setTerm('Net 30 (30 days from invoice date)');
    
    // Auto calculate Net 30
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 30);
    setJatuhTempo(d.toISOString().slice(0, 10));

    setNamaPerusahaan('');
    setAlamat('');
    setNpwp('');
    setKeterangan('');
    setStatus('Belum Lunas');
    setInvItems([{ id: Date.now(), namaBarang: '', qty: 1, unit: 'KG', hargaSatuan: 0 }]);
    setHasDiskon(false);
    setPotongan('');
    setHasDp(false);
    setUangMuka('');
    setSearchCustQuery('');
    setIsInvoiceModalOpen(true);
  };

  const handleSelectCustomer = (record: { nama: string; npwp: string; alamat: string }) => {
    setNamaPerusahaan(record.nama);
    setNpwp(record.npwp || '');
    setAlamat(record.alamat || '');
    setSearchCustQuery(record.nama);
    setShowAutocomplete(false);
  };

  const handleAddItem = () => {
    setInvItems(prev => [...prev, { id: Date.now(), namaBarang: '', qty: 1, unit: 'KG', hargaSatuan: 0 }]);
  };

  const handleRemoveItem = (id: number) => {
    if (invItems.length <= 1) return;
    setInvItems(prev => prev.filter(i => i.id !== id));
  };

  const handleItemChange = (id: number, field: keyof InvoiceItem, val: any) => {
    setInvItems(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
  };

  // Calculations
  const hargaJual = invItems.reduce((acc, item) => acc + (parseIDNumber(item.qty) * parseIDNumber(item.hargaSatuan)), 0);

  const potVal = parseIDNumber(potongan);
  const potonganNominal = hasDiskon ? (diskonType === 'persen' ? Math.round((hargaJual * potVal) / 100) : potVal) : 0;

  const dpNominal = hasDp ? parseIDNumber(uangMuka) : 0;

  const dppRaw = Math.max(0, hargaJual - potonganNominal - dpNominal);

  let dpp = dppRaw;
  let ppn = 0;
  let total = 0;

  if (tipe === 'NONPPN') {
    const dppNonPPN = Math.round(dppRaw * (100 / 112));
    ppn = Math.round(dppNonPPN * 0.12);
    total = dppNonPPN + ppn;
    dpp = dppNonPPN;
  } else {
    ppn = Math.round(dppRaw * 0.12);
    total = dppRaw + ppn;
  }

  const handlePreviewPDF = () => {
    printInvoicePDF({
      tipe,
      noFaktur,
      tanggal,
      noPO: noPo,
      fakturPajak,
      term,
      jatuhTempo,
      namaPerusahaan,
      alamat,
      npwp,
      keterangan,
      items: invItems,
      hargaJual,
      potongan: potonganNominal,
      uangMuka: dpNominal,
      dpp,
      ppn,
      total
    });
  };

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPerusahaan.trim()) {
      alert('Nama Perusahaan wajib diisi');
      return;
    }

    const allTitles = invItems.filter(i => i.namaBarang).map(i => i.namaBarang).join(', ');

    const record: Invoice = {
      _rowIndex: editingRecord?._rowIndex,
      'ID Invoice': noFaktur,
      'Tipe Invoice': tipe,
      'Tanggal Invoice': tanggal,
      'Nama Customer': namaPerusahaan,
      'Nama Perusahaan': namaPerusahaan,
      'Nomer PO': noPo,
      'Invoice Title': allTitles || 'Invoice Items',
      'Nominal Tagihan': Math.round(total),
      'Harga Jual': Math.round(hargaJual),
      'Potongan Harga': Math.round(potonganNominal),
      'Uang Muka': Math.round(dpNominal),
      'DPP': Math.round(dpp),
      'PPN 12%': Math.round(ppn),
      'Jatuh Tempo': jatuhTempo,
      'Term of Payment': term,
      'Nomor Faktur Pajak': fakturPajak,
      'NPWP': npwp,
      'Alamat': alamat,
      'Keterangan': keterangan,
      'Status': status,
      'itemsJson': JSON.stringify(invItems)
    };

    onSave(record, !!editingRecord);
    handlePreviewPDF();
    setIsInvoiceModalOpen(false);
  };

  const pool = [
    ...npwpDatabase.map(n => ({ nama: n.NAMA, npwp: n.NPWP, alamat: n.ALAMAT })),
    ...data.map(i => ({ nama: i['Nama Customer'], npwp: i['NPWP'] || '', alamat: i['Alamat'] || '' }))
  ].filter(p => p.nama);

  const matchedCustomers = pool.filter(p =>
    searchCustQuery.trim() && p.nama.toLowerCase().includes(searchCustQuery.toLowerCase())
  ).slice(0, 8);

  return (
    <div id="sec-invoices" className="section active">
      <div className="pg-hd">
        <h4>Invoice / Faktur Penjualan</h4>
        <p>{data.length} total records tersimpan</p>
      </div>

      <div className="content flex-fill">
        <div className="data-card">
          <div className="data-hd flex items-center justify-between flex-wrap gap-2">
            <h6>Daftar Invoice</h6>
            <div className="flex items-center gap-2">
              <div className="srch">
                <Search className="w-3.5 h-3.5" />
                <input
                  placeholder="Cari No. Faktur, Customer, PO..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="btn-refresh" onClick={onRefresh} title="Refresh data">
                <RotateCw className="w-3.5 h-3.5" /> Refresh
              </button>
              <button
                className="btn-primary-sm bg-emerald-700 hover:bg-emerald-800"
                onClick={handleOpenCreateInvoice}
              >
                <Plus className="w-4 h-4" /> Create Invoice
              </button>
            </div>
          </div>

          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>ID Invoice</th>
                  <th>Tanggal</th>
                  <th>Customer</th>
                  <th>No. PO</th>
                  <th style={{ minWidth: 200 }}>Invoice Title</th>
                  <th className="text-right">Nominal Tagihan</th>
                  <th>Jatuh Tempo</th>
                  <th>Term</th>
                  <th>Status</th>
                  <th>File</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="empty-state">
                      Belum ada data Invoice
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr key={i} className="cursor-pointer" onClick={() => onInspect(r)}>
                      <td className="text-emerald-700 font-bold text-xs whitespace-nowrap">{r['ID Invoice']}</td>
                      <td className="whitespace-nowrap">{fmtDate(r['Tanggal Invoice'])}</td>
                      <td className="font-semibold">{r['Nama Customer']}</td>
                      <td className="text-xs text-slate-600">{r['Nomer PO'] || '—'}</td>
                      <td className="max-w-[260px] whitespace-normal break-words">{r['Invoice Title']}</td>
                      <td className="text-right whitespace-nowrap font-extrabold text-emerald-700">{fmtRp(r['Nominal Tagihan'])}</td>
                      <td className="whitespace-nowrap text-slate-600">{fmtDate(r['Jatuh Tempo'])}</td>
                      <td className="text-xs">{r['Term of Payment']}</td>
                      <td>
                        <span className={`bdg ${r['Status'] === 'Paid' ? 'bdg-ok' : r['Status'] === 'Overdue' ? 'bdg-err' : 'bdg-warn'}`}>
                          {r['Status']}
                        </span>
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        {r['Faktur Invoice File'] ? (
                          <a href={r['Faktur Invoice File']} target="_blank" rel="noreferrer" className="cell-link">
                            <Download className="w-3 h-3" /> File
                          </a>
                        ) : '—'}
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <button
                            className="btn-act view text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                            onClick={() => {
                              printInvoicePDF({
                                tipe: r['Tipe Invoice'] || 'TEMPO',
                                noFaktur: r['ID Invoice'],
                                tanggal: r['Tanggal Invoice'],
                                noPO: r['Nomer PO'],
                                fakturPajak: r['Nomor Faktur Pajak'],
                                term: r['Term of Payment'],
                                jatuhTempo: r['Jatuh Tempo'],
                                namaPerusahaan: r['Nama Customer'],
                                alamat: r['Alamat'],
                                npwp: r['NPWP'],
                                keterangan: r['Keterangan'],
                                items: [{ namaBarang: r['Invoice Title'], qty: 1, unit: 'KG', hargaSatuan: parseIDNumber(r['Harga Jual'] || r['Nominal Tagihan']) }],
                                hargaJual: parseIDNumber(r['Harga Jual'] || r['Nominal Tagihan']),
                                dpp: parseIDNumber(r['DPP']),
                                ppn: parseIDNumber(r['PPN 12%']),
                                total: parseIDNumber(r['Nominal Tagihan'])
                              });
                            }}
                          >
                            <Printer className="w-3 h-3" />
                          </button>
                          <button className="btn-act edit" onClick={() => {
                            setEditingRecord(r);
                            setNoFaktur(r['ID Invoice']);
                            setTanggal(r['Tanggal Invoice']);
                            setNamaPerusahaan(r['Nama Customer']);
                            setNoPo(r['Nomer PO'] || '');
                            setJatuhTempo(r['Jatuh Tempo'] || '');
                            setTerm(r['Term of Payment'] || '');
                            setStatus(r['Status'] || 'Belum Lunas');
                            setIsInvoiceModalOpen(true);
                          }}>
                            <Edit className="w-3 h-3" />
                          </button>
                          <button className="btn-act del" onClick={() => onDelete(r)}>
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Create Invoice */}
      {isInvoiceModalOpen && (
        <div className="modal-backdrop open">
          <div className="modal-box max-w-5xl w-[96vw]">
            <div className="modal-hd bg-gradient-to-r from-slate-900 to-blue-900 text-white">
              <div>
                <h5 className="text-white font-bold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" /> Buat Invoice / Faktur Penjualan Baru
                </h5>
                <p className="text-xs text-blue-200">PT. BERKATAMA MULIA SAPUTRA</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={handlePreviewPDF} className="px-3 py-1.5 bg-amber-400/20 text-amber-200 border border-amber-400/40 rounded-lg text-xs font-semibold flex items-center gap-1">
                  <Printer className="w-3.5 h-3.5" /> Preview PDF
                </button>
                <button className="modal-close text-white" onClick={() => setIsInvoiceModalOpen(false)}>&times;</button>
              </div>
            </div>

            <form onSubmit={handleSaveInvoice}>
              <div className="modal-body max-h-[82vh] overflow-y-auto p-4 space-y-4">
                {/* Section 1: Type & Header Info */}
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-3">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5" /> Informasi Faktur
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="form-group">
                      <label className="form-lbl">Tipe Invoice *</label>
                      <select className="form-ctrl text-xs" value={tipe} onChange={e => setTipe(e.target.value as any)}>
                        <option value="TEMPO">BMS TEMPO (Net 30/60)</option>
                        <option value="KODE007">BMS KODE 007</option>
                        <option value="COD">BMS COD / CBD</option>
                        <option value="NONPPN">BMS NON PPN (Tanpa PPN)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-lbl">No. Faktur Penjualan *</label>
                      <input className="form-ctrl text-xs font-mono font-bold" value={noFaktur} onChange={e => setNoFaktur(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-lbl">Tanggal Invoice *</label>
                      <input className="form-ctrl text-xs" type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-lbl">Tanggal Jatuh Tempo</label>
                      <input className="form-ctrl text-xs" type="date" value={jatuhTempo} onChange={e => setJatuhTempo(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="form-group">
                      <label className="form-lbl">Term of Payment</label>
                      <select className="form-ctrl text-xs" value={term} onChange={e => setTerm(e.target.value)}>
                        <option value="Net 30 (30 days from invoice date)">Net 30 (30 hari)</option>
                        <option value="Net 60 (60 days from invoice date)">Net 60 (60 hari)</option>
                        <option value="Net 15 (15 days from invoice date)">Net 15 (15 hari)</option>
                        <option value="CBD">Cash Before Delivery (CBD)</option>
                        <option value="COD">Cash on Delivery (COD)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-lbl">No. Surat Pemesanan (No. PO)</label>
                      <input className="form-ctrl text-xs" value={noPo} onChange={e => setNoPo(e.target.value)} placeholder="PO/BMS/..." />
                    </div>
                    <div className="form-group">
                      <label className="form-lbl">Nomor Faktur Pajak</label>
                      <input className="form-ctrl text-xs" value={fakturPajak} onChange={e => setFakturPajak(e.target.value)} placeholder="000.000-26.0000000" />
                    </div>
                  </div>
                </div>

                {/* Section 2: Customer Data with Autocomplete */}
                <div className="bg-emerald-50/60 border border-emerald-200 p-3 rounded-xl space-y-3 relative">
                  <div className="flex justify-between items-center">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5" /> Kepada Yth &mdash; Data Customer
                    </div>
                    <div className="relative w-64">
                      <input
                        className="form-ctrl text-xs h-7"
                        placeholder="🔍 Cari database NPWP..."
                        value={searchCustQuery}
                        onChange={e => {
                          setSearchCustQuery(e.target.value);
                          setShowAutocomplete(true);
                        }}
                      />
                      {showAutocomplete && matchedCustomers.length > 0 && (
                        <div className="absolute top-8 left-0 right-0 bg-white border rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                          {matchedCustomers.map((c, idx) => (
                            <div
                              key={idx}
                              className="p-2 text-xs border-b hover:bg-emerald-50 cursor-pointer"
                              onClick={() => handleSelectCustomer(c)}
                            >
                              <div className="font-bold text-slate-900">{c.nama}</div>
                              {c.npwp && <div className="text-[10px] text-slate-500">NPWP: {c.npwp}</div>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="form-group">
                      <label className="form-lbl">Nama Perusahaan / Customer *</label>
                      <input className="form-ctrl text-xs" value={namaPerusahaan} onChange={e => setNamaPerusahaan(e.target.value)} placeholder="PT. / CV..." required />
                    </div>
                    <div className="form-group">
                      <label className="form-lbl">NPWP Customer</label>
                      <input className="form-ctrl text-xs font-mono" value={npwp} onChange={e => setNpwp(e.target.value)} placeholder="00.000.000.0-000.000" />
                    </div>
                    <div className="form-group span2">
                      <label className="form-lbl">Alamat Perusahaan</label>
                      <textarea className="form-ctrl text-xs" rows={2} value={alamat} onChange={e => setAlamat(e.target.value)} placeholder="Jl. ..., Kota, Provinsi" />
                    </div>
                  </div>
                </div>

                {/* Section 3: Item Rows */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="p-3 bg-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Barang & Spesifikasi</span>
                    <button type="button" onClick={handleAddItem} className="btn-act edit flex items-center gap-1">
                      <PlusCircle className="w-3.5 h-3.5" /> Tambah Baris
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="tbl text-xs">
                      <thead>
                        <tr>
                          <th className="w-10 text-center">NO</th>
                          <th>BARANG DAN SPESIFIKASI</th>
                          <th className="w-20 text-center">QTY</th>
                          <th className="w-20 text-center">UNIT</th>
                          <th className="w-36 text-right">HARGA SATUAN</th>
                          <th className="w-36 text-right">SUB TOTAL IDR</th>
                          <th className="w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {invItems.map((item, idx) => {
                          const sub = parseIDNumber(item.qty) * parseIDNumber(item.hargaSatuan);
                          return (
                            <tr key={item.id}>
                              <td className="text-center font-semibold text-slate-500">{idx + 1}</td>
                              <td>
                                <input className="form-ctrl text-xs" value={item.namaBarang} onChange={e => handleItemChange(item.id, 'namaBarang', e.target.value)} placeholder="Deskripsi barang..." required />
                              </td>
                              <td>
                                <input className="form-ctrl text-xs text-center" type="number" min="0.01" step="any" value={item.qty} onChange={e => handleItemChange(item.id, 'qty', Number(e.target.value) || 1)} />
                              </td>
                              <td>
                                <input className="form-ctrl text-xs text-center" value={item.unit} onChange={e => handleItemChange(item.id, 'unit', e.target.value)} placeholder="KG" />
                              </td>
                              <td>
                                <input className="form-ctrl text-xs text-right" type="number" value={item.hargaSatuan || ''} onChange={e => handleItemChange(item.id, 'hargaSatuan', Number(e.target.value) || 0)} placeholder="0" />
                              </td>
                              <td className="text-right font-bold text-slate-900 whitespace-nowrap">
                                {fmtRp(sub)}
                              </td>
                              <td>
                                <button type="button" className="btn-act del px-1" onClick={() => handleRemoveItem(item.id)}>
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Section 4: Totals & Adjustments */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <div className="space-y-3">
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
                      <div className="text-[10px] font-bold uppercase text-amber-800 mb-1">Terbilang:</div>
                      <div className="text-xs italic text-amber-950 font-medium">
                        {invTerbilang(total)}
                      </div>
                    </div>

                    <div>
                      <label className="form-lbl">Keterangan / Payment Notes</label>
                      <textarea className="form-ctrl text-xs" rows={3} value={keterangan} onChange={e => setKeterangan(e.target.value)} placeholder="Keterangan pembayaran..." />
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-2">
                    <div className="flex justify-between font-semibold">
                      <span>Harga Jual:</span>
                      <span>{fmtRp(hargaJual)}</span>
                    </div>

                    {/* Diskon Toggle */}
                    <div className="border-t border-b border-slate-200 py-1.5 space-y-1">
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                        <input type="checkbox" checked={hasDiskon} onChange={e => setHasDiskon(e.target.checked)} className="rounded" />
                        Potongan Harga (Diskon)
                      </label>
                      {hasDiskon && (
                        <div className="flex gap-2 items-center mt-1">
                          <select className="form-ctrl text-xs h-7 w-24" value={diskonType} onChange={e => setDiskonType(e.target.value as any)}>
                            <option value="nominal">Nominal</option>
                            <option value="persen">Persen (%)</option>
                          </select>
                          <input className="form-ctrl text-xs text-right h-7 flex-1" type="number" value={potongan} onChange={e => setPotongan(e.target.value)} placeholder="0" />
                        </div>
                      )}
                    </div>

                    {/* DP Toggle */}
                    <div className="border-b border-slate-200 pb-1.5 space-y-1">
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                        <input type="checkbox" checked={hasDp} onChange={e => setHasDp(e.target.checked)} className="rounded" />
                        Uang Muka / DP
                      </label>
                      {hasDp && (
                        <input className="form-ctrl text-xs text-right h-7 w-full mt-1" type="number" value={uangMuka} onChange={e => setUangMuka(e.target.value)} placeholder="Nilai DP..." />
                      )}
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>DPP:</span>
                      <span>{fmtRp(dpp)}</span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>{tipe === 'NONPPN' ? 'PPN (Tanpa PPN)' : 'PPN 12%:'}</span>
                      <span>{fmtRp(ppn)}</span>
                    </div>

                    <hr className="my-1 border-slate-300" />

                    <div className="flex justify-between text-base font-extrabold text-emerald-700">
                      <span>TOTAL:</span>
                      <span>{fmtRp(total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-ft">
                <button type="button" onClick={() => setIsInvoiceModalOpen(false)} className="px-4 py-2 text-xs font-semibold border rounded-lg">Batal</button>
                <button type="submit" className="btn-primary-sm bg-emerald-700">Simpan & Export PDF</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
