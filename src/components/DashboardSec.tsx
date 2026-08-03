import React, { useEffect, useRef } from 'react';
import {
  ClipboardList,
  ShoppingCart,
  FileText,
  Receipt,
  RotateCw,
  Building2,
  Boxes,
  Star,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import {
  PurchaseRequest,
  PurchaseOrder,
  Quotation,
  Invoice,
  Supplier,
  Approval
} from '../types';
import { fmtRp, parseIDNumber, fmtDate } from '../utils/formatters';

interface DashboardSecProps {
  purchaseRequests: PurchaseRequest[];
  purchaseOrders: PurchaseOrder[];
  quotations: Quotation[];
  invoices: Invoice[];
  suppliers: Supplier[];
  deliveryStatuses?: any[];
  approvals?: Approval[];
  onNavigate: (sec: string) => void;
  onInspect?: (rec: any) => void;
  onRefresh?: () => void;
  lastUpdatedTime?: string;
}

export const DashboardSec: React.FC<DashboardSecProps> = ({
  purchaseRequests = [],
  purchaseOrders = [],
  quotations = [],
  invoices = [],
  suppliers = [],
  approvals = [],
  onNavigate,
  onInspect,
  onRefresh,
  lastUpdatedTime
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Counts
  const prCount = purchaseRequests.length;
  const poCount = purchaseOrders.length;
  const qtCount = quotations.length;
  const invCount = invoices.length;

  // Values
  const totalNilaiPR = purchaseRequests.reduce((s, r) => s + parseIDNumber(r['Total Harga Jual'] || r['Total Jual'] || r['Total Beli']), 0);
  const totalNilaiPO = purchaseOrders.reduce((s, r) => s + parseIDNumber(r['Total Jual'] || r['Harga Jual'] || r['Total Beli']), 0);
  const totalNilaiQT = quotations.reduce((s, r) => s + parseIDNumber(r['Grand Total + (PPN 11%)'] || r['Grand Total'] || r['Total Harga']), 0);
  const totalNilaiINV = invoices.reduce((s, r) => s + parseIDNumber(r['Nominal Tagihan'] || r['Total']), 0);
  const totalQtyPO = purchaseOrders.reduce((s, r) => s + parseIDNumber(r['Qty']), 0);

  // Unique vendors
  const vendorSet = new Set<string>();
  suppliers.forEach(s => { if (s['Nama Perusahaan Vendor/Supplier']) vendorSet.add(s['Nama Perusahaan Vendor/Supplier']); });
  purchaseOrders.forEach(p => { if (p['Vendor/Supplier']) vendorSet.add(p['Vendor/Supplier']); });
  const totalVendor = vendorSet.size || suppliers.length;

  // Donut chart drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 180, H = 180, cx = W / 2, cy = H / 2, R = 72, r = 46;
    ctx.clearRect(0, 0, W, H);

    const vals = [prCount, poCount, qtCount, invCount];
    const colors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6'];
    const total = vals.reduce((a, b) => a + b, 0) || 1;
    let startAngle = -Math.PI / 2;

    vals.forEach((val, i) => {
      const sweep = (val / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, startAngle, startAngle + sweep);
      ctx.closePath();
      ctx.fillStyle = colors[i];
      ctx.fill();
      startAngle += sweep;
    });

    // Hole
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Center text
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.font = '700 18px "JetBrains Mono", monospace';
    ctx.fillText(String(prCount + poCount + qtCount + invCount), cx, cy + 2);
    ctx.font = '700 9px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('TOTAL DOKUMEN', cx, cy + 16);
  }, [prCount, poCount, qtCount, invCount]);

  // Top Customers from PO
  const custMap: Record<string, { count: number; total: number }> = {};
  purchaseOrders.forEach(r => {
    const name = r['Nama Customer'] || '—';
    const val = parseIDNumber(r['Total Jual'] || r['Harga Jual'] || r['Total Beli']);
    if (!custMap[name]) custMap[name] = { count: 0, total: 0 };
    custMap[name].count++;
    custMap[name].total += val;
  });
  const topCust = Object.keys(custMap)
    .map(n => ({ name: n, count: custMap[n].count, total: custMap[n].total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  const maxCustTotal = topCust[0] ? topCust[0].total : 1;

  const kpiCards = [
    { icon: ClipboardList, label: 'Purchase Request', val: prCount, nav: 'purchase-request', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { icon: ShoppingCart, label: 'Purchase Order', val: poCount, nav: 'purchase-order', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { icon: FileText, label: 'Quotation', val: qtCount, nav: 'quotation', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    { icon: Receipt, label: 'Invoice', val: invCount, nav: 'invoice', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  ];

  const valueSummaries = [
    { label: 'Total Nilai PR', val: totalNilaiPR, nav: 'purchase-request', badge: 'PR Active', badgeBg: 'bg-blue-100 text-blue-700' },
    { label: 'Total Nilai PO', val: totalNilaiPO, nav: 'purchase-order', badge: 'PO Active', badgeBg: 'bg-emerald-100 text-emerald-700' },
    { label: 'Total Nilai QT', val: totalNilaiQT, nav: 'quotation', badge: 'QT Active', badgeBg: 'bg-amber-100 text-amber-700' },
    { label: 'Total Nilai INV', val: totalNilaiINV, nav: 'invoice', badge: 'INV Active', badgeBg: 'bg-purple-100 text-purple-700' },
  ];

  return (
    <div className="space-y-6">
      {/* High Density Top Banner Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
            Dashboard Monitoring Procurement High Density
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ringkasan data transaksi PT. Berkatama Mulia Saputra &bull; Realtime Sync Google Sheets
          </p>
        </div>
        {onRefresh && (
          <button
            className="px-3.5 py-1.5 text-xs font-semibold border border-slate-200 text-slate-700 bg-white rounded-md hover:bg-slate-50 transition-all flex items-center gap-2 shadow-2xs"
            onClick={onRefresh}
          >
            <RotateCw className="w-3.5 h-3.5 text-blue-600" />
            <span>Refresh Data</span>
          </button>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((cd, i) => {
          const Icon = cd.icon;
          return (
            <div
              key={i}
              className={`bg-white border border-slate-200 rounded-lg p-4 shadow-2xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex items-center justify-between`}
              onClick={() => onNavigate(cd.nav)}
            >
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  {cd.label}
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {cd.val}
                </div>
                <div className="mt-1 text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Live
                </div>
              </div>
              <div className={`w-10 h-10 rounded-lg ${cd.bg} border ${cd.border} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${cd.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Value Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {valueSummaries.map((vs, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between"
            onClick={() => onNavigate(vs.nav)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {vs.label}
              </span>
              <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded font-mono ${vs.badgeBg}`}>
                {vs.badge}
              </span>
            </div>
            <div className="text-lg font-black text-slate-900 font-mono tracking-tight">
              {fmtRp(vs.val)}
            </div>
          </div>
        ))}
      </div>

      {/* Analytics & Donut Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Donut Chart */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-lg p-5 shadow-2xs flex flex-col">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
            Distribusi Dokumen Modul
          </h3>
          <div className="flex-1 flex flex-col items-center justify-center py-2">
            <canvas ref={canvasRef} width={180} height={180} className="max-w-[180px] max-h-[180px]" />
            <div className="mt-4 flex flex-wrap gap-3 justify-center text-xs font-semibold">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-600" />PR <strong className="font-mono">{prCount}</strong></span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />PO <strong className="font-mono">{poCount}</strong></span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />QT <strong className="font-mono">{qtCount}</strong></span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-purple-500" />INV <strong className="font-mono">{invCount}</strong></span>
            </div>
          </div>
        </div>

        {/* Top Customers */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
              Top Customer (Berdasarkan Nilai PO)
            </h3>
            <button
              onClick={() => onNavigate('purchase-order')}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              Detail PO <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {topCust.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">Belum ada data PO</div>
            ) : (
              topCust.map((c, i) => {
                const pct = Math.round((c.total / maxCustTotal) * 100);
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800 truncate max-w-[200px]">{c.name}</span>
                      <span className="text-xs font-mono font-semibold text-slate-600">{c.count} PO &bull; {fmtRp(c.total)}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Recent PR & PO Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Purchase Requests */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
              Purchase Request Terbaru
            </h3>
            <button
              onClick={() => onNavigate('purchase-request')}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              Lihat Semua <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
                <tr>
                  <th className="p-2.5">ID Request</th>
                  <th className="p-2.5">Customer</th>
                  <th className="p-2.5">Item</th>
                  <th className="p-2.5 text-right">Total Jual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseRequests.slice(-4).reverse().map((r, i) => (
                  <tr
                    key={i}
                    onClick={() => onInspect && onInspect(r)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="p-2.5 font-mono font-bold text-blue-600">{r['ID Request']}</td>
                    <td className="p-2.5 font-medium text-slate-800 truncate max-w-[120px]">{r['Nama Customer']}</td>
                    <td className="p-2.5 text-slate-600 truncate max-w-[140px]">{r['Nama Item']}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-emerald-600">
                      {fmtRp(r['Total Harga Jual'] || r['Total Jual'] || r['Harga Jual'])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Purchase Orders */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
              Purchase Order Terbaru
            </h3>
            <button
              onClick={() => onNavigate('purchase-order')}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              Lihat Semua <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
                <tr>
                  <th className="p-2.5">ID Order</th>
                  <th className="p-2.5">Customer</th>
                  <th className="p-2.5">Item</th>
                  <th className="p-2.5 text-right">Total Jual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseOrders.slice(-4).reverse().map((r, i) => (
                  <tr
                    key={i}
                    onClick={() => onInspect && onInspect(r)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="p-2.5 font-mono font-bold text-blue-600">{r['ID Order']}</td>
                    <td className="p-2.5 font-medium text-slate-800 truncate max-w-[120px]">{r['Nama Customer']}</td>
                    <td className="p-2.5 text-slate-600 truncate max-w-[140px]">{r['Nama Item']}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-emerald-600">
                      {fmtRp(r['Total Jual'] || r['Harga Jual'])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
