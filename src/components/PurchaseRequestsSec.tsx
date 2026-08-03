import React, { useState } from 'react';
import { Search, RotateCw, Plus, Download, Edit, Trash2, FileText, ExternalLink } from 'lucide-react';
import { PurchaseRequest } from '../types';
import { fmtRp, fmtDate, parseIDNumber } from '../utils/formatters';

interface PurchaseRequestsSecProps {
  data: PurchaseRequest[];
  onRefresh: () => void;
  onSave: (record: PurchaseRequest, isEdit: boolean) => void;
  onDelete: (record: PurchaseRequest) => void;
  onInspect: (record: PurchaseRequest) => void;
}

export const PurchaseRequestsSec: React.FC<PurchaseRequestsSecProps> = ({
  data,
  onRefresh,
  onSave,
  onDelete,
  onInspect
}) => {
  const [searchTerm, setSearchSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PurchaseRequest | null>(null);

  // Form state
  const [idRequest, setIdRequest] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [namaCustomer, setNamaCustomer] = useState('');
  const [namaItem, setNamaItem] = useState('');
  const [qty, setQty] = useState<number | string>(1);
  const [uom, setUom] = useState('PCS');
  const [spesifikasi, setSpesifikasi] = useState('');
  const [hargaBeli, setHargaBeli] = useState<number | string>('');
  const [hargaJual, setHargaJual] = useState<number | string>('');
  const [onlineShopLink, setOnlineShopLink] = useState('');
  const [pmtMode, setPmtMode] = useState('KREDIT');
  const [fileUrl, setFileUrl] = useState('');

  // Auto-calculated fields
  const qtyNum = parseIDNumber(qty);
  const hBeliNum = parseIDNumber(hargaBeli);
  const hJualNum = parseIDNumber(hargaJual);
  const totalBeli = qtyNum * hBeliNum;
  const totalJual = qtyNum * hJualNum;
  const ppn11 = totalJual * 0.11;
  const ppn12 = totalJual * 0.12;
  const dppPpn11 = totalJual + ppn11;

  const filtered = data.filter(r => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (r['ID Request'] || '').toLowerCase().includes(q) ||
      (r['Nama Customer'] || '').toLowerCase().includes(q) ||
      (r['Nama Item'] || '').toLowerCase().includes(q)
    );
  });

  const handleOpenAdd = () => {
    setEditingRecord(null);
    const dateStr = new Date().toISOString().slice(0, 10);
    const nextSeq = data.length + 1;
    const autoId = `PR-${dateStr.replace(/-/g, '')}-${String(nextSeq).padStart(3, '0')}`;

    setIdRequest(autoId);
    setTanggal(dateStr);
    setNamaCustomer('');
    setNamaItem('');
    setQty(1);
    setUom('PCS');
    setSpesifikasi('');
    setHargaBeli('');
    setHargaJual('');
    setOnlineShopLink('');
    setPmtMode('KREDIT');
    setFileUrl('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: PurchaseRequest) => {
    setEditingRecord(rec);
    setIdRequest(rec['ID Request']);
    setTanggal(rec['Tanggal']);
    setNamaCustomer(rec['Nama Customer']);
    setNamaItem(rec['Nama Item']);
    setQty(rec['Qty']);
    setUom(rec['Uom'] || 'PCS');
    setSpesifikasi(rec['Spesifikasi'] || '');
    setHargaBeli(rec['Harga Beli']);
    setHargaJual(rec['Harga Jual']);
    setOnlineShopLink(rec['Online Shop Link'] || '');
    setPmtMode(rec['PMT Mode'] || 'KREDIT');
    setFileUrl(rec['File'] || '');
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFileUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const record: PurchaseRequest = {
      _rowIndex: editingRecord?._rowIndex,
      'ID Request': idRequest,
      'Tanggal': tanggal,
      'Nama Customer': namaCustomer,
      'Nama Item': namaItem,
      'Qty': qtyNum,
      'Uom': uom,
      'Spesifikasi': spesifikasi,
      'Harga Beli': hBeliNum,
      'Total Harga Beli': totalBeli,
      'Harga Jual': hJualNum,
      'Total Harga Jual': totalJual,
      'PPN 11%': ppn11,
      'PPN 12%': ppn12,
      'DPP + (PPN 11%)': dppPpn11,
      'Online Shop Link': onlineShopLink,
      'PMT Mode': pmtMode,
      'File': fileUrl
    };

    onSave(record, !!editingRecord);
    setIsModalOpen(false);
  };

  return (
    <div id="sec-purchase-requests" className="section active">
      <div className="pg-hd">
        <h4>Purchase Request (RFQ)</h4>
        <p>{data.length} total records tersimpan</p>
      </div>

      <div className="content flex-fill">
        <div className="data-card">
          <div className="data-hd flex items-center justify-between flex-wrap gap-2">
            <h6>Daftar Purchase Request</h6>
            <div className="flex items-center gap-2">
              <div className="srch">
                <Search className="w-3.5 h-3.5" />
                <input
                  placeholder="Cari ID, customer, item..."
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
                  <th>ID Request</th>
                  <th>Tanggal</th>
                  <th>Customer</th>
                  <th style={{ minWidth: 200 }}>Nama Item</th>
                  <th className="text-center" style={{ width: 50 }}>Qty</th>
                  <th>UOM</th>
                  <th className="text-right">Harga Beli</th>
                  <th className="text-right">Total Beli</th>
                  <th className="text-right">Harga Jual</th>
                  <th className="text-right">Total Jual</th>
                  <th>PMT Mode</th>
                  <th>Link</th>
                  <th>File</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="empty-state">
                      Belum ada data Purchase Request
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr key={i} className="cursor-pointer" onClick={() => onInspect(r)}>
                      <td className="text-blue-600 font-bold text-xs whitespace-nowrap">{r['ID Request']}</td>
                      <td className="whitespace-nowrap">{fmtDate(r['Tanggal'])}</td>
                      <td className="font-semibold">{r['Nama Customer']}</td>
                      <td className="max-w-[260px] whitespace-normal break-words">{r['Nama Item']}</td>
                      <td className="text-center font-bold">{r['Qty']}</td>
                      <td>{r['Uom']}</td>
                      <td className="text-right whitespace-nowrap">{fmtRp(r['Harga Beli'])}</td>
                      <td className="text-right whitespace-nowrap">{fmtRp(r['Total Harga Beli'])}</td>
                      <td className="text-right whitespace-nowrap">{fmtRp(r['Harga Jual'])}</td>
                      <td className="text-right whitespace-nowrap font-bold text-emerald-600">{fmtRp(r['Total Harga Jual'])}</td>
                      <td>
                        <span className={`bdg ${r['PMT Mode'] === 'KREDIT' ? 'bdg-warn' : 'bdg-ok'}`}>
                          {r['PMT Mode']}
                        </span>
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        {r['Online Shop Link'] ? (
                          <a href={r['Online Shop Link']} target="_blank" rel="noreferrer" className="cell-link">
                            <ExternalLink className="w-3 h-3" /> Link
                          </a>
                        ) : '—'}
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
                          <button className="btn-act edit" onClick={() => handleOpenEdit(r)}>
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

      {/* Modal Form */}
      {isModalOpen && (
        <div className="modal-backdrop open">
          <div className="modal-box w-[96vw] max-w-lg sm:max-w-xl md:max-w-2xl">
            <div className="modal-hd">
              <h5>{editingRecord ? 'Edit Purchase Request' : 'Tambah Purchase Request'}</h5>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-lbl">ID Request</label>
                    <input className="form-ctrl" value={idRequest} readOnly />
                  </div>
                  <div className="form-group">
                    <label className="form-lbl">Tanggal *</label>
                    <input className="form-ctrl" type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} required />
                  </div>
                  <div className="form-group span2">
                    <label className="form-lbl">Nama Customer *</label>
                    <input className="form-ctrl" value={namaCustomer} onChange={e => setNamaCustomer(e.target.value)} placeholder="PT. / CV. / Bpk..." required />
                  </div>
                  <div className="form-group span2">
                    <label className="form-lbl">Nama Item *</label>
                    <input className="form-ctrl" value={namaItem} onChange={e => setNamaItem(e.target.value)} placeholder="Nama barang..." required />
                  </div>
                  <div className="form-group">
                    <label className="form-lbl">Qty *</label>
                    <input className="form-ctrl" type="number" min="0.01" step="any" value={qty} onChange={e => setQty(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-lbl">UOM / Satuan *</label>
                    <input className="form-ctrl" value={uom} onChange={e => setUom(e.target.value)} placeholder="PCS / UNIT / SET..." required />
                  </div>
                  <div className="form-group span2">
                    <label className="form-lbl">Spesifikasi / Catatan</label>
                    <textarea className="form-ctrl" value={spesifikasi} onChange={e => setSpesifikasi(e.target.value)} rows={2} placeholder="Detail spesifikasi item..." />
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
                      <div>PPN 11%: <span className="text-slate-600">{fmtRp(ppn11)}</span></div>
                      <div>PPN 12%: <span className="text-slate-600">{fmtRp(ppn12)}</span></div>
                      <div className="col-span-2">DPP + PPN 11%: <strong className="text-blue-600">{fmtRp(dppPpn11)}</strong></div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-lbl">PMT Mode</label>
                    <select className="form-ctrl" value={pmtMode} onChange={e => setPmtMode(e.target.value)}>
                      <option value="KREDIT">KREDIT</option>
                      <option value="CASH">CASH / CBD</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-lbl">Online Shop Link</label>
                    <input className="form-ctrl" value={onlineShopLink} onChange={e => setOnlineShopLink(e.target.value)} placeholder="https://..." />
                  </div>

                  <div className="form-group span2">
                    <label className="form-lbl">Unggah File PR / Dokumen</label>
                    <input type="file" onChange={handleFileUpload} className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    {fileUrl && (
                      <div className="mt-1 text-xs text-emerald-600 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" /> File terlampir
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
