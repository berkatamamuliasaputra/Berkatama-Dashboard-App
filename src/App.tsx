import React, { useState, useEffect } from 'react';
import { RotateCw } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { ActivityTicker } from './components/ActivityTicker';
import { DashboardSec } from './components/DashboardSec';
import { PurchaseRequestsSec } from './components/PurchaseRequestsSec';
import { PurchaseOrdersSec } from './components/PurchaseOrdersSec';
import { QuotationsSec } from './components/QuotationsSec';
import { InvoicesSec } from './components/InvoicesSec';
import { DeliveryStatusSec } from './components/DeliveryStatusSec';
import { SuppliersSec } from './components/SuppliersSec';
import { ApprovalsSec } from './components/ApprovalsSec';
import { ReportSec } from './components/ReportSec';
import { AiAgentSec, AgentAction } from './components/AiAgentSec';
import { GasExporterSec } from './components/GasExporterSec';
import { AccountSec } from './components/AccountSec';
import { DetailModal } from './components/DetailModal';

import {
  MOCK_PURCHASE_REQUESTS,
  MOCK_PURCHASE_ORDERS,
  MOCK_QUOTATIONS,
  MOCK_INVOICES,
  MOCK_DELIVERY_STATUSES,
  MOCK_SUPPLIERS,
  MOCK_APPROVALS,
  MOCK_NPWP_DATABASE,
  MOCK_ACTIVITY_LOGS
} from './data/initialData';

import {
  PurchaseRequest,
  PurchaseOrder,
  Quotation,
  Invoice,
  DeliveryStatus,
  Supplier,
  Approval,
  NpwpRecord,
  ActivityLog,
  User
} from './types';

declare global {
  interface Window {
    google?: {
      script?: {
        run: {
          withSuccessHandler: (cb: (res: any) => void) => any;
          withFailureHandler: (cb: (err: any) => void) => any;
          [key: string]: any;
        };
      };
    };
  }
}

export default function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [forcedViewMode, setForcedViewMode] = useState<'auto' | 'mobile' | 'desktop'>('auto');
  const [globalSearch, setGlobalSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // User State
  const [currentUser, setCurrentUser] = useState<User>({
    username: 'admin',
    role: 'Administrator',
    name: 'Purchasing Admin'
  });

  // Main Datasets with localStorage fallback
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(() => {
    try {
      const saved = localStorage.getItem('purchasing_pr');
      return saved ? JSON.parse(saved) : MOCK_PURCHASE_REQUESTS;
    } catch (e) {
      return MOCK_PURCHASE_REQUESTS;
    }
  });
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    try {
      const saved = localStorage.getItem('purchasing_po');
      return saved ? JSON.parse(saved) : MOCK_PURCHASE_ORDERS;
    } catch (e) {
      return MOCK_PURCHASE_ORDERS;
    }
  });
  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    try {
      const saved = localStorage.getItem('purchasing_qt');
      return saved ? JSON.parse(saved) : MOCK_QUOTATIONS;
    } catch (e) {
      return MOCK_QUOTATIONS;
    }
  });
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem('purchasing_inv');
      return saved ? JSON.parse(saved) : MOCK_INVOICES;
    } catch (e) {
      return MOCK_INVOICES;
    }
  });
  const [deliveryStatuses, setDeliveryStatuses] = useState<DeliveryStatus[]>(() => {
    try {
      const saved = localStorage.getItem('purchasing_del');
      return saved ? JSON.parse(saved) : MOCK_DELIVERY_STATUSES;
    } catch (e) {
      return MOCK_DELIVERY_STATUSES;
    }
  });
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try {
      const saved = localStorage.getItem('purchasing_sup');
      return saved ? JSON.parse(saved) : MOCK_SUPPLIERS;
    } catch (e) {
      return MOCK_SUPPLIERS;
    }
  });
  const [approvals, setApprovals] = useState<Approval[]>(() => {
    try {
      const saved = localStorage.getItem('purchasing_apr');
      return saved ? JSON.parse(saved) : MOCK_APPROVALS;
    } catch (e) {
      return MOCK_APPROVALS;
    }
  });
  const [npwpDatabase] = useState<NpwpRecord[]>(MOCK_NPWP_DATABASE);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(MOCK_ACTIVITY_LOGS);

  // Sync state changes to localStorage
  useEffect(() => { localStorage.setItem('purchasing_pr', JSON.stringify(purchaseRequests)); }, [purchaseRequests]);
  useEffect(() => { localStorage.setItem('purchasing_po', JSON.stringify(purchaseOrders)); }, [purchaseOrders]);
  useEffect(() => { localStorage.setItem('purchasing_qt', JSON.stringify(quotations)); }, [quotations]);
  useEffect(() => { localStorage.setItem('purchasing_inv', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('purchasing_del', JSON.stringify(deliveryStatuses)); }, [deliveryStatuses]);
  useEffect(() => { localStorage.setItem('purchasing_sup', JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem('purchasing_apr', JSON.stringify(approvals)); }, [approvals]);

  // Inspect Modal
  const [inspectingRecord, setInspectingRecord] = useState<Record<string, any> | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addLog = (action: string, detail: string) => {
    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setActivityLogs(prev => [
      { time, user: currentUser.name || currentUser.username, action, detail },
      ...prev.slice(0, 19)
    ]);
  };

  // Refresh All Data function with loading spinner & GAS / Local sync
  const refreshAllData = () => {
    setIsLoading(true);
    if (window.google?.script?.run) {
      window.google.script.run
        .withSuccessHandler((res: any) => {
          setIsLoading(false);
          if (res && res.success) {
            if (res.purchaseRequests) setPurchaseRequests(res.purchaseRequests);
            if (res.purchaseOrders) setPurchaseOrders(res.purchaseOrders);
            if (res.quotations) setQuotations(res.quotations);
            if (res.invoices) setInvoices(res.invoices);
            if (res.deliveryStatuses) setDeliveryStatuses(res.deliveryStatuses);
            if (res.suppliers) setSuppliers(res.suppliers);
            if (res.approvals) setApprovals(res.approvals);
            showToast('Data berhasil diperbarui dari Google Sheets!');
            addLog('REFRESH', 'Data disinkronisasi dengan Google Sheets');
          } else {
            showToast(`Gagal memuat data: ${res?.error || 'Spreadsheet tidak merespons'}`);
          }
        })
        .withFailureHandler((err: any) => {
          setIsLoading(false);
          console.error('GAS Fetch Error:', err);
          showToast('Gagal memuat data dari Spreadsheet. Menggunakan local cache.');
        })
        .getInitialDataGAS();
    } else {
      // Standalone mode simulation
      setTimeout(() => {
        setIsLoading(false);
        try {
          const savedPR = localStorage.getItem('purchasing_pr');
          const savedPO = localStorage.getItem('purchasing_po');
          const savedQT = localStorage.getItem('purchasing_qt');
          const savedINV = localStorage.getItem('purchasing_inv');
          const savedDEL = localStorage.getItem('purchasing_del');
          const savedSUP = localStorage.getItem('purchasing_sup');
          const savedAPR = localStorage.getItem('purchasing_apr');

          if (savedPR) setPurchaseRequests(JSON.parse(savedPR));
          if (savedPO) setPurchaseOrders(JSON.parse(savedPO));
          if (savedQT) setQuotations(JSON.parse(savedQT));
          if (savedINV) setInvoices(JSON.parse(savedINV));
          if (savedDEL) setDeliveryStatuses(JSON.parse(savedDEL));
          if (savedSUP) setSuppliers(JSON.parse(savedSUP));
          if (savedAPR) setApprovals(JSON.parse(savedAPR));
        } catch(e) {
          console.warn('LocalStorage load warning:', e);
        }
        showToast('✨ Data berhasil diperbarui & disinkronkan!');
        addLog('REFRESH', 'Segarkan data & cache sistem lokal');
      }, 600);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Generic Save / Update Handler
  const handleSaveRecord = (sheetName: string, record: any, isEdit: boolean, idKey: string) => {
    if (window.google?.script?.run) {
      setIsLoading(true);
      window.google.script.run
        .withSuccessHandler((res: any) => {
          setIsLoading(false);
          if (res && res.success) {
            showToast(`Data ${sheetName} berhasil disimpan!`);
            refreshAllData();
          } else {
            showToast(`Error: ${res?.error || 'Gagal menyimpan data'}`);
          }
        })
        .withFailureHandler((err: any) => {
          setIsLoading(false);
          console.error('GAS Save Error:', err);
          showToast('Gagal menyimpan ke Google Sheets');
        })
        .saveRecordGAS(sheetName, record, isEdit, idKey);
    } else {
      // Standalone React State Update
      const updateState = (setter: React.Dispatch<React.SetStateAction<any[]>>) => {
        setter(prev => {
          if (isEdit && record._rowIndex) {
            return prev.map(item => item._rowIndex === record._rowIndex ? record : item);
          } else {
            return [{ ...record, _rowIndex: prev.length + 2 }, ...prev];
          }
        });
      };

      if (sheetName === 'PURCHASE REQUEST') updateState(setPurchaseRequests);
      else if (sheetName === 'PURCHASE ORDER') updateState(setPurchaseOrders);
      else if (sheetName === 'QUOTATION') updateState(setQuotations);
      else if (sheetName === 'INVOICE') updateState(setInvoices);
      else if (sheetName === 'DELIVERY STATUS') updateState(setDeliveryStatuses);
      else if (sheetName === 'DATA SUPPLIER') updateState(setSuppliers);
      else if (sheetName === 'APPROVALS') updateState(setApprovals);

      showToast(`[Preview] Data ${sheetName} disimpan`);
      addLog(isEdit ? 'UPDATE' : 'CREATE', `${sheetName}: ${record[idKey] || 'Record'}`);
    }
  };

  // Generic Delete Handler
  const handleDeleteRecord = (sheetName: string, record: any, idKey: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ${record[idKey] || 'record ini'}?`)) return;

    if (window.google?.script?.run && record._rowIndex) {
      setIsLoading(true);
      window.google.script.run
        .withSuccessHandler((res: any) => {
          setIsLoading(false);
          if (res && res.success) {
            showToast('Data berhasil dihapus dari Google Sheets!');
            refreshAllData();
          } else {
            showToast(`Error: ${res?.error || 'Gagal menghapus'}`);
          }
        })
        .withFailureHandler((err: any) => {
          setIsLoading(false);
          showToast('Gagal menghapus dari Google Sheets');
        })
        .deleteRecordGAS(sheetName, record._rowIndex);
    } else {
      const deleteState = (setter: React.Dispatch<React.SetStateAction<any[]>>) => {
        setter(prev => prev.filter(item => item._rowIndex !== record._rowIndex));
      };

      if (sheetName === 'PURCHASE REQUEST') deleteState(setPurchaseRequests);
      else if (sheetName === 'PURCHASE ORDER') deleteState(setPurchaseOrders);
      else if (sheetName === 'QUOTATION') deleteState(setQuotations);
      else if (sheetName === 'INVOICE') deleteState(setInvoices);
      else if (sheetName === 'DELIVERY STATUS') deleteState(setDeliveryStatuses);
      else if (sheetName === 'DATA SUPPLIER') deleteState(setSuppliers);
      else if (sheetName === 'APPROVALS') deleteState(setApprovals);

      showToast(`[Preview] Data ${record[idKey]} dihapus`);
      addLog('DELETE', `${sheetName}: ${record[idKey]}`);
    }
  };

  // Approval Handlers
  const handleApproveWorkflow = (approval: Approval, approver: string) => {
    const updated = {
      ...approval,
      Status: 'Disetujui',
      'Approved By': approver,
      Catatan: 'Disetujui via Purchasing'
    };
    handleSaveRecord('APPROVALS', updated, true, 'ID Approval');
    addLog('APPROVE', `Persetujuan ${approval['ID Approval']} oleh ${approver}`);
  };

  const handleRejectWorkflow = (approval: Approval, rejecter: string, note: string) => {
    const updated = {
      ...approval,
      Status: 'Ditolak',
      'Approved By': rejecter,
      Catatan: note || 'Ditolak'
    };
    handleSaveRecord('APPROVALS', updated, true, 'ID Approval');
    addLog('REJECT', `Penolakan ${approval['ID Approval']} oleh ${rejecter}`);
  };

  const handleCreateApprovalRequest = (req: Partial<Approval>) => {
    const nextSeq = approvals.length + 1;
    const newApproval: Approval = {
      'ID Approval': `APP-${String(nextSeq).padStart(3, '0')}`,
      'Tanggal': new Date().toISOString().slice(0, 10),
      'Modul': req.Modul || 'Purchase Order',
      'Data ID': req['Data ID'] || 'PO-001',
      'Pemohon': req.Pemohon || currentUser.name || 'Staff',
      'Customer': req.Customer || 'Customer',
      'Nominal': req.Nominal || 0,
      'Keterangan': req.Keterangan || '',
      'Status': 'Menunggu',
      'Approved By': '',
      'Catatan': ''
    };
    handleSaveRecord('APPROVALS', newApproval, false, 'ID Approval');
  };

  const handleExecuteAgentAction = (action: AgentAction) => {
    if (!action || !action.type || !action.module) return;
    const { type, module, id, updates, newRecord } = action;

    if (type === 'UPDATE_RECORD' && id && updates) {
      if (module === 'purchaseRequests') setPurchaseRequests(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
      if (module === 'purchaseOrders') setPurchaseOrders(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
      if (module === 'quotations') setQuotations(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
      if (module === 'invoices') setInvoices(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
      if (module === 'deliveryStatuses') setDeliveryStatuses(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
      if (module === 'suppliers') setSuppliers(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
      if (module === 'approvals') setApprovals(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
      addLog('AI_AGENT', `PERBAIKAN ${module} (${id})`);
    } else if (type === 'ADD_RECORD' && newRecord) {
      if (module === 'purchaseRequests') setPurchaseRequests(prev => [newRecord as any, ...prev]);
      if (module === 'purchaseOrders') setPurchaseOrders(prev => [newRecord as any, ...prev]);
      if (module === 'quotations') setQuotations(prev => [newRecord as any, ...prev]);
      if (module === 'invoices') setInvoices(prev => [newRecord as any, ...prev]);
      if (module === 'deliveryStatuses') setDeliveryStatuses(prev => [newRecord as any, ...prev]);
      if (module === 'suppliers') setSuppliers(prev => [newRecord as any, ...prev]);
      if (module === 'approvals') setApprovals(prev => [newRecord as any, ...prev]);
      addLog('AI_AGENT', `TAMBAH DATA ${module} (${newRecord.id || 'NEW'})`);
    } else if (type === 'DELETE_RECORD' && id) {
      if (module === 'purchaseRequests') setPurchaseRequests(prev => prev.filter(item => item.id !== id));
      if (module === 'purchaseOrders') setPurchaseOrders(prev => prev.filter(item => item.id !== id));
      if (module === 'quotations') setQuotations(prev => prev.filter(item => item.id !== id));
      if (module === 'invoices') setInvoices(prev => prev.filter(item => item.id !== id));
      if (module === 'deliveryStatuses') setDeliveryStatuses(prev => prev.filter(item => item.id !== id));
      if (module === 'suppliers') setSuppliers(prev => prev.filter(item => item.id !== id));
      if (module === 'approvals') setApprovals(prev => prev.filter(item => item.id !== id));
      addLog('AI_AGENT', `HAPUS DATA ${module} (${id})`);
    }
  };

  return (
    <div className={`app-shell ${theme}`}>
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSelectSection={sec => {
          setActiveSection(sec);
          setIsMobileOpen(false);
        }}
        pendingApprovalsCount={approvals.filter(a => a.Status === 'Menunggu').length}
        currentUser={currentUser}
        onRefreshAll={refreshAllData}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Container */}
      <div className="main-wrapper">
        <Topbar
          activeSection={activeSection}
          theme={theme}
          onToggleTheme={t => setTheme(t)}
          onRefresh={refreshAllData}
          currentUser={currentUser}
          globalSearch={globalSearch}
          onGlobalSearchChange={setGlobalSearch}
          onToggleMobileMenu={() => setIsMobileOpen(!isMobileOpen)}
          forcedViewMode={forcedViewMode}
          onSetForcedViewMode={setForcedViewMode}
        />

        <ActivityTicker logs={activityLogs} />

        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-16 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-amber-400">
            <span>✨</span> {toastMessage}
          </div>
        )}

        {/* Content Section Area */}
        <div className="p-4 flex-1 flex flex-col">
          {activeSection === 'dashboard' && (
            <DashboardSec
              purchaseRequests={purchaseRequests}
              purchaseOrders={purchaseOrders}
              quotations={quotations}
              invoices={invoices}
              deliveryStatuses={deliveryStatuses}
              suppliers={suppliers}
              approvals={approvals}
              onNavigate={setActiveSection}
              onInspect={setInspectingRecord}
            />
          )}

          {(activeSection === 'purchase-request' || activeSection === 'purchase-requests') && (
            <PurchaseRequestsSec
              data={purchaseRequests.filter(item => JSON.stringify(item).toLowerCase().includes(globalSearch.toLowerCase()))}
              onRefresh={refreshAllData}
              onSave={(rec, isEdit) => handleSaveRecord('PURCHASE REQUEST', rec, isEdit, 'ID Request')}
              onDelete={rec => handleDeleteRecord('PURCHASE REQUEST', rec, 'ID Request')}
              onInspect={setInspectingRecord}
            />
          )}

          {(activeSection === 'purchase-order' || activeSection === 'purchase-orders') && (
            <PurchaseOrdersSec
              data={purchaseOrders.filter(item => JSON.stringify(item).toLowerCase().includes(globalSearch.toLowerCase()))}
              onRefresh={refreshAllData}
              onSave={(rec, isEdit) => handleSaveRecord('PURCHASE ORDER', rec, isEdit, 'ID Order')}
              onDelete={rec => handleDeleteRecord('PURCHASE ORDER', rec, 'ID Order')}
              onInspect={setInspectingRecord}
            />
          )}

          {(activeSection === 'quotation' || activeSection === 'quotations') && (
            <QuotationsSec
              data={quotations.filter(item => JSON.stringify(item).toLowerCase().includes(globalSearch.toLowerCase()))}
              onRefresh={refreshAllData}
              onSave={(rec, isEdit) => handleSaveRecord('QUOTATION', rec, isEdit, 'ID Quotation')}
              onDelete={rec => handleDeleteRecord('QUOTATION', rec, 'ID Quotation')}
              onInspect={setInspectingRecord}
            />
          )}

          {(activeSection === 'invoice' || activeSection === 'invoices') && (
            <InvoicesSec
              data={invoices.filter(item => JSON.stringify(item).toLowerCase().includes(globalSearch.toLowerCase()))}
              npwpDatabase={npwpDatabase}
              onRefresh={refreshAllData}
              onSave={(rec, isEdit) => handleSaveRecord('INVOICE', rec, isEdit, 'ID Invoice')}
              onDelete={rec => handleDeleteRecord('INVOICE', rec, 'ID Invoice')}
              onInspect={setInspectingRecord}
            />
          )}

          {(activeSection === 'delivery-status' || activeSection === 'status') && (
            <DeliveryStatusSec
              data={deliveryStatuses}
              onRefresh={refreshAllData}
              onSave={(rec, isEdit) => handleSaveRecord('DELIVERY STATUS', rec, isEdit, 'Customer Name')}
              onDelete={rec => handleDeleteRecord('DELIVERY STATUS', rec, 'Customer Name')}
              onInspect={setInspectingRecord}
            />
          )}

          {(activeSection === 'supplier' || activeSection === 'suppliers') && (
            <SuppliersSec
              data={suppliers}
              onRefresh={refreshAllData}
              onSave={(rec, isEdit) => handleSaveRecord('DATA SUPPLIER', rec, isEdit, 'ID Supplier')}
              onDelete={rec => handleDeleteRecord('DATA SUPPLIER', rec, 'ID Supplier')}
              onInspect={setInspectingRecord}
            />
          )}

          {activeSection === 'approvals' && (
            <ApprovalsSec
              data={approvals}
              onRefresh={refreshAllData}
              onApprove={handleApproveWorkflow}
              onReject={handleRejectWorkflow}
              onCreateRequest={handleCreateApprovalRequest}
              currentUser={currentUser}
            />
          )}

          {activeSection === 'report' && (
            <ReportSec
              purchaseRequests={purchaseRequests}
              purchaseOrders={purchaseOrders}
              quotations={quotations}
              invoices={invoices}
              deliveryStatuses={deliveryStatuses}
              suppliers={suppliers}
            />
          )}

          {(activeSection === 'ai-agent' || activeSection === 'media' || activeSection === 'extra') && (
            <AiAgentSec
              database={{
                purchaseRequests,
                purchaseOrders,
                quotations,
                invoices,
                deliveryStatuses,
                suppliers,
                approvals
              }}
              onExecuteAction={handleExecuteAgentAction}
              onRefreshData={refreshAllData}
              showToast={showToast}
            />
          )}

          {activeSection === 'gas-exporter' && <GasExporterSec indexHtmlContent="" />}

          {activeSection === 'account' && (
            <AccountSec
              currentUser={currentUser}
              onUpdateProfile={name => setCurrentUser(prev => ({ ...prev, name }))}
              theme={theme}
              onToggleTheme={setTheme}
            />
          )}
        </div>
      </div>

      {/* Global Loading Spinner Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 flex items-center gap-4 text-slate-800 dark:text-slate-100 max-w-sm w-full">
            <RotateCw className="w-7 h-7 text-blue-600 dark:text-blue-400 animate-spin shrink-0" />
            <div>
              <div className="font-bold text-sm">Memuat & Memperbarui Data...</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Sinkronisasi database & spreadsheet</div>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Modal */}
      <DetailModal
        data={inspectingRecord}
        onClose={() => setInspectingRecord(null)}
      />
    </div>
  );
}
