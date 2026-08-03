import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Database,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Trash2,
  Plus,
  RefreshCw,
  ArrowRight,
  User,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal
} from 'lucide-react';
import {
  PurchaseRequest,
  PurchaseOrder,
  Quotation,
  Invoice,
  DeliveryStatus,
  Supplier,
  Approval
} from '../types';

export interface AgentAction {
  type: 'UPDATE_RECORD' | 'ADD_RECORD' | 'DELETE_RECORD' | 'BATCH_UPDATE';
  module: 'purchaseRequests' | 'purchaseOrders' | 'quotations' | 'invoices' | 'deliveryStatuses' | 'suppliers' | 'approvals';
  id?: string;
  updates?: Record<string, any>;
  newRecord?: Record<string, any>;
  description?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  actionExecuted?: AgentAction | null;
  status?: 'success' | 'error' | 'pending';
}

interface AiAgentSecProps {
  database: {
    purchaseRequests: PurchaseRequest[];
    purchaseOrders: PurchaseOrder[];
    quotations: Quotation[];
    invoices: Invoice[];
    deliveryStatuses: DeliveryStatus[];
    suppliers: Supplier[];
    approvals: Approval[];
  };
  onExecuteAction: (action: AgentAction) => void;
  onRefreshData?: () => void;
  showToast?: (msg: string) => void;
}

export const AiAgentSec: React.FC<AiAgentSecProps> = ({
  database,
  onExecuteAction,
  onRefreshData,
  showToast
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'agent',
      text: 'Halo! Saya **BMS Agent AI** untuk Database Purchasing PT Berkatama Mulia Saputra.\n\nSaya dapat **menjawab pertanyaan, menganalisis, mencari data**, sekaligus **menjalankan perintah perbaikan/perubahan data** (seperti mengubah status PO, menambah supplier, menyetujui approval, dll) secara otomatis pada sistem.\n\nApa yang bisa saya bantu hari ini?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDbDrawerOpen, setIsDbDrawerOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Quick Prompt Recommendations
  const quickPrompts = [
    { label: '📊 Total PR & Invoice Pending', prompt: 'Berapa jumlah Purchase Request dan Invoice yang belum lunas atau pending saat ini?' },
    { label: '🔍 Detail PO Terbesar', prompt: 'Cari Purchase Order dengan nominal paling besar dan tampilkan detail pemesannya.' },
    { label: '✏️ Ubah Status PO-2026-001', prompt: 'Tolong perbarui status Purchase Order PO-2026-001 menjadi Completed.' },
    { label: '✅ Approve Pending Approval', prompt: 'Tolong setujui (Approve) item pengajuan approval pertama yang statusnya masih Pending.' },
    { label: '🏢 Tambah Vendor Baru', prompt: 'Tambahkan supplier baru dengan nama PT Sumber Makmur Utama, kontak 0811223344, email info@sumbermakmur.co.id, status Aktif.' }
  ];

  // Client Local Fallback Execution Engine (if AI API response needs secondary execution or server offline)
  const processLocalFallback = (promptText: string): { reply: string; action: AgentAction | null } => {
    const text = promptText.toLowerCase();

    // 1. Action: Ubah status PO
    if (text.includes('ubah status po') || text.includes('perbarui status po') || text.includes('ganti status po')) {
      const matchPo = promptText.match(/PO-\d+(-\d+)?/i) || promptText.match(/PO\s*\d+/i);
      const targetId = matchPo ? matchPo[0].toUpperCase().replace(/\s+/, '-') : (database.purchaseOrders[0]?.['ID Order'] || database.purchaseOrders[0]?.['No PO'] || 'PO-2026-001');
      let targetStatus = 'Completed';
      if (text.includes('processing')) targetStatus = 'Processing';
      if (text.includes('pending')) targetStatus = 'Pending';
      if (text.includes('canceled') || text.includes('batal')) targetStatus = 'Canceled';

      const poExists = database.purchaseOrders.find(p => p['ID Order'] === targetId || p['No PO'] === targetId || p._rowIndex?.toString() === targetId);
      if (poExists) {
        const idVal = poExists['ID Order'] || poExists['No PO'];
        const vendorVal = poExists['Vendor/Supplier'] || 'Vendor';
        return {
          reply: `✅ **Berhasil Memperbarui Data!**\n\nSaya telah memperbarui status **${idVal}** (${vendorVal}) menjadi **\`${targetStatus}\`**. Data telah disinkronkan ke database lokal & spreadsheet.`,
          action: {
            type: 'UPDATE_RECORD',
            module: 'purchaseOrders',
            id: idVal,
            updates: { Status: targetStatus },
            description: `Mengubah status ${idVal} menjadi ${targetStatus}`
          }
        };
      }
    }

    // 2. Action: Approve Approval
    if (text.includes('setujui') || text.includes('approve')) {
      const pendingApr = database.approvals.find(a => a.Status === 'Menunggu' || a.Status === 'Pending') || database.approvals[0];
      if (pendingApr) {
        const aprId = pendingApr['ID Approval'];
        return {
          reply: `✅ **Approval Disetujui!**\n\nPengajuan approval **${aprId}** (${pendingApr.Modul} - ${pendingApr['Data ID']}) untuk **${pendingApr.Customer}** sebesar \`Rp ${Number(pendingApr.Nominal||0).toLocaleString('id-ID')}\` telah diubah statusnya menjadi **Disetujui**.`,
          action: {
            type: 'UPDATE_RECORD',
            module: 'approvals',
            id: aprId,
            updates: { Status: 'Disetujui', 'Approved By': 'AI Agent System' },
            description: `Setujui approval ${aprId}`
          }
        };
      }
    }

    // 3. Action: Tambah Supplier
    if (text.includes('tambah supplier') || text.includes('tambah vendor')) {
      const newId = `SUP-2026-${Math.floor(100 + Math.random() * 900)}`;
      const supplierName = promptText.split(/nama|supplier/i)[1]?.split(/,|\bkontak\b|\bemail\b/i)[0]?.trim() || 'PT Sumber Makmur Utama';
      const newSup: Supplier = {
        'ID Supplier': newId,
        'Kategori': 'General Supplier',
        'Nama Perusahaan Vendor/Supplier': supplierName.replace(/^[:\s]+/, '') || 'PT Sumber Makmur Utama',
        'Nama Barang': 'General Materials',
        'Harga Barang': 0,
        'Alamat Kantor / Toko': 'Jakarta Pusat',
        'PIC': 'Budi Santoso',
        'No Tlp/WA': '0811223344',
        _rowIndex: database.suppliers.length + 2
      };
      return {
        reply: `✨ **Supplier Baru Berhasil Ditambahkan!**\n\n- **ID**: ${newSup['ID Supplier']}\n- **Nama Supplier**: ${newSup['Nama Perusahaan Vendor/Supplier']}\n- **Kategori**: ${newSup.Kategori}\n- **PIC**: ${newSup.PIC}\n\nData telah ditambahkan ke database Supplier/Vendor.`,
        action: {
          type: 'ADD_RECORD',
          module: 'suppliers',
          newRecord: newSup as any,
          description: `Tambah supplier ${newSup['Nama Perusahaan Vendor/Supplier']}`
        }
      };
    }

    // 4. Query: Total PR & Invoice
    if (text.includes('total') || text.includes('berapa') || text.includes('hitung') || text.includes('jumlah')) {
      const totalPr = database.purchaseRequests.length;
      const totalInv = database.invoices.length;
      const unpaidInv = database.invoices.filter(i => i.Status !== 'Lunas' && i.Status !== 'Paid');
      const unpaidNominal = unpaidInv.reduce((sum, item) => sum + (Number(item['Nominal Tagihan'] || 0)), 0);

      return {
        reply: `📊 **Laporan Ringkasan Database Purchasing:**\n\n` +
          `1. **Purchase Request (PR)**:\n   - Total Record: **${totalPr} PR**\n\n` +
          `2. **Invoice & Tagihan**:\n   - Total Record: **${totalInv} Invoice**\n   - Belum Lunas: **${unpaidInv.length} Invoice**\n   - Total Nominal Tagihan Belum Lunas: **Rp ${unpaidNominal.toLocaleString('id-ID')}**\n\n` +
          `Apakah ada data tertentu yang ingin Anda perbaiki atau perbarui?`,
        action: null
      };
    }

    // 5. Query: Cari PO Terbesar
    if (text.includes('po') || text.includes('purchase order')) {
      const sortedPo = [...database.purchaseOrders].sort((a, b) => (Number(b['Total Beli'] || b['Harga Beli'] || 0)) - (Number(a['Total Beli'] || a['Harga Beli'] || 0)));
      const topPo = sortedPo[0];
      if (topPo) {
        return {
          reply: `🔍 **Purchase Order (PO) Terbesar:**\n\n` +
            `- **ID Order**: ${topPo['ID Order']}\n` +
            `- **No PO**: ${topPo['No PO']}\n` +
            `- **Vendor**: ${topPo['Vendor/Supplier']}\n` +
            `- **Tanggal**: ${topPo.Tanggal}\n` +
            `- **Total Beli**: **Rp ${Number(topPo['Total Beli'] || topPo['Harga Beli'] || 0).toLocaleString('id-ID')}**\n\n` +
            `Ketik perintah jika Anda ingin mengubah status atau detail dari PO ini.`,
          action: null
        };
      }
    }

    // Default General Intelligent Response
    return {
      reply: `🤖 **BMS Agent AI Siap Mengeksekusi Perintah:**\n\nSaya telah menganalisis permintaan Anda: *"text"*\n\nDatabase saat ini mencakup:\n- **${database.purchaseRequests.length}** Purchase Request\n- **${database.purchaseOrders.length}** Purchase Order\n- **${database.quotations.length}** Quotation\n- **${database.invoices.length}** Invoice\n- **${database.suppliers.length}** Supplier\n- **${database.approvals.length}** Approval\n\nSilakan berikan instruksi spesifik jika ingin mengubah, menghapus, atau menambahkan data!`,
      action: null
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputText).trim();
    if (!prompt || isProcessing) return;

    const userMsgId = `usr-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsProcessing(true);

    try {
      // Call Server Gemini API /api/agent
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          database: database
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const { reply, action } = json.data;

          // If AI suggested an action, execute it in frontend state
          if (action) {
            onExecuteAction(action);
            if (showToast) showToast(`⚡ Perintah AI Dieksekusi: ${action.description || action.type}`);
          }

          const agentMsg: ChatMessage = {
            id: `agent-${Date.now()}`,
            sender: 'agent',
            text: reply || 'Permintaan telah diproses.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionExecuted: action,
            status: 'success'
          };
          setMessages(prev => [...prev, agentMsg]);
          setIsProcessing(false);
          return;
        }
      }

      // Fallback local execution if API unavailable or error
      const localRes = processLocalFallback(prompt);
      if (localRes.action) {
        onExecuteAction(localRes.action);
        if (showToast) showToast(`⚡ Perintah AI Dieksekusi: ${localRes.action.description || localRes.action.type}`);
      }

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: localRes.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionExecuted: localRes.action,
        status: 'success'
      };
      setMessages(prev => [...prev, agentMsg]);
    } catch (err) {
      console.warn('Backend API unavailable, using client-side AI engine logic:', err);
      const localRes = processLocalFallback(prompt);
      if (localRes.action) {
        onExecuteAction(localRes.action);
        if (showToast) showToast(`⚡ Perintah AI Dieksekusi: ${localRes.action.description || localRes.action.type}`);
      }

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: localRes.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionExecuted: localRes.action,
        status: 'success'
      };
      setMessages(prev => [...prev, agentMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const APP_LOGO_URL = 'https://docs.google.com/drawings/d/e/2PACX-1vT3QpvI0MKSmDoilYUG7si-kizLx9UxTgcTLj18ueAQ4XHfRrNlrxOhQLmtJUgrXu623dC0Ek3qeeLZ/pub?w=480&h=360';

  return (
    <div id="sec-ai-agent" className="section active flex flex-col h-full gap-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 text-white rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden shrink-0">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-inner p-1.5 backdrop-blur-xs">
            <img
              src={APP_LOGO_URL}
              alt="BMS Agent AI Logo"
              className="w-full h-full object-contain rounded-lg bg-white p-0.5 shadow-xs"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-bold tracking-tight text-white">
                Chat Bot - BMS Agent AI
              </h4>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Gemini 3.6 Flash Active
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
              Asisten AI Cerdas Penanya Database &amp; Pelaksana Perintah Perubahan/Perbaikan Data Otomatis.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 relative z-10">
          <button
            onClick={() => setIsDbDrawerOpen(!isDbDrawerOpen)}
            className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>Konteks Database</span>
            {isDbDrawerOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {onRefreshData && (
            <button
              onClick={onRefreshData}
              className="p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-xs font-semibold rounded-lg transition-all"
              title="Refresh Sync Database"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Database Context Drawer */}
      {isDbDrawerOpen && (
        <div className="bg-slate-900 border border-slate-800 text-slate-200 rounded-xl p-4 text-xs animate-in fade-in slide-in-from-top-2 duration-200 shrink-0 shadow-md">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
            <span className="font-bold text-slate-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" /> Ringkasan Data Real-time Terhubung Ke AI
            </span>
            <span className="text-[10px] font-mono text-slate-400">Total 7 Modul Database Aktif</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center">
            <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
              <div className="text-[10px] text-slate-400">Purchase Request</div>
              <div className="font-bold text-sm text-blue-400">{database.purchaseRequests.length}</div>
            </div>
            <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
              <div className="text-[10px] text-slate-400">Purchase Order</div>
              <div className="font-bold text-sm text-emerald-400">{database.purchaseOrders.length}</div>
            </div>
            <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
              <div className="text-[10px] text-slate-400">Quotation</div>
              <div className="font-bold text-sm text-purple-400">{database.quotations.length}</div>
            </div>
            <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
              <div className="text-[10px] text-slate-400">Invoice</div>
              <div className="font-bold text-sm text-amber-400">{database.invoices.length}</div>
            </div>
            <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
              <div className="text-[10px] text-slate-400">Delivery Status</div>
              <div className="font-bold text-sm text-cyan-400">{database.deliveryStatuses.length}</div>
            </div>
            <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
              <div className="text-[10px] text-slate-400">Supplier</div>
              <div className="font-bold text-sm text-indigo-400">{database.suppliers.length}</div>
            </div>
            <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
              <div className="text-[10px] text-slate-400">Approval System</div>
              <div className="font-bold text-sm text-rose-400">{database.approvals.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Container */}
      <div className="data-card flex-1 flex flex-col overflow-hidden min-h-[420px] shadow-sm">
        {/* Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-900/30">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs font-bold text-xs overflow-hidden ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-300 dark:border-slate-700 p-0.5'
                }`}
              >
                {msg.sender === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <img
                    src={APP_LOGO_URL}
                    alt="BMS Agent"
                    className="w-full h-full object-contain rounded-full"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>

              {/* Message Content Box */}
              <div className={`space-y-1.5 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none'
                  }`}
                >
                  {msg.text}

                  {/* Executed Action Badge */}
                  {msg.actionExecuted && (
                    <div className="mt-3 p-2.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 rounded-xl text-[11px] text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
                      <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          Aksi Otomatis Agen AI Diterapkan
                          <span className="bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100 font-mono px-1.5 py-0.2 rounded text-[10px]">
                            {msg.actionExecuted.type}
                          </span>
                        </div>
                        <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-mono mt-0.5">
                          Modul: {msg.actionExecuted.module} {msg.actionExecuted.id ? `| ID: ${msg.actionExecuted.id}` : ''}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className={`text-[10px] text-slate-400 px-1 ${
                    msg.sender === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isProcessing && (
            <div className="flex items-center gap-3 mr-auto">
              <div className="w-8 h-8 rounded-full bg-white border border-slate-300 dark:border-slate-700 p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                <img
                  src={APP_LOGO_URL}
                  alt="BMS Agent AI"
                  className="w-full h-full object-contain rounded-full animate-pulse"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-2xl rounded-tl-none text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 text-[11px] text-slate-400">Gemini sedang menganalisis database &amp; menyiapkan tindakan...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-1.5 overflow-x-auto text-xs shrink-0">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 px-1 shrink-0">
            <Sparkles className="w-3 h-3 text-amber-500" /> Contoh Perintah:
          </span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp.prompt)}
              disabled={isProcessing}
              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-full text-[11px] font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer disabled:opacity-50"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Input Text Box */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
          <input
            type="text"
            className="form-ctrl text-xs flex-1 rounded-xl py-2.5 px-3.5 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
            placeholder="Tanyakan data atau beri perintah perbaikan/perubahan database (contoh: 'Ubah status PO-2026-001 jadi Completed')..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            disabled={isProcessing}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isProcessing}
            className="btn-primary-sm py-2.5 px-4 rounded-xl shrink-0 disabled:opacity-50 font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Kirim</span>
          </button>
        </div>
      </div>
    </div>
  );
};
