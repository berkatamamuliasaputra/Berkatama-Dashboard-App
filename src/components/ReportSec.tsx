import React, { useState } from 'react';
import { FileBarChart, FileSpreadsheet, Printer, RotateCw, Filter } from 'lucide-react';
import { fmtRp, fmtDate } from '../utils/formatters';

interface ReportSecProps {
  purchaseRequests: any[];
  purchaseOrders: any[];
  quotations: any[];
  invoices: any[];
  deliveryStatuses: any[];
  suppliers: any[];
}

export const ReportSec: React.FC<ReportSecProps> = ({
  purchaseRequests,
  purchaseOrders,
  quotations,
  invoices,
  deliveryStatuses,
  suppliers
}) => {
  const [selectedModule, setSelectedModule] = useState('purchase-order');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [reportData, setReportData] = useState<any[] | null>(null);

  const getSourceData = (mod: string) => {
    switch (mod) {
      case 'purchase-request': return purchaseRequests;
      case 'purchase-order': return purchaseOrders;
      case 'quotation': return quotations;
      case 'invoice': return invoices;
      case 'delivery-status': return deliveryStatuses;
      case 'supplier': return suppliers;
      default: return [];
    }
  };

  const handleGenerateReport = () => {
    const rawData = getSourceData(selectedModule);
    const dateKeys: Record<string, string | null> = {
      'purchase-request': 'Tanggal',
      'purchase-order': 'Tanggal',
      'quotation': 'Tanggal',
      'invoice': 'Tanggal Invoice',
      'delivery-status': 'Tanggal',
      'supplier': null
    };

    const dk = dateKeys[selectedModule];
    const filtered = rawData.filter(r => {
      if (!dk || (!selectedYear && !selectedMonth && !dateFrom && !dateTo)) return true;
      const val = r[dk];
      if (!val) return true;
      const dt = new Date(val);
      if (isNaN(dt.getTime())) return true;

      if (dateFrom && new Date(dateFrom) > dt) return false;
      if (dateTo && new Date(dateTo) < dt) return false;
      if (selectedYear && String(dt.getFullYear()) !== selectedYear) return false;
      if (selectedMonth && String(dt.getMonth() + 1).padStart(2, '0') !== selectedMonth) return false;
      return true;
    });

    setReportData(filtered);
  };

  const getHeaders = (mod: string) => {
    switch (mod) {
      case 'purchase-request': return ['ID Request', 'Tanggal', 'Customer', 'Nama Item', 'Qty', 'Harga Beli', 'Harga Jual', 'Total Beli', 'Total Jual', 'PMT Mode'];
      case 'purchase-order': return ['ID Order', 'Tanggal', 'Customer', 'Nama Item', 'Qty', 'Vendor', 'Harga Beli', 'Harga Jual', 'Total Beli', 'Total Jual', 'Profit %', 'No PO'];
      case 'quotation': return ['ID Quotation', 'Tanggal', 'Customer', 'Nama Barang', 'Qty', 'Harga', 'Total Harga', 'Grand Total PPN 11%', 'Status'];
      case 'invoice': return ['ID Invoice', 'Tanggal', 'Customer', 'No PO', 'Invoice Title', 'Nominal', 'Jatuh Tempo', 'Term', 'Status'];
      case 'delivery-status': return ['Tanggal', 'Customer', 'Sending Item', 'No PO', 'Man Power', 'Status'];
      case 'supplier': return ['ID Supplier', 'Perusahaan/Vendor', 'Kategori', 'Nama Barang', 'Harga', 'Alamat', 'PIC', 'No Tlp/WA'];
      default: return [];
    }
  };

  const getRowValues = (mod: string, r: any) => {
    switch (mod) {
      case 'purchase-request': return [r['ID Request'], fmtDate(r['Tanggal']), r['Nama Customer'], r['Nama Item'], r['Qty'], fmtRp(r['Harga Beli']), fmtRp(r['Harga Jual']), fmtRp(r['Total Harga Beli']), fmtRp(r['Total Harga Jual']), r['PMT Mode']];
      case 'purchase-order': return [r['ID Order'], fmtDate(r['Tanggal']), r['Nama Customer'], r['Nama Item'], r['Qty'], r['Vendor/Supplier'], fmtRp(r['Harga Beli']), fmtRp(r['Harga Jual']), fmtRp(r['Total Beli']), fmtRp(r['Total Jual']), (r['Profit'] ? `${r['Profit']}%` : '—'), r['No PO']];
      case 'quotation': return [r['ID Quotation'], fmtDate(r['Tanggal']), r['Nama Customer'], r['Nama Barang'], r['Qty'], fmtRp(r['Harga']), fmtRp(r['Total Harga']), fmtRp(r['Grand Total + (PPN 11%)']), r['Status']];
      case 'invoice': return [r['ID Invoice'], fmtDate(r['Tanggal Invoice']), r['Nama Customer'], r['Nomer PO'], r['Invoice Title'], fmtRp(r['Nominal Tagihan']), fmtDate(r['Jatuh Tempo']), r['Term of Payment'], r['Status']];
      case 'delivery-status': return [fmtDate(r['Tanggal']), r['Customer Name'], r['Sending Item'], r['No. PO'], r['Man Power'], r['Status']];
      case 'supplier': return [r['ID Supplier'], r['Nama Perusahaan Vendor/Supplier'], r['Kategori'], r['Nama Barang'], fmtRp(r['Harga Barang']), r['Alamat Kantor / Toko'], r['PIC'], r['No Tlp/WA']];
      default: return [];
    }
  };

  const exportCSV = () => {
    if (!reportData) return;
    const headers = getHeaders(selectedModule);
    const rows = [headers.join(',')];
    reportData.forEach(r => {
      const cols = getRowValues(selectedModule, r).map(c => {
        let s = String(c == null ? '' : c);
        if (s.includes(',') || s.includes('"') || s.includes('\n')) {
          s = `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      });
      rows.push(cols.join(','));
    });

    const csvContent = '\ufeff' + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Purchasing_${selectedModule}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    if (!reportData) return;
    const headers = getHeaders(selectedModule);
    const rowsHtml = reportData.map((r, i) => `
      <tr style="background:${i % 2 === 0 ? '#f8fafc' : '#fff'}">
        ${getRowValues(selectedModule, r).map(c => `<td>${c || '—'}</td>`).join('')}
      </tr>
    `).join('');

    const html = `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Report ${selectedModule}</title><style>
      body{font-family:Arial,sans-serif;font-size:10px;color:#1a1a1a;padding:10px 14px}@page{size:A4 landscape;margin:7mm}
      h2{font-size:14px;margin:0 0 3px;color:#1a5cad}p{color:#64748b;font-size:9px;margin:0 0 10px}
      table{width:100%;border-collapse:collapse}th{background:#1a5cad;color:#fff;padding:6px 8px;font-size:9px;text-align:left;border:1px solid #1354a0;white-space:nowrap}
      td{padding:5px 8px;border:1px solid #d1d5db;vertical-align:top;font-size:9px}
      .pbtn{position:fixed;bottom:14px;right:14px;background:#1a5cad;color:#fff;border:none;padding:7px 18px;border-radius:7px;font-size:12px;font-weight:700;cursor:pointer}@media print{.pbtn{display:none}}
    </style></head><body>
      <button class="pbtn" onclick="window.print()">🖨 Cetak / Simpan PDF</button>
      <h2>Report Data Purchasing &mdash; ${selectedModule.toUpperCase()}</h2>
      <p>Tanggal Laporan: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })} | Total: ${reportData.length} records</p>
      <table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rowsHtml}</tbody></table>
    </body></html>`;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 600);
    }
  };

  return (
    <div id="sec-report" className="section active">
      <div className="pg-hd">
        <h4>Report & Export Center</h4>
        <p>Generate dan unduh laporan data procurement dalam format CSV / Excel atau PDF Landscape</p>
      </div>

      <div className="content flex gap-4 items-start flex-wrap overflow-y-auto">
        {/* Filter Card */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="rpt-filter-card space-y-3">
            <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Pilih Filter Laporan
            </div>

            <div>
              <label className="form-lbl">Modul Data *</label>
              <select className="form-ctrl text-xs" value={selectedModule} onChange={e => setSelectedModule(e.target.value)}>
                <option value="purchase-request">Purchase Request</option>
                <option value="purchase-order">Purchase Order</option>
                <option value="quotation">Quotation</option>
                <option value="invoice">Invoice</option>
                <option value="delivery-status">Delivery Status</option>
                <option value="supplier">Supplier / Vendor</option>
              </select>
            </div>

            {selectedModule !== 'supplier' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="form-lbl">Tahun</label>
                    <select className="form-ctrl text-xs h-8" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                      <option value="">Semua</option>
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-lbl">Bulan</label>
                    <select className="form-ctrl text-xs h-8" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
                      <option value="">Semua</option>
                      <option value="01">Januari</option>
                      <option value="02">Februari</option>
                      <option value="08">Agustus</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="form-lbl">Dari</label>
                    <input className="form-ctrl text-xs h-8" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                  </div>
                  <div>
                    <label className="form-lbl">Sampai</label>
                    <input className="form-ctrl text-xs h-8" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                  </div>
                </div>
              </>
            )}

            <button className="btn-primary-sm w-full justify-center" onClick={handleGenerateReport}>
              <RotateCw className="w-3.5 h-3.5" /> Generate Report
            </button>

            {reportData && (
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Unduh Hasil Laporan:</div>
                <button className="btn-refresh w-full justify-start text-emerald-700 bg-emerald-50 border-emerald-200" onClick={exportCSV}>
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <div className="text-left">
                    <div className="font-bold text-xs">Download CSV / Excel</div>
                    <div className="text-[10px] text-slate-500">{reportData.length} baris data</div>
                  </div>
                </button>
                <button className="btn-refresh w-full justify-start text-rose-700 bg-rose-50 border-rose-200" onClick={exportPDF}>
                  <Printer className="w-4 h-4 text-rose-600" />
                  <div className="text-left">
                    <div className="font-bold text-xs">Print / PDF Landscape</div>
                    <div className="text-[10px] text-slate-500">A4 Landscape format</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Data Preview Column */}
        <div className="flex-1 min-w-[300px]">
          {!reportData ? (
            <div className="data-card p-12 text-center flex flex-col items-center justify-center">
              <FileBarChart className="w-12 h-12 text-slate-300 mb-3" />
              <p className="font-bold text-slate-800 text-sm">Pilih modul filter &amp; klik Generate Report</p>
              <p className="text-xs text-slate-400 mt-1">Preview data laporan akan tampil di tabel ini sebelum diunduh.</p>
            </div>
          ) : (
            <div className="data-card">
              <div className="data-hd">
                <h6>Hasil Laporan: {selectedModule.toUpperCase()}</h6>
                <span className="text-xs text-slate-500">{reportData.length} records</span>
              </div>
              <div className="tbl-wrap">
                <table className="tbl text-xs">
                  <thead>
                    <tr>
                      {getHeaders(selectedModule).map((h, idx) => (
                        <th key={idx} className="whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="empty-state">Tidak ada data untuk filter ini</td>
                      </tr>
                    ) : (
                      reportData.map((r, i) => (
                        <tr key={i}>
                          {getRowValues(selectedModule, r).map((c, j) => (
                            <td key={j} className="whitespace-nowrap">{c || '—'}</td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
