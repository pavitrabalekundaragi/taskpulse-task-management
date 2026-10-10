import React from 'react';
import { X, Command } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export const KeyboardShortcutsModal: React.FC = () => {
  const { isShortcutsOpen, setIsShortcutsOpen } = useTasks();

  if (!isShortcutsOpen) return null;

  const shortcuts = [
    { key: 'N', description: 'Create new sprint task' },
    { key: '1', description: 'Switch to Kanban Board view' },
    { key: '2', description: 'Switch to List / Table view' },
    { key: '3', description: 'Switch to Calendar view' },
    { key: '4', description: 'Switch to Analytics view' },
    { key: 'T', description: 'Open interactive Task Tutorial' },
    { key: '?', description: 'Toggle this keyboard shortcuts dialog' },
    { key: 'Esc', description: 'Close any open modal or drawer' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-slate-100">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Command className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-slate-100">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={() => setIsShortcutsOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {shortcuts.map((sc) => (
            <div key={sc.key} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-0">
              <span className="text-slate-300">{sc.description}</span>
              <kbd className="px-2 py-1 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] text-indigo-300 shadow-sm">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/40 text-right">
          <button
            onClick={() => setIsShortcutsOpen(false)}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
