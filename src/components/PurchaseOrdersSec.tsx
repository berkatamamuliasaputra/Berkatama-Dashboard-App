import React, { useState } from 'react';
import { Search, RotateCw, Plus, Download, Edit, Trash2, FileText, ExternalLink } from 'lucide-react';
import { PurchaseOrder } from '../types';
import { fmtRp, fmtDate, fmtPct, parseIDNumber } from '../utils/formatters';

interface PurchaseOrdersSecProps {
  data: PurchaseOrder[];
  onRefresh: () => void;
  onSave: (record: PurchaseOrder, isEdit: boolean) => void;
  onDelete: (record: PurchaseOrder) => void;
  onInspect: (record: PurchaseOrder) => void;
}

export const PurchaseOrdersSec: React.FC<PurchaseOrdersSecProps> = ({
  data,
  onRefresh,
  onSave,
  onDelete,
  onInspect
}) => {
  const [searchTerm, setSearchSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PurchaseOrder | null>(null);

  // Form state
  const [idOrder, setIdOrder] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [noPo, setNoPo] = useState('');
  const [namaCustomer, setNamaCustomer] = useState('');
  const [namaItem, setNamaItem] = useState('');
  const [qty, setQty] = useState<number | string>(1);
  const [uom, setUom] = useState('PCS');
  const [vendor, setVendor] = useState('');
  const [hargaBeli, setHargaBeli] = useState<number | string>('');
  const [hargaJual, setHargaJual] = useState<number | string>('');
  const [tglKirim, setTglKirim] = useState('');
  const [suratJalan, setSuratJalan] = useState('');
  const [filePo, setFilePo] = useState('');
  const [linkPembelian, setLinkPembelian] = useState('');

  // Auto-calculated fields
  const qtyNum = parseIDNumber(qty);
  const hBeliNum = parseIDNumber(hargaBeli);
  const hJualNum = parseIDNumber(hargaJual);
  const totalBeli = qtyNum * hBeliNum;
  const totalJual = qtyNum * hJualNum;
  const profitNominal = totalJual - totalBeli;
  const profitPct = totalBeli > 0 ? (profitNominal / totalBeli) * 100 : 0;
  const ppn11 = totalJual * 0.11;
  const ppn12 = totalJual * 0.12;
  const grandTotal = totalJual + ppn11;

  const filtered = data.filter(r => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (r['ID Order'] || '').toLowerCase().includes(q) ||
      (r['No PO'] || '').toLowerCase().includes(q) ||
      (r['Nama Customer'] || '').toLowerCase().includes(q) ||
      (r['Nama Item'] || '').toLowerCase().includes(q)
    );
  });

  const handleOpenAdd = () => {
    setEditingRecord(null);
    const dateStr = new Date().toISOString().slice(0, 10);
    const nextSeq = data.length + 1;
    const autoId = `PO-${dateStr.replace(/-/g, '')}-${String(nextSeq).padStart(3, '0')}`;

    setIdOrder(autoId);
    setTanggal(dateStr);
    setNoPo(`PO/BMS/VIII/26-${String(nextSeq + 80).padStart(3, '0')}`);
    setNamaCustomer('');
    setNamaItem('');
    setQty(1);
    setUom('PCS');
    setVendor('');
    setHargaBeli('');
    setHargaJual('');
    setTglKirim('');
    setSuratJalan('');
    setFilePo('');
    setLinkPembelian('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: PurchaseOrder) => {
    setEditingRecord(rec);
    setIdOrder(rec['ID Order']);
    setTanggal(rec['Tanggal']);
    setNoPo(rec['No PO']);
    setNamaCustomer(rec['Nama Customer']);
    setNamaItem(rec['Nama Item']);
    setQty(rec['Qty']);
    setUom(rec['Uom'] || 'PCS');
    setVendor(rec['Vendor/Supplier'] || '');
    setHargaBeli(rec['Harga Beli']);
    setHargaJual(rec['Harga Jual']);
    setTglKirim(rec['Tgl Kirim'] || '');
    setSuratJalan(rec['Nomor Surat Jalan'] || '');
    setFilePo(rec['File PO'] || '');
    setLinkPembelian(rec['Link Pembelian'] || '');
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFilePo(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const record: PurchaseOrder = {
      _rowIndex: editingRecord?._rowIndex,
      'ID Order': idOrder,
      'Tanggal': tanggal,
      'No PO': noPo,
      'Nama Customer': namaCustomer,
      'Nama Item': namaItem,
      'Qty': qtyNum,
      'Uom': uom,
      'Vendor/Supplier': vendor,
      'Harga Beli': hBeliNum,
      'Total Beli': totalBeli,
      'Harga Jual': hJualNum,
      'Profit': parseFloat(profitPct.toFixed(2)),
      'Total Jual': totalJual,
      'PPN 11%': ppn11,
      'PPN 12%': ppn12,
      'DPP PPH': totalJual,
      'Grand Total + (DPP + PPN11%)': grandTotal,
      'Tgl Kirim': tglKirim,
      'Nomor Surat Jalan': suratJalan,
      'File PO': filePo,
      'Link Pembelian': linkPembelian
    };

    onSave(record, !!editingRecord);
    setIsModalOpen(false);
  };

  return (
    <div id="sec-purchase-orders" className="section active">
      <div className="pg-hd">
        <h4>Purchase Order</h4>
        <p>{data.length} total records tersimpan</p>
      </div>

      <div className="content flex-fill">
        <div className="data-card">
          <div className="data-hd flex items-center justify-between flex-wrap gap-2">
            <h6>Daftar Purchase Order</h6>
            <div className="flex items-center gap-2">
              <div className="srch">
                <Search className="w-3.5 h-3.5" />
                <input
                  placeholder="Cari ID, No PO, Customer, Item..."
                  value={searchTerm}
                  onChange={e => setSearchSearchTerm(e.target.value)}
                />
              </div>
              <button className="btn-refresh" onClick={onRefresh} title="Refresh data">
                <RotateCw className="w-3.5 h-3.5" /> Refresh
              </button>
              <button className="btn-primary-sm" onClick={handleOpenAdd}>
                <Plus className="w-4 h-4" /> Tambah
              </button>
            </div>
          </div>

          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>ID Order</th>
                  <th>Tanggal</th>
                  <th>No. PO</th>
                  <th>Customer</th>
                  <th style={{ minWidth: 200 }}>Nama Item</th>
                  <th className="text-center" style={{ width: 50 }}>Qty</th>
                  <th>UOM</th>
                  <th>Vendor/Supplier</th>
                  <th className="text-right">Harga Beli</th>
                  <th className="text-right">Total Beli</th>
                  <th className="text-right">Harga Jual</th>
                  <th className="text-center">Profit</th>
                  <th className="text-right">Total Jual</th>
                  <th className="text-right">Grand Total</th>
                  <th>File PO</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={16} className="empty-state">
                      Belum ada data Purchase Order
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => {
                    const profitInfo = fmtPct(r['Profit'], r['Total Beli'], r['Total Jual']);
                    return (
                      <tr key={i} className="cursor-pointer" onClick={() => onInspect(r)}>
                        <td className="text-blue-600 font-bold text-xs whitespace-nowrap">{r['ID Order']}</td>
                        <td className="whitespace-nowrap">{fmtDate(r['Tanggal'])}</td>
                        <td className="font-semibold text-xs text-slate-700">{r['No PO']}</td>
                        <td className="font-semibold">{r['Nama Customer']}</td>
                        <td className="max-w-[260px] whitespace-normal break-words">{r['Nama Item']}</td>
                        <td className="text-center font-bold">{r['Qty']}</td>
                        <td>{r['Uom']}</td>
                        <td>{r['Vendor/Supplier']}</td>
                        <td className="text-right whitespace-nowrap">{fmtRp(r['Harga Beli'])}</td>
                        <td className="text-right whitespace-nowrap">{fmtRp(r['Total Beli'])}</td>
                        <td className="text-right whitespace-nowrap">{fmtRp(r['Harga Jual'])}</td>
                        <td className="text-center whitespace-nowrap">
                          <span className={`profit-badge ${profitInfo.isPos ? 'profit-pos' : 'profit-neg'}`}>
                            {profitInfo.text}
                          </span>
                        </td>
                        <td className="text-right whitespace-nowrap font-bold text-emerald-600">{fmtRp(r['Total Jual'])}</td>
                        <td className="text-right whitespace-nowrap font-extrabold text-blue-700">{fmtRp(r['Grand Total + (DPP + PPN11%)'])}</td>
                        <td onClick={e => e.stopPropagation()}>
                          {r['File PO'] ? (
                            <a href={r['File PO']} target="_blank" rel="noreferrer" className="cell-link">
                              <Download className="w-3 h-3" /> PO
                            </a>
                          ) : '—'}
                        </td>
                        <td onClick={e => e.stopPropagation()}>
                          <div className="flex gap-1">
                            <button className="btn-act edit" onClick={() => handleOpenEdit(r)}>
                              <Edit className="w-3 h-3" /> Edit
                            </button>
                            <button className="btn-act del" onClick={() => onDelete(r)}>
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="modal-backdrop open">
          <div className="modal-box w-[96vw] max-w-lg sm:max-w-xl md:max-w-2xl">
            <div className="modal-hd">
              <h5>{editingRecord ? 'Edit Purchase Order' : 'Tambah Purchase Order'}</h5>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-lbl">ID Order</label>
                    <input className="form-ctrl" value={idOrder} readOnly />
                  </div>
                  <div className="form-group">
                    <label className="form-lbl">Tanggal *</label>
                    <input className="form-ctrl" type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-lbl">No. PO Customer *</label>
                    <input className="form-ctrl" value={noPo} onChange={e => setNoPo(e.target.value)} placeholder="PO/BMS/..." required />
                  </div>
                  <div className="form-group">
                    <label className="form-lbl">Nama Customer *</label>
                    <input className="form-ctrl" value={namaCustomer} onChange={e => setNamaCustomer(e.target.value)} placeholder="PT. / CV..." required />
                  </div>
                  <div className="form-group span2">
                    <label className="form-lbl">Nama Item *</label>
                    <input className="form-ctrl" value={namaItem} onChange={e => setNamaItem(e.target.value)} placeholder="Barang yang dibeli..." required />
                  </div>
                  <div className="form-group">
                    <label className="form-lbl">Qty *</label>
                    <input className="form-ctrl" type="number" min="0.01" step="any" value={qty} onChange={e => setQty(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-lbl">UOM / Satuan *</label>
                    <input className="form-ctrl" value={uom} onChange={e => setUom(e.target.value)} placeholder="PCS / UNIT..." required />
                  </div>
                  <div className="form-group span2">
                    <label className="form-lbl">Vendor / Supplier</label>
                    <input className="form-ctrl" value={vendor} onChange={e => setVendor(e.target.value)} placeholder="Nama vendor penyedia barang..." />
                  </div>
                  <div className="form-group">
                    <label className="form-lbl">Harga Beli Satuan (Modal)</label>
                    <input className="form-ctrl" type="number" value={hargaBeli} onChange={e => setHargaBeli(e.target.value)} placeholder="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-lbl">Harga Jual Satuan</label>
                    <input className="form-ctrl" type="number" value={hargaJual} onChange={e => setHargaJual(e.target.value)} placeholder="0" />
                  </div>

                  {/* Summary Box */}
                  <div className="form-group span2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="text-xs font-bold text-slate-700 mb-2">Kalkulasi Otomatis:</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>Total Beli: <strong className="text-slate-900">{fmtRp(totalBeli)}</strong></div>
                      <div>Total Jual: <strong className="text-emerald-600">{fmtRp(totalJual)}</strong></div>
                      <div>Profit Nominal: <strong className={profitNominal >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{fmtRp(profitNominal)}</strong></div>
                      <div>Profit Margin: <strong className={profitPct >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{profitPct.toFixed(2)}%</strong></div>
                      <div className="col-span-2">Grand Total (+ PPN 11%): <strong className="text-blue-700">{fmtRp(grandTotal)}</strong></div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-lbl">Tgl Kirim</label>
                    <input className="form-ctrl" type="date" value={tglKirim} onChange={e => setTglKirim(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-lbl">Nomor Surat Jalan</label>
                    <input className="form-ctrl" value={suratJalan} onChange={e => setSuratJalan(e.target.value)} placeholder="SJ-..." />
                  </div>

                  <div className="form-group span2">
                    <label className="form-lbl">Unggah File PO</label>
                    <input type="file" onChange={handleFileUpload} className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    {filePo && (
                      <div className="mt-1 text-xs text-emerald-600 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" /> File PO terlampir
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-ft">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-semibold border rounded-lg">Batal</button>
                <button type="submit" className="btn-primary-sm">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
