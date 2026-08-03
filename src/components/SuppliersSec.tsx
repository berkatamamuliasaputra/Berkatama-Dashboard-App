import React, { useState } from 'react';
import { Search, RotateCw, Plus, Edit, Trash2, Building2 } from 'lucide-react';
import { Supplier } from '../types';
import { fmtRp, parseIDNumber } from '../utils/formatters';

interface SuppliersSecProps {
  data: Supplier[];
  onRefresh: () => void;
  onSave: (record: Supplier, isEdit: boolean) => void;
  onDelete: (record: Supplier) => void;
  onInspect: (record: Supplier) => void;
}

export const SuppliersSec: React.FC<SuppliersSecProps> = ({
  data,
  onRefresh,
  onSave,
  onDelete,
  onInspect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Supplier | null>(null);

  const [idSupplier, setIdSupplier] = useState('');
  const [kategori, setKategori] = useState('');
  const [namaPerusahaan, setNamaPerusahaan] = useState('');
  const [namaBarang, setNamaBarang] = useState('');
  const [hargaBarang, setHargaBarang] = useState<number | string>('');
  const [alamat, setAlamat] = useState('');
  const [pic, setPic] = useState('');
  const [noTlp, setNoTlp] = useState('');

  const filtered = data.filter(r => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (r['ID Supplier'] || '').toLowerCase().includes(q) ||
      (r['Nama Perusahaan Vendor/Supplier'] || '').toLowerCase().includes(q) ||
      (r['Kategori'] || '').toLowerCase().includes(q) ||
      (r['Nama Barang'] || '').toLowerCase().includes(q)
    );
  });

  const handleOpenAdd = () => {
    setEditingRecord(null);
    const seq = data.length + 1;
    setIdSupplier(`SUP-${String(seq).padStart(3, '0')}`);
    setKategori('Industrial Supplies');
    setNamaPerusahaan('');
    setNamaBarang('');
    setHargaBarang('');
    setAlamat('');
    setPic('');
    setNoTlp('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: Supplier) => {
    setEditingRecord(rec);
    setIdSupplier(rec['ID Supplier']);
    setKategori(rec['Kategori'] || '');
    setNamaPerusahaan(rec['Nama Perusahaan Vendor/Supplier'] || '');
    setNamaBarang(rec['Nama Barang'] || '');
    setHargaBarang(rec['Harga Barang'] || '');
    setAlamat(rec['Alamat Kantor / Toko'] || '');
    setPic(rec['PIC'] || '');
    setNoTlp(rec['No Tlp/WA'] || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const record: Supplier = {
      _rowIndex: editingRecord?._rowIndex,
      'ID Supplier': idSupplier,
      'Kategori': kategori,
      'Nama Perusahaan Vendor/Supplier': namaPerusahaan,
      'Nama Barang': namaBarang,
      'Harga Barang': parseIDNumber(hargaBarang),
      'Alamat Kantor / Toko': alamat,
      'PIC': pic,
      'No Tlp/WA': noTlp
    };
    onSave(record, !!editingRecord);
    setIsModalOpen(false);
  };

  return (
    <div id="sec-suppliers" className="section active">
      <div className="pg-hd">
        <h4>Supplier & Vendor Directory</h4>
        <p>{data.length} total records tersimpan</p>
      </div>

      <div className="content flex-fill">
        <div className="data-card">
          <div className="data-hd flex items-center justify-between flex-wrap gap-2">
            <h6>Daftar Supplier / Vendor</h6>
            <div className="flex items-center gap-2">
              <div className="srch">
                <Search className="w-3.5 h-3.5" />
                <input
                  placeholder="Cari vendor, kategori, barang..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
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
                  <th>ID Supplier</th>
                  <th>Perusahaan / Vendor</th>
                  <th>Kategori</th>
                  <th style={{ minWidth: 150 }}>Nama Barang</th>
                  <th className="text-right">Harga Barang</th>
                  <th style={{ minWidth: 150 }}>Alamat</th>
                  <th>PIC</th>
                  <th>No. Tlp/WA</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="empty-state">
                      Belum ada data supplier / vendor
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr key={i} className="cursor-pointer" onClick={() => onInspect(r)}>
                      <td className="text-blue-600 font-bold text-xs whitespace-nowrap">{r['ID Supplier']}</td>
                      <td className="font-extrabold text-slate-900">{r['Nama Perusahaan Vendor/Supplier']}</td>
                      <td>
                        <span className="bdg bdg-def">{r['Kategori']}</span>
                      </td>
                      <td className="max-w-[200px] whitespace-normal break-words">{r['Nama Barang']}</td>
                      <td className="text-right whitespace-nowrap font-semibold">{fmtRp(r['Harga Barang'])}</td>
                      <td className="max-w-[200px] whitespace-normal text-xs text-slate-600">{r['Alamat Kantor / Toko']}</td>
                      <td>{r['PIC']}</td>
                      <td className="text-xs font-mono">{r['No Tlp/WA']}</td>
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

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-backdrop open">
          <div className="modal-box w-[96vw] max-w-md sm:max-w-lg">
            <div className="modal-hd">
              <h5>{editingRecord ? 'Edit Supplier' : 'Tambah Supplier / Vendor'}</h5>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-lbl">ID Supplier</label>
                    <input className="form-ctrl" value={idSupplier} readOnly />
                  </div>
                  <div className="form-group">
                    <label className="form-lbl">Kategori *</label>
                    <input className="form-ctrl" value={kategori} onChange={e => setKategori(e.target.value)} placeholder="Kategori produk..." required />
                  </div>
                  <div className="form-group span2">
                    <label className="form-lbl">Nama Perusahaan / Vendor *</label>
                    <input className="form-ctrl" value={namaPerusahaan} onChange={e => setNamaPerusahaan(e.target.value)} placeholder="PT. / CV / Toko..." required />
                  </div>
                  <div className="form-group span2">
                    <label className="form-lbl">Nama Barang / Spesialisasi</label>
                    <input className="form-ctrl" value={namaBarang} onChange={e => setNamaBarang(e.target.value)} placeholder="Barang yang disediakan..." />
                  </div>
                  <div className="form-group">
                    <label className="form-lbl">Estimasi Harga Barang</label>
                    <input className="form-ctrl" type="number" value={hargaBarang} onChange={e => setHargaBarang(e.target.value)} placeholder="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-lbl">PIC Contact</label>
                    <input className="form-ctrl" value={pic} onChange={e => setPic(e.target.value)} placeholder="Nama PIC..." />
                  </div>
                  <div className="form-group">
                    <label className="form-lbl">No. Tlp / WA</label>
                    <input className="form-ctrl" value={noTlp} onChange={e => setNoTlp(e.target.value)} placeholder="08..." />
                  </div>
                  <div className="form-group span2">
                    <label className="form-lbl">Alamat Kantor / Toko</label>
                    <textarea className="form-ctrl" rows={2} value={alamat} onChange={e => setAlamat(e.target.value)} placeholder="Alamat lengkap..." />
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
