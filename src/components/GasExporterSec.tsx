import React, { useState } from 'react';
import { Code2, Copy, Download, Check, FileCode, Sparkles } from 'lucide-react';
import { CODE_GS_CONTENT, INDEX_HTML_CONTENT } from '../data/gasCode';

interface GasExporterSecProps {
  indexHtmlContent?: string;
}

export const GasExporterSec: React.FC<GasExporterSecProps> = ({ indexHtmlContent }) => {
  const [activeTab, setActiveTab] = useState<'Code.gs' | 'index.html'>('Code.gs');
  const [copied, setCopied] = useState(false);

  const currentCode = activeTab === 'Code.gs' ? CODE_GS_CONTENT : (indexHtmlContent || INDEX_HTML_CONTENT);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeTab;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="sec-gas-exporter" className="section active">
      <div className="pg-hd flex justify-between items-start flex-wrap gap-2">
        <div>
          <h4>Google Apps Script (GAS) Code Exporter</h4>
          <p>Dapatkan file <code className="text-amber-300 font-mono">Code.gs</code> dan <code className="text-amber-300 font-mono">index.html</code> siap pakai yang sudah diperbaiki untuk deployment di GAS</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary-sm bg-amber-600 hover:bg-amber-700" onClick={handleCopy}>
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Tersalin!' : `Salin ${activeTab}`}
          </button>
          <button className="btn-primary-sm bg-emerald-600 hover:bg-emerald-700" onClick={handleDownload}>
            <Download className="w-3.5 h-3.5" /> Unduh {activeTab}
          </button>
        </div>
      </div>

      <div className="content flex-fill flex flex-col gap-3">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 p-3.5 rounded-xl border border-amber-400/30 text-white text-xs flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-amber-200">Perbaikan Code &amp; Fitur GAS Telah Diterapkan:</div>
              <div className="text-slate-300 text-[11px] mt-0.5">
                &bull; Fix parser angka Rupiah &bull; Form Surat Penawaran &amp; Invoice PDF &bull; Chunked Drive Upload &bull; Menu Approval System &bull; Theme &amp; Purchasing UI.
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 border-b border-slate-200 pb-1">
          <button
            className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'Code.gs'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            onClick={() => setActiveTab('Code.gs')}
          >
            <Code2 className="w-4 h-4" /> Code.gs (Backend Script)
          </button>
          <button
            className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'index.html'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            onClick={() => setActiveTab('index.html')}
          >
            <FileCode className="w-4 h-4" /> index.html (Purchasing Frontend)
          </button>
        </div>

        {/* Code Viewer Container */}
        <div className="flex-1 bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs overflow-auto max-h-[500px] border border-slate-800 shadow-inner leading-relaxed">
          <pre>{currentCode}</pre>
        </div>
      </div>
    </div>
  );
};
