import React, { useState } from 'react';
import { Search, RotateCw, Plus, Download, Edit, Trash2, Printer, FileText, PlusCircle } from 'lucide-react';
import { Quotation, QuotationItem } from '../types';
import { fmtRp, fmtDate, spHargaJual, spKeuntungan, spMarginPct } from '../utils/formatters';
import { printQuotationPDF } from '../utils/pdfGenerators';

interface QuotationsSecProps {
  data: Quotation[];
  onRefresh: () => void;
  onSave: (record: Quotation, isEdit: boolean) => void;
  onDelete: (record: Quotation) => void;
  onInspect: (record: Quotation) => void;
}

export const QuotationsSec: React.FC<QuotationsSecProps> = ({
  data,
  onRefresh,
  onSave,
  onDelete,
  onInspect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSuratPenawaranOpen, setIsSuratPenawaranOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Quotation | null>(null);

  // Form State for Surat Penawaran
  const [noSurat, setNoSurat] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [namaCustomer, setNamaCustomer] = useState('');
  const [namaPerusahaan, setNamaPerusahaan] = useState('');
  const [catatan, setCatatan] = useState(
    '1. Harga Penawaran berlaku selama 14 hari dari Penawaran ini.\n2. Pembayaran 30 hari Setelah Invoice diterima lengkap\n3. Barang stok berjalan, Harga tidak mengikat\n4. Barang Indent 5 - 7 hari\n5. Harga sudah termasuk ongkir'
  );
  const [ppnMode, setPpnMode] = useState<'11' | '12' | '0'>('11');
  const [lainLain, setLainLain] = useState<number | string>(0);
  const [status, setStatus] = useState('QUOTATION');

  const [spItems, setSpItems] = useState<QuotationItem[]>([
    { id: 1, namaItem: '', gambar: '', jumlah: 1, satuan: 'pcs', hargaModal: 0, profit: 0.8, hargaSatuan: 0 }
  ]);

  const filtered = data.filter(r => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (r['ID Quotation'] || '').toLowerCase().includes(q) ||
      (r['Nama Customer'] || '').toLowerCase().includes(q) ||
      (r['Nama Perusahaan'] || '').toLowerCase().includes(q) ||
      (r['Nama Barang'] || '').toLowerCase().includes(q)
    );
  });

  const handleOpenNewSuratPenawaran = () => {
    setEditingRecord(null);
    const dateStr = new Date().toISOString().slice(0, 10);
    const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const d = new Date();
    const mm = ROMAN[d.getMonth()];
    const yy = String(d.getFullYear()).slice(-2);
    const seq = data.length + 265;
    const autoNo = `PNW/BMS/${mm}/${yy}-${seq}`;

    setNoSurat(autoNo);
    setTanggal(dateStr);
    setNamaCustomer('');
    setNamaPerusahaan('');
    setSpItems([
      { id: Date.now(), namaItem: '', gambar: '', jumlah: 1, satuan: 'pcs', hargaModal: 0, profit: 0.8, hargaSatuan: 0 }
    ]);
    setPpnMode('11');
    setLainLain(0);
    setStatus('QUOTATION');
    setIsSuratPenawaranOpen(true);
  };

  const handleAddItem = () => {
    setSpItems(prev => [
      ...prev,
      { id: Date.now(), namaItem: '', gambar: '', jumlah: 1, satuan: 'pcs', hargaModal: 0, profit: 0.8, hargaSatuan: 0 }
    ]);
  };

  const handleRemoveItem = (id: number) => {
    if (spItems.length <= 1) return;
    setSpItems(prev => prev.filter(item => item.id !== id));
  };

  const handleItemChange = (id: number, field: keyof QuotationItem, val: any) => {
    setSpItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: val };
      if (field === 'hargaModal' || field === 'profit') {
        const modal = Number(field === 'hargaModal' ? val : item.hargaModal) || 0;
        const ratio = Number(field === 'profit' ? val : item.profit) || 0;
        updated.hargaSatuan = modal > 0 ? spHargaJual(modal, ratio) : item.hargaSatuan;
      }
      return updated;
    }));
  };

  // Calculations
  const subTotal = spItems.reduce((acc, item) => {
    const hargaEfektif = item.hargaModal > 0 ? spHargaJual(item.hargaModal, item.profit) : (item.hargaSatuan || 0);
    return acc + (item.jumlah * hargaEfektif);
  }, 0);

  const ppnRate = Number(ppnMode);
  const pajak = subTotal * (ppnRate / 100);
  const lainLainNum = Number(lainLain) || 0;
  const grandTotal = subTotal + pajak + lainLainNum;

  const handlePreviewPDF = () => {
    const pdfData = {
      noSurat,
      tanggal,
      namaCustomer,
      namaPerusahaan,
      items: spItems.map(i => ({
        ...i,
        hargaSatuan: i.hargaModal > 0 ? spHargaJual(i.hargaModal, i.profit) : i.hargaSatuan
      })),
      catatan,
      subTotal,
      pajak,
      ppnRate,
      ppnLabel: ppnRate === 0 ? 'Tanpa PPN' : `PPN ${ppnRate}%`,
      lainLain: lainLainNum,
      grandTotal
    };
    printQuotationPDF(pdfData);
  };

  const handleSaveQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPerusahaan.trim()) {
      alert('Nama Perusahaan wajib diisi');
      return;
    }

    const firstItem = spItems[0] || {};
    const allItemNames = spItems.filter(i => i.namaItem).map(i => i.namaItem).join(', ');
    const totalQty = spItems.reduce((s, i) => s + i.jumlah, 0);

    const record: Quotation = {
      _rowIndex: editingRecord?._rowIndex,
      'ID Quotation': noSurat,
      'Tanggal': tanggal,
      'Nama Customer': namaCustomer || namaPerusahaan,
      'Nama Perusahaan': namaPerusahaan,
      'Nama Barang': allItemNames || 'Surat Penawaran Items',
      'Qty': totalQty,
      'Uom': firstItem.satuan || 'pcs',
      'Harga': Math.round(firstItem.hargaSatuan || 0),
      'Total Harga': Math.round(subTotal),
      'Harga (PPN)': Math.round(pajak),
      'Grand Total + (PPN 11%)': Math.round(grandTotal),
      'Mode PPN': ppnRate === 0 ? 'NON PPN' : `PPN ${ppnRate}%`,
      'Status': status,
      'catatan': catatan,
      'itemsJson': JSON.stringify(spItems)
    };

    onSave(record, !!editingRecord);
    handlePreviewPDF();
    setIsSuratPenawaranOpen(false);
  };

  return (
    <div id="sec-quotations" className="section active">
      <div className="pg-hd">
        <h4>Quotation / Surat Penawaran</h4>
        <p>{data.length} total records tersimpan</p>
      </div>

      <div className="content flex-fill">
        <div className="data-card">
          <div className="data-hd flex items-center justify-between flex-wrap gap-2">
            <h6>Daftar Quotation</h6>
            <div className="flex items-center gap-2">
              <div className="srch">
                <Search className="w-3.5 h-3.5" />
                <input
                  placeholder="Cari ID, Perusahaan, Customer..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="btn-refresh" onClick={onRefresh} title="Refresh data">
                <RotateCw className="w-3.5 h-3.5" /> Refresh
              </button>
              <button
                className="btn-primary-sm bg-purple-700 hover:bg-purple-800"
                onClick={handleOpenNewSuratPenawaran}
              >
                <FileText className="w-4 h-4" /> Surat Penawaran PDF
              </button>
            </div>
          </div>

          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>ID Quotation</th>
                  <th>Tanggal</th>
                  <th>Customer</th>
                  <th>Perusahaan</th>
                  <th style={{ minWidth: 200 }}>Nama Barang</th>
                  <th className="text-center" style={{ width: 50 }}>Qty</th>
                  <th>UOM</th>
                  <th className="text-right">Total Harga</th>
                  <th className="text-right">Grand Total</th>
                  <th>Mode PPN</th>
                  <th>Status</th>
                  <th>File</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="empty-state">
                      Belum ada data Quotation
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr key={i} className="cursor-pointer" onClick={() => onInspect(r)}>
                      <td className="text-cyan-600 font-bold text-xs whitespace-nowrap">{r['ID Quotation']}</td>
                      <td className="whitespace-nowrap">{fmtDate(r['Tanggal'])}</td>
                      <td>{r['Nama Customer']}</td>
                      <td className="font-semibold">{r['Nama Perusahaan']}</td>
                      <td className="max-w-[260px] whitespace-normal break-words">{r['Nama Barang']}</td>
                      <td className="text-center font-bold">{r['Qty']}</td>
                      <td>{r['Uom']}</td>
                      <td className="text-right whitespace-nowrap">{fmtRp(r['Total Harga'])}</td>
                      <td className="text-right whitespace-nowrap font-extrabold text-blue-700">{fmtRp(r['Grand Total + (PPN 11%)'])}</td>
                      <td>
                        <span className="bdg bdg-def">{r['Mode PPN'] || 'PPN 11%'}</span>
                      </td>
                      <td>
                        <span className={`bdg ${r['Status'] === 'DEAL' ? 'bdg-ok' : r['Status'] === 'CANCEL' ? 'bdg-err' : 'bdg-warn'}`}>
                          {r['Status']}
                        </span>
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        {r['File'] ? (
                          <a href={r['File']} target="_blank" rel="noreferrer" className="cell-link">
                            <Download className="w-3 h-3" /> File
                          </a>
                        ) : '—'}
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <button className="btn-act edit" onClick={() => {
                            setEditingRecord(r);
                            setNoSurat(r['ID Quotation']);
                            setTanggal(r['Tanggal']);
                            setNamaCustomer(r['Nama Customer']);
                            setNamaPerusahaan(r['Nama Perusahaan']);
                            setStatus(r['Status'] || 'QUOTATION');
                            setIsSuratPenawaranOpen(true);
                          }}>
                            <Edit className="w-3 h-3" /> Edit
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

      {/* Modal Surat Penawaran Generator */}
      {isSuratPenawaranOpen && (
        <div className="modal-backdrop open">
          <div className="modal-box max-w-5xl w-[96vw]">
            <div className="modal-hd bg-blue-50">
              <div>
                <h5 className="text-slate-900 font-bold">Buat Surat Penawaran (Quotation)</h5>
                <p className="text-xs text-slate-500">PT. BERKATAMA MULIA SAPUTRA &mdash; Penawaran Resmi</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={handlePreviewPDF} className="btn-refresh text-blue-600 border-blue-200 bg-blue-50">
                  <Printer className="w-3.5 h-3.5" /> Preview PDF
                </button>
                <button className="modal-close" onClick={() => setIsSuratPenawaranOpen(false)}>&times;</button>
              </div>
            </div>

            <form onSubmit={handleSaveQuotation}>
              <div className="modal-body max-h-[82vh] overflow-y-auto p-4">
                <div className="form-grid mb-4">
                  <div className="form-group">
                    <label className="form-lbl">Nomor Quotation *</label>
                    <input className="form-ctrl" value={noSurat} onChange={e => setNoSurat(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-lbl">Tanggal *</label>
                    <input className="form-ctrl" type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-lbl">Nama Perusahaan / PT *</label>
                    <input className="form-ctrl" value={namaPerusahaan} onChange={e => setNamaPerusahaan(e.target.value)} placeholder="PT. / CV..." required />
                  </div>
                  <div className="form-group">
                    <label className="form-lbl">Kepada Yth. (PIC Customer)</label>
                    <input className="form-ctrl" value={namaCustomer} onChange={e => setNamaCustomer(e.target.value)} placeholder="Bpk. / Ibu / Contact Person..." />
                  </div>
                </div>

                {/* Items Table */}
                <div className="mb-4 border border-slate-200 rounded-xl overflow-hidden">
                  <div className="p-3 bg-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Item Penawaran</span>
                    <button type="button" onClick={handleAddItem} className="btn-act edit flex items-center gap-1">
                      <PlusCircle className="w-3.5 h-3.5" /> Tambah Baris
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="tbl text-xs">
                      <thead>
                        <tr>
                          <th className="min-w-[180px]">Nama Item</th>
                          <th className="w-24 text-center">Gambar URL</th>
                          <th className="w-16 text-center">Qty</th>
                          <th className="w-16 text-center">Satuan</th>
                          <th className="w-28 text-right">Harga Modal</th>
                          <th className="w-24 text-center bg-amber-100 text-amber-900" title="Cost Ratio (e.g. 0.8 -> Harga Jual = Modal / 0.8)">Ratio</th>
                          <th className="w-32 text-right bg-blue-100 text-blue-900">Harga Jual</th>
                          <th className="w-32 text-right">Total</th>
                          <th className="w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {spItems.map((item, idx) => {
                          const hargaEfektif = item.hargaModal > 0 ? spHargaJual(item.hargaModal, item.profit) : (item.hargaSatuan || 0);
                          const untung = item.hargaModal > 0 ? spKeuntungan(item.hargaModal, item.profit) : 0;
                          const margin = item.hargaModal > 0 ? spMarginPct(item.hargaModal, item.profit) : 0;

                          return (
                            <tr key={item.id}>
                              <td>
                                <input className="form-ctrl" value={item.namaItem} onChange={e => handleItemChange(item.id, 'namaItem', e.target.value)} placeholder="Nama item..." required />
                              </td>
                              <td>
                                <input className="form-ctrl text-xs" value={item.gambar || ''} onChange={e => handleItemChange(item.id, 'gambar', e.target.value)} placeholder="https://..." />
                              </td>
                              <td>
                                <input className="form-ctrl text-center" type="number" min="1" value={item.jumlah} onChange={e => handleItemChange(item.id, 'jumlah', Number(e.target.value) || 1)} />
                              </td>
                              <td>
                                <input className="form-ctrl text-center" value={item.satuan} onChange={e => handleItemChange(item.id, 'satuan', e.target.value)} placeholder="pcs" />
                              </td>
                              <td>
                                <input className="form-ctrl text-right" type="number" value={item.hargaModal || ''} onChange={e => handleItemChange(item.id, 'hargaModal', Number(e.target.value) || 0)} placeholder="0" />
                              </td>
                              <td className="bg-amber-50">
                                <input className="form-ctrl text-center bg-amber-50 border-amber-300 font-semibold text-amber-900" type="number" step="0.01" min="0.01" max="1" value={item.profit || ''} onChange={e => handleItemChange(item.id, 'profit', Number(e.target.value) || 0.8)} title="Cost Ratio (e.g. 0.8 = Margin 20%)" />
                                <div className="text-[9px] text-amber-800 text-center mt-0.5">
                                  {item.hargaModal > 0 && item.profit > 0 ? `+${fmtRp(untung)} (${margin.toFixed(1)}%)` : 'ratio'}
                                </div>
                              </td>
                              <td className="bg-blue-50">
                                <input className="form-ctrl text-right bg-blue-50 border-blue-300 font-extrabold text-blue-900" type="number" value={Math.round(hargaEfektif)} onChange={e => handleItemChange(item.id, 'hargaSatuan', Number(e.target.value) || 0)} />
                              </td>
                              <td className="text-right font-bold text-slate-900 whitespace-nowrap">
                                {fmtRp(item.jumlah * hargaEfektif)}
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

                {/* Footer Totals & Notes */}
                <div className="flex gap-4 flex-wrap items-start">
                  <div className="flex-1 min-w-[240px]">
                    <label className="form-lbl">Catatan & Syarat Penawaran</label>
                    <textarea className="form-ctrl text-xs" value={catatan} onChange={e => setCatatan(e.target.value)} rows={5} />
                  </div>

                  <div className="w-72 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Sub Total:</span>
                      <strong className="text-slate-900">{fmtRp(subTotal)}</strong>
                    </div>

                    <div className="flex justify-between items-center gap-2">
                      <span className="text-slate-600">Mode PPN:</span>
                      <select className="form-ctrl text-xs py-1 h-7 w-28" value={ppnMode} onChange={e => setPpnMode(e.target.value as any)}>
                        <option value="11">PPN 11%</option>
                        <option value="12">PPN 12%</option>
                        <option value="0">Tanpa PPN</option>
                      </select>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>Nilai Pajak:</span>
                      <span>{fmtRp(pajak)}</span>
                    </div>

                    <div className="flex justify-between items-center gap-2">
                      <span className="text-slate-600">Lain-lain:</span>
                      <input className="form-ctrl text-xs text-right py-1 h-7 w-28" type="number" value={lainLain} onChange={e => setLainLain(e.target.value)} />
                    </div>

                    <hr className="my-1 border-slate-300" />

                    <div className="flex justify-between text-sm font-extrabold text-blue-700">
                      <span>Grand Total:</span>
                      <span>{fmtRp(grandTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-ft">
                <button type="button" onClick={() => setIsSuratPenawaranOpen(false)} className="px-4 py-2 text-xs font-semibold border rounded-lg">Batal</button>
                <button type="submit" className="btn-primary-sm bg-blue-700">Simpan & Export PDF</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
