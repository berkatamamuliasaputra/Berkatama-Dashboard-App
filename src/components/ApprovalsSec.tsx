import React, { useState } from 'react';
import { Search, RotateCw, CheckCircle2, XCircle, Clock, CheckSquare, Plus } from 'lucide-react';
import { Approval } from '../types';
import { fmtRp, fmtDate } from '../utils/formatters';

interface ApprovalsSecProps {
  data: Approval[];
  onRefresh: () => void;
  onApprove: (record: Approval, approver: string) => void;
  onReject: (record: Approval, rejecter: string, note: string) => void;
  onCreateRequest: (req: Partial<Approval>) => void;
  currentUser: any;
}

export const ApprovalsSec: React.FC<ApprovalsSecProps> = ({
  data,
  onRefresh,
  onApprove,
  onReject,
  onCreateRequest,
  currentUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Dialog State
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [catatan, setCatatan] = useState('');

  // Create Request Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [modul, setModul] = useState('Purchase Order');
  const [dataId, setDataId] = useState('');
  const [customer, setCustomer] = useState('');
  const [nominal, setNominal] = useState<number | string>('');
  const [keterangan, setKeterangan] = useState('');

  const filtered = data.filter(r => {
    if (statusFilter !== 'ALL' && r.Status !== statusFilter) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (r['ID Approval'] || '').toLowerCase().includes(q) ||
      (r['Data ID'] || '').toLowerCase().includes(q) ||
      (r['Customer'] || '').toLowerCase().includes(q) ||
      (r['Pemohon'] || '').toLowerCase().includes(q)
    );
  });

  const pendingCount = data.filter(d => d.Status === 'Menunggu').length;
  const approvedCount = data.filter(d => d.Status === 'Disetujui').length;
  const rejectedCount = data.filter(d => d.Status === 'Ditolak').length;

  const handleOpenAction = (approval: Approval, type: 'APPROVE' | 'REJECT') => {
    setSelectedApproval(approval);
    setActionType(type);
    setCatatan('');
  };

  const handleExecuteAction = () => {
    if (!selectedApproval || !actionType) return;
    const approverName = currentUser?.name || currentUser?.username || 'Manager / Admin';

    if (actionType === 'APPROVE') {
      onApprove(selectedApproval, approverName);
    } else {
      onReject(selectedApproval, approverName, catatan);
    }

    setSelectedApproval(null);
    setActionType(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateRequest({
      Modul: modul,
      'Data ID': dataId,
      Customer: customer,
      Nominal: Number(nominal) || 0,
      Keterangan: keterangan,
      Pemohon: currentUser?.name || currentUser?.username || 'Staff'
    });
    setIsCreateOpen(false);
  };

  return (
    <div id="sec-approvals" className="section active">
      <div className="pg-hd flex justify-between items-start flex-wrap gap-2">
        <div>
          <h4>Approval System Workflow</h4>
          <p>Kelola dan setujui pengajuan PO, PR, dan Quotation bernilai tinggi</p>
        </div>
        <button
          className="btn-primary-sm bg-amber-600 hover:bg-amber-700"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="w-4 h-4" /> Ajukan Approval
        </button>
      </div>

      <div className="content flex-fill">
        {/* Metric Cards */}
        <div className="row g-3 mb-3">
          <div className="col-md-4">
            <div
              className={`stat-card cursor-pointer p-3.5 ${statusFilter === 'Menunggu' ? 'ring-2 ring-amber-500' : ''}`}
              onClick={() => setStatusFilter(statusFilter === 'Menunggu' ? 'ALL' : 'Menunggu')}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-500">Menunggu Persetujuan</div>
                  <div className="text-2xl font-black text-amber-600">{pendingCount}</div>
                </div>
                <Clock className="w-8 h-8 text-amber-500/30" />
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div
              className={`stat-card cursor-pointer p-3.5 ${statusFilter === 'Disetujui' ? 'ring-2 ring-emerald-500' : ''}`}
              onClick={() => setStatusFilter(statusFilter === 'Disetujui' ? 'ALL' : 'Disetujui')}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-500">Disetujui</div>
                  <div className="text-2xl font-black text-emerald-600">{approvedCount}</div>
                </div>
                <CheckCircle2 className="w-8 h-8 text-emerald-500/30" />
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div
              className={`stat-card cursor-pointer p-3.5 ${statusFilter === 'Ditolak' ? 'ring-2 ring-rose-500' : ''}`}
              onClick={() => setStatusFilter(statusFilter === 'Ditolak' ? 'ALL' : 'Ditolak')}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-500">Ditolak</div>
                  <div className="text-2xl font-black text-rose-600">{rejectedCount}</div>
                </div>
                <XCircle className="w-8 h-8 text-rose-500/30" />
              </div>
            </div>
          </div>
        </div>

        {/* Data Card Table */}
        <div className="data-card">
          <div className="data-hd flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h6>Daftar Pengajuan Approval</h6>
              <div className="flex gap-1 ml-2">
                {['ALL', 'Menunggu', 'Disetujui', 'Ditolak'].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border transition-all ${
                      statusFilter === st
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'ALL' ? 'Semua' : st}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="srch">
                <Search className="w-3.5 h-3.5" />
                <input
                  placeholder="Cari ID, customer, pemohon..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="btn-refresh" onClick={onRefresh} title="Refresh data">
                <RotateCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>
          </div>

          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>ID Approval</th>
                  <th>Tanggal</th>
                  <th>Modul</th>
                  <th>Data ID</th>
                  <th>Pemohon</th>
                  <th>Customer</th>
                  <th className="text-right">Nominal</th>
                  <th style={{ minWidth: 200 }}>Keterangan</th>
                  <th>Status</th>
                  <th>Approved/Rejected By</th>
                  <th>Catatan</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="empty-state">
                      Tidak ada pengajuan approval yang sesuai
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr key={i}>
                      <td className="text-amber-600 font-bold text-xs whitespace-nowrap">{r['ID Approval']}</td>
                      <td className="whitespace-nowrap">{fmtDate(r['Tanggal'])}</td>
                      <td>
                        <span className="bdg bdg-def">{r['Modul']}</span>
                      </td>
                      <td className="font-bold text-blue-700">{r['Data ID']}</td>
                      <td>{r['Pemohon']}</td>
                      <td className="font-semibold">{r['Customer']}</td>
                      <td className="text-right font-bold text-emerald-700 whitespace-nowrap">{fmtRp(r['Nominal'])}</td>
                      <td className="max-w-[220px] whitespace-normal text-xs text-slate-600">{r['Keterangan']}</td>
                      <td>
                        <span
                          className={`bdg ${
                            r.Status === 'Disetujui'
                              ? 'bdg-ok'
                              : r.Status === 'Ditolak'
                              ? 'bdg-err'
                              : 'bdg-warn animate-pulse'
                          }`}
                        >
                          {r.Status}
                        </span>
                      </td>
                      <td className="text-xs">{r['Approved By'] || '—'}</td>
                      <td className="text-xs text-slate-500 italic max-w-[150px] truncate">{r['Catatan'] || '—'}</td>
                      <td className="text-center">
                        {r.Status === 'Menunggu' ? (
                          <div className="flex gap-1 justify-center">
                            <button
                              className="btn-act edit text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                              onClick={() => handleOpenAction(r, 'APPROVE')}
                            >
                              <CheckCircle2 className="w-3 h-3" /> Setujui
                            </button>
                            <button
                              className="btn-act del text-rose-700 border-rose-300 hover:bg-rose-100"
                              onClick={() => handleOpenAction(r, 'REJECT')}
                            >
                              <XCircle className="w-3 h-3" /> Tolak
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-semibold">Selesai</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Approve/Reject Action Dialog */}
      {selectedApproval && actionType && (
        <div className="modal-backdrop open">
          <div className="modal-box max-w-md">
            <div className={`modal-hd ${actionType === 'APPROVE' ? 'bg-emerald-50' : 'bg-rose-50'}`}>
              <h5 className={actionType === 'APPROVE' ? 'text-emerald-800' : 'text-rose-800'}>
                {actionType === 'APPROVE' ? 'Setujui Pengajuan' : 'Tolak Pengajuan'}
              </h5>
              <button className="modal-close" onClick={() => setSelectedApproval(null)}>&times;</button>
            </div>
            <div className="modal-body space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <div>Pengajuan: <strong>{selectedApproval['ID Approval']}</strong></div>
                <div>Modul: <strong>{selectedApproval['Modul']} ({selectedApproval['Data ID']})</strong></div>
                <div>Customer: <strong>{selectedApproval['Customer']}</strong></div>
                <div>Nominal: <strong className="text-emerald-700">{fmtRp(selectedApproval['Nominal'])}</strong></div>
              </div>

              {actionType === 'REJECT' && (
                <div className="form-group">
                  <label className="form-lbl">Alasan Penolakan / Catatan *</label>
                  <textarea
                    className="form-ctrl text-xs"
                    rows={3}
                    value={catatan}
                    onChange={e => setCatatan(e.target.value)}
                    placeholder="Tulis alasan penolakan..."
                    required
                  />
                </div>
              )}
            </div>
            <div className="modal-ft">
              <button className="px-3 py-1.5 text-xs font-semibold border rounded-lg" onClick={() => setSelectedApproval(null)}>Batal</button>
              <button
                className={`btn-primary-sm ${actionType === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
                onClick={handleExecuteAction}
              >
                {actionType === 'APPROVE' ? 'Ya, Setujui' : 'Ya, Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Request Modal */}
      {isCreateOpen && (
        <div className="modal-backdrop open">
          <div className="modal-box max-w-lg">
            <div className="modal-hd">
              <h5>Buat Pengajuan Approval Baru</h5>
              <button className="modal-close" onClick={() => setIsCreateOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-lbl">Modul *</label>
                    <select className="form-ctrl text-xs" value={modul} onChange={e => setModul(e.target.value)}>
                      <option value="Purchase Order">Purchase Order</option>
                      <option value="Purchase Request">Purchase Request</option>
                      <option value="Quotation">Quotation</option>
                      <option value="Invoice">Invoice</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-lbl">Data ID (PO / PR / QT) *</label>
                    <input className="form-ctrl text-xs" value={dataId} onChange={e => setDataId(e.target.value)} placeholder="PO-2026..." required />
                  </div>
                  <div className="form-group span2">
                    <label className="form-lbl">Nama Customer / PT *</label>
                    <input className="form-ctrl text-xs" value={customer} onChange={e => setCustomer(e.target.value)} placeholder="PT. ..." required />
                  </div>
                  <div className="form-group span2">
                    <label className="form-lbl">Nominal Transaksi (Rp)</label>
                    <input className="form-ctrl text-xs" type="number" value={nominal} onChange={e => setNominal(e.target.value)} placeholder="0" />
                  </div>
                  <div className="form-group span2">
                    <label className="form-lbl">Keterangan / Alasan Pengajuan *</label>
                    <textarea className="form-ctrl text-xs" rows={3} value={keterangan} onChange={e => setKeterangan(e.target.value)} placeholder="Alasan butuh approval manager..." required />
                  </div>
                </div>
              </div>
              <div className="modal-ft">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-xs font-semibold border rounded-lg">Batal</button>
                <button type="submit" className="btn-primary-sm bg-amber-600">Kirim Pengajuan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
