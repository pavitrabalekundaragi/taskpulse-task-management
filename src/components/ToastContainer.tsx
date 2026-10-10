import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useTasks();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          info: <Info className="w-4 h-4 text-indigo-400 shrink-0" />,
          success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
          warn: <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />,
          error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
        };

        const borders = {
          info: 'border-indigo-500/40 bg-slate-900',
          success: 'border-emerald-500/40 bg-slate-900',
          warn: 'border-amber-500/40 bg-slate-900',
          error: 'border-rose-500/40 bg-slate-900',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3 rounded-xl border shadow-xl flex items-center justify-between gap-3 text-xs text-slate-200 transition-all animate-fadeIn ${borders[toast.type]}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {icons[toast.type]}
              <span className="truncate">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-100 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
