import React, { useState } from 'react';
import { Play, Sparkles, X, BookOpen, ShieldCheck, Zap } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export const TutorialBanner: React.FC = () => {
  const { setIsTutorialOpen, setIsCreateOpen } = useTasks();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-950 border-b border-indigo-500/20 px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-md bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <p className="text-slate-300 leading-snug">
            <span className="font-semibold text-white">Full-Stack Task Management Guide:</span>{' '}
            Master CRUD lifecycle, RBAC permissions (Admin vs Member vs Viewer), and real-time synchronization.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={() => setIsTutorialOpen(true)}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-medium transition-colors flex items-center gap-1.5 shadow-sm text-xs"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Watch Task Tutorial</span>
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
            title="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
