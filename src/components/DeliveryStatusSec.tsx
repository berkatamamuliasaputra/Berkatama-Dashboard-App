import React, { useState } from 'react';
import { Search, RotateCw, Plus, Download, Edit, Trash2, Printer, FileText } from 'lucide-react';
import { DeliveryStatus, SuratJalanItem } from '../types';
import { fmtDate } from '../utils/formatters';
import { printSuratJalanPDF } from '../utils/pdfGenerators';

interface DeliveryStatusSecProps {
  data: DeliveryStatus[];
  onRefresh: () => void;
  onSave: (record: DeliveryStatus, isEdit: boolean) => void;
  onDelete: (record: DeliveryStatus) => void;
  onInspect: (record: DeliveryStatus) => void;
}

export const DeliveryStatusSec: React.FC<DeliveryStatusSecProps> = ({
  data,
  onRefresh,
  onSave,
  onDelete,
  onInspect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DeliveryStatus | null>(null);

  const [tanggal, setTanggal] = useState('');
  const [noSuratJalan, setNoSuratJalan] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [alamatCustomer, setAlamatCustomer] = useState('');
  const [sendingItem, setSendingItem] = useState('');
  const [noPo, setNoPo] = useState('');
  const [manPower, setManPower] = useState('');
  const [status, setStatus] = useState('PROSES KIRIM');
  const [suratJalan, setSuratJalan] = useState('');
  const [items, setItems] = useState<SuratJalanItem[]>([
    { id: 1, banyaknya: '1 Unit', namaBarang: '' }
  ]);

  const filtered = data.filter(r => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (r['Customer Name'] || '').toLowerCase().includes(q) ||
      (r['Sending Item'] || '').toLowerCase().includes(q) ||
      (r['No. PO'] || '').toLowerCase().includes(q) ||
      (r['No. Surat Jalan'] || '').toLowerCase().includes(q)
    );
  });

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setTanggal(new Date().toISOString().slice(0, 10));
    setNoSuratJalan(`SJ-2026-${Math.floor(100 + Math.random() * 900)}`);
    setCustomerName('');
    setAlamatCustomer('');
    setSendingItem('');
    setNoPo('');
    setManPower('');
    setStatus('PROSES KIRIM');
    setSuratJalan('');
    setItems([{ id: Date.now(), banyaknya: '1 Unit', namaBarang: '' }]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: DeliveryStatus) => {
    setEditingRecord(rec);
    setTanggal(rec['Tanggal'] || new Date().toISOString().slice(0, 10));
    setNoSuratJalan(rec['No. Surat Jalan'] || `SJ-2026-${Math.floor(100 + Math.random() * 900)}`);
    setCustomerName(rec['Customer Name'] || '');
    setAlamatCustomer(rec['Alamat Customer'] || '');
    setSendingItem(rec['Sending Item'] || '');
    setNoPo(rec['No. PO'] || '');
    setManPower(rec['Man Power'] || '');
    setStatus(rec['Status'] || 'PROSES KIRIM');
    setSuratJalan(rec['Surat Jalan'] || '');

    if (rec.itemsJson) {
      try {
        const parsed = JSON.parse(rec.itemsJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
        } else {
          setItems([{ id: Date.now(), banyaknya: '1 Unit', namaBarang: rec['Sending Item'] || '' }]);
        }
      } catch {
        setItems([{ id: Date.now(), banyaknya: '1 Unit', namaBarang: rec['Sending Item'] || '' }]);
      }
    } else {
      setItems([{ id: Date.now(), banyaknya: '1 Unit', namaBarang: rec['Sending Item'] || '' }]);
    }

    setIsModalOpen(true);
  };

  const handleAddItemRow = () => {
    setItems(prev => [
      ...prev,
      { id: Date.now() + Math.random(), banyaknya: '1 Pcs', namaBarang: '' }
    ]);
  };

  const handleRemoveItemRow = (id: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleItemChange = (id: number, field: keyof SuratJalanItem, value: any) => {
    setItems(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, [field]: value } : item);
      const summarized = updated.filter(i => i.namaBarang.trim()).map(i => `${i.banyaknya} ${i.namaBarang}`).join(', ');
      if (summarized && (!sendingItem || sendingItem === '')) {
        setSendingItem(summarized);
      }
      return updated;
    });
  };

  const handlePrintPDF = (rec?: DeliveryStatus) => {
    if (rec) {
      let parsedItems: SuratJalanItem[] = [];
      if (rec.itemsJson) {
        try {
          parsedItems = JSON.parse(rec.itemsJson);
        } catch {
          parsedItems = [];
        }
      }
      if (!parsedItems || parsedItems.length === 0) {
        parsedItems = [{ id: 1, banyaknya: '1 Lot', namaBarang: rec['Sending Item'] || 'Barang Pengiriman' }];
      }

      printSuratJalanPDF({
        noSuratJalan: rec['No. Surat Jalan'] || `SJ-${rec['No. PO'] || '2026-001'}`,
        noOrder: rec['No. PO'] || '-',
        tanggal: rec['Tanggal'],
        namaCustomer: rec['Customer Name'],
        alamatCustomer: rec['Alamat Customer'] || '',
        items: parsedItems
      });
    } else {
      // Print current state in modal
      printSuratJalanPDF({
        noSuratJalan: noSuratJalan || 'SJ-2026-001',
        noOrder: noPo || '-',
        tanggal: tanggal || new Date().toISOString().slice(0, 10),
        namaCustomer: customerName || 'NAMA CUSTOMER',
        alamatCustomer: alamatCustomer || '',
        items: items
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validItems = items.filter(i => i.namaBarang.trim() !== '');
    const finalSendingItem = sendingItem || validItems.map(i => `${i.banyaknya} ${i.namaBarang}`).join(', ') || 'Pengiriman Material';

    const record: DeliveryStatus = {
      _rowIndex: editingRecord?._rowIndex,
      'Tanggal': tanggal,
      'No. Surat Jalan': noSuratJalan,
      'Customer Name': customerName,
      'Alamat Customer': alamatCustomer,
      'Sending Item': finalSendingItem,
      'No. PO': noPo,
      'Man Power': manPower,
      'Status': status,
      'Surat Jalan': suratJalan,
      'itemsJson': JSON.stringify(validItems.length > 0 ? validItems : items)
    };

    onSave(record, !!editingRecord);
    setIsModalOpen(false);
  };

  return (
    <div id="sec-status" className="section active">
      <div className="pg-hd">
        <h4>Delivery Status & Surat Jalan</h4>
        <p>{data.length} total records pengiriman tersimpan</p>
      </div>

      <div className="content flex-fill">
        <div className="data-card">
          <div className="data-hd flex items-center justify-between flex-wrap gap-2">
            <h6>Daftar Status Pengiriman & Surat Jalan</h6>
            <div className="flex items-center gap-2">
              <div className="srch">
                <Search className="w-3.5 h-3.5" />
                <input
                  placeholder="Cari customer, item, PO, No SJ..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="btn-refresh" onClick={onRefresh} title="Refresh data">
                <RotateCw className="w-3.5 h-3.5" /> Refresh
              </button>
              <button className="btn-primary-sm" onClick={handleOpenAdd}>
                <Plus className="w-4 h-4" /> Buat Surat Jalan
              </button>
            </div>
          </div>

          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>No. Surat Jalan</th>
                  <th>Customer</th>
                  <th style={{ minWidth: 200 }}>Sending Item</th>
                  <th>No. PO</th>
                  <th>Driver / Courier</th>
                  <th>Status</th>
                  <th>PDF Surat Jalan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="empty-state">
                      Belum ada data pengiriman
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr key={i} className="cursor-pointer" onClick={() => onInspect(r)}>
                      <td className="whitespace-nowrap">{fmtDate(r['Tanggal'])}</td>
                      <td className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                        {r['No. Surat Jalan'] || '—'}
                      </td>
                      <td className="font-semibold">{r['Customer Name']}</td>
                      <td className="max-w-[260px] whitespace-normal break-words">{r['Sending Item']}</td>
                      <td className="text-xs text-slate-600 dark:text-slate-400">{r['No. PO']}</td>
                      <td>{r['Man Power']}</td>
                      <td>
                        <span className={`bdg ${r['Status'] === 'SELESAI' ? 'bdg-ok' : 'bdg-warn'}`}>
                          {r['Status']}
                        </span>
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handlePrintPDF(r)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50 rounded-md text-xs font-bold hover:bg-blue-100 transition-colors"
                            title="Generate & Cetak PDF Surat Jalan"
                          >
                            <Printer className="w-3.5 h-3.5" /> Cetak SJ
                          </button>
                          {r['Surat Jalan'] && (
                            <a href={r['Surat Jalan']} target="_blank" rel="noreferrer" className="cell-link text-xs">
                              <Download className="w-3 h-3" /> Link
                            </a>
                          )}
                        </div>
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

      {/* Modal Input / Edit Surat Jalan */}
      {isModalOpen && (
        <div className="modal-backdrop open">
          <div className="modal-box w-[96vw] max-w-lg sm:max-w-xl md:max-w-2xl">
            <div className="modal-hd flex items-center justify-between py-2.5 px-3 sm:px-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <h5 className="font-bold text-xs sm:text-sm">
                  {editingRecord ? 'Edit Delivery Status & Surat Jalan' : 'Form Input Surat Jalan Baru'}
                </h5>
              </div>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-3 max-h-[78vh] overflow-y-auto p-2.5 sm:p-4">
                {/* Information Header Block */}
                <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="form-lbl">No. Surat Jalan *</label>
                      <input
                        className="form-ctrl font-mono font-bold"
                        value={noSuratJalan}
                        onChange={e => setNoSuratJalan(e.target.value)}
                        placeholder="SJ-2026-001"
                        required
                      />
                    </div>

                    <div>
                      <label className="form-lbl">Tanggal *</label>
                      <input
                        className="form-ctrl"
                        type="date"
                        value={tanggal}
                        onChange={e => setTanggal(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="form-lbl">Status Pengiriman *</label>
                      <select className="form-ctrl font-semibold" value={status} onChange={e => setStatus(e.target.value)}>
                        <option value="PROSES KIRIM">PROSES KIRIM</option>
                        <option value="SELESAI">SELESAI</option>
                        <option value="PENDING">PENDING</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Customer & Order Block */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="form-lbl">Kepada Yth. (Customer Name) *</label>
                    <input
                      className="form-ctrl font-semibold"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="PT. Sinar Jaya Abadi..."
                      required
                    />
                  </div>

                  <div>
                    <label className="form-lbl">No. Order / No. PO</label>
                    <input
                      className="form-ctrl font-mono"
                      value={noPo}
                      onChange={e => setNoPo(e.target.value)}
                      placeholder="PO-2026-081..."
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="form-lbl">Alamat Customer / Alamat Kirim</label>
                    <input
                      className="form-ctrl"
                      value={alamatCustomer}
                      onChange={e => setAlamatCustomer(e.target.value)}
                      placeholder="Dsn. Industri RT 02 RW 01, Krian - Sidoarjo..."
                    />
                  </div>

                  <div>
                    <label className="form-lbl">Man Power / Driver / Kurir</label>
                    <input
                      className="form-ctrl"
                      value={manPower}
                      onChange={e => setManPower(e.target.value)}
                      placeholder="Budi (Sopir / Driver)..."
                    />
                  </div>

                  <div>
                    <label className="form-lbl">Link Dokumen Surat Jalan (Opsional)</label>
                    <input
                      className="form-ctrl text-xs"
                      value={suratJalan}
                      onChange={e => setSuratJalan(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {/* Surat Jalan Items Table */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="form-lbl text-[11px] uppercase font-extrabold text-blue-600 dark:text-blue-400 tracking-wider">
                      📋 Daftar Barang (Tabel Surat Jalan)
                    </label>
                    <button
                      type="button"
                      onClick={handleAddItemRow}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Baris
                    </button>
                  </div>

                  <div className="border rounded-lg overflow-x-auto border-slate-200 dark:border-slate-800">
                    <table className="w-full text-xs min-w-[340px]">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="p-1.5 text-center w-8">No</th>
                          <th className="p-1.5 text-left w-28 sm:w-32">Banyaknya</th>
                          <th className="p-1.5 text-left">Nama Barang / Spesifikasi</th>
                          <th className="p-1.5 text-center w-10">Hapus</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {items.map((item, idx) => (
                          <tr key={item.id} className="bg-white dark:bg-slate-900">
                            <td className="p-1 text-center font-semibold text-slate-500 text-[11px]">{idx + 1}</td>
                            <td className="p-1">
                              <input
                                className="w-full px-1.5 py-1 text-xs border rounded dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-bold"
                                value={item.banyaknya}
                                onChange={e => handleItemChange(item.id, 'banyaknya', e.target.value)}
                                placeholder="10 Pcs"
                              />
                            </td>
                            <td className="p-1">
                              <input
                                className="w-full px-1.5 py-1 text-xs border rounded dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-medium"
                                value={item.namaBarang}
                                onChange={e => handleItemChange(item.id, 'namaBarang', e.target.value)}
                                placeholder="Nama barang..."
                              />
                            </td>
                            <td className="p-1 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItemRow(item.id)}
                                disabled={items.length <= 1}
                                className="text-red-500 hover:text-red-700 disabled:opacity-30 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5 mx-auto" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <label className="form-lbl">Ringkasan Item Utama (Sending Item)</label>
                  <input
                    className="form-ctrl text-xs"
                    value={sendingItem}
                    onChange={e => setSendingItem(e.target.value)}
                    placeholder="Otomatis dari daftar barang atau tulis manual..."
                  />
                </div>
              </div>

              <div className="modal-ft py-2 px-3 sm:px-4 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintPDF()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700 rounded-lg transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> Preview PDF Surat Jalan
                </button>

                <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 text-xs font-semibold border rounded-lg">
                    Batal
                  </button>
                  <button type="submit" className="btn-primary-sm py-1.5">
                    Simpan Data
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

