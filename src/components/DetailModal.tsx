import React from 'react';
import { FileText, ExternalLink, Edit, Trash2 } from 'lucide-react';

interface DetailModalProps {
  data: Record<string, any> | null;
  onClose: () => void;
  onEdit?: (data: any) => void;
  onDelete?: (data: any) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  data,
  onClose,
  onEdit,
  onDelete
}) => {
  if (!data) return null;

  const entries = Object.entries(data).filter(([key]) => key !== '_rowIndex');

  return (
    <div className="modal-backdrop open" onClick={onClose}>
      <div className="modal-box w-[95vw] max-w-lg sm:max-w-xl md:max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="modal-hd bg-slate-900 text-white py-2.5 px-3 sm:px-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400 shrink-0" />
            <h5 className="text-white font-bold text-xs sm:text-sm tracking-wide">Detail Informasi Record</h5>
          </div>
          <button className="modal-close text-white hover:bg-slate-800 p-1 leading-none text-xl" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body p-2.5 sm:p-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs">
            {entries.map(([key, val], idx) => {
              const isLink = typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:'));
              return (
                <div key={idx} className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-2 sm:p-2.5 rounded-lg">
                  <div className="text-[9.5px] sm:text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">{key}</div>
                  <div className="text-slate-900 dark:text-slate-100 font-semibold text-[11px] sm:text-xs break-words">
                    {isLink ? (
                      <a href={val} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 underline flex items-center gap-1 font-bold">
                        Buka File / Link <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      val == null || val === '' ? <span className="text-slate-400 italic font-normal">kosong</span> : String(val)
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-ft py-2 px-3 sm:px-4 flex items-center justify-between gap-2">
          <div className="flex gap-1.5">
            {onEdit && (
              <button
                className="btn-act edit px-2.5 py-1 text-xs"
                onClick={() => {
                  onClose();
                  onEdit(data);
                }}
              >
                <Edit className="w-3 h-3" /> Edit Record
              </button>
            )}
            {onDelete && (
              <button
                className="btn-act del px-2.5 py-1 text-xs"
                onClick={() => {
                  onClose();
                  onDelete(data);
                }}
              >
                <Trash2 className="w-3 h-3" /> Hapus
              </button>
            )}
          </div>
          <button className="px-3 py-1 text-xs font-semibold border rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
