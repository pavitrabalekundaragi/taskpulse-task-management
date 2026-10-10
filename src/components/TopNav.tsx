import React, { useState } from 'react';
import {
  Plus,
  Play,
  Wifi,
  WifiOff,
  User,
  Shield,
  LogOut,
  ChevronDown,
  Sparkles,
  HelpCircle,
  Download,
  RotateCcw
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { ViewMode } from '../types';

export const TopNav: React.FC = () => {
  const {
    activeView,
    setActiveView,
    setIsCreateOpen,
    setIsTutorialOpen,
    setIsShortcutsOpen,
    syncStatus,
    isSimulatingRealtime,
    setIsSimulatingRealtime,
    triggerSimulatedUpdate,
    exportData,
    resetToDefaults,
  } = useTasks();

  const { currentUser, users, switchUser, canCreateTask } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-slate-100">
      {/* 3-Zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <a href="/" className="text-lg font-bold tracking-tight text-white flex items-center gap-2 whitespace-nowrap">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-mono text-xs font-bold text-white shadow-sm">
              TP
            </div>
            <span>TaskPulse</span>
          </a>
          <span className="text-xs text-slate-400 hidden sm:inline">/ Sprint 14</span>
        </div>

        {/* Zone 2: Primary Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          {(['board', 'list', 'calendar', 'analytics'] as ViewMode[]).map((view) => {
            const labels: Record<ViewMode, string> = {
              board: 'Board',
              list: 'List',
              calendar: 'Calendar',
              analytics: 'Analytics',
            };
            const isActive = activeView === view;
            return (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 relative ${
                  isActive ? 'text-white font-semibold' : 'hover:text-slate-200'
                }`}
              >
                {labels[view]}
                {isActive && (
                  <span className="absolute -bottom-3 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Watch Tutorial Button */}
          <button
            onClick={() => setIsTutorialOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-700/40 rounded-lg transition-colors whitespace-nowrap"
            title="Watch step-by-step interactive tutorial"
          >
            <Play className="w-3.5 h-3.5 fill-indigo-400" />
            <span>Watch Tutorial</span>
          </button>

          {/* New Task CTA */}
          <button
            onClick={() => setIsCreateOpen(true)}
            disabled={!canCreateTask()}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shadow-sm ${
              canCreateTask()
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
            }`}
            title={canCreateTask() ? 'Create New Task' : 'Viewer role cannot create tasks'}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>

          {/* User Account Menu & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-800 transition-colors border border-slate-800"
              title="Switch user account"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-md object-cover border border-slate-700"
              />
              <span className="text-xs font-medium text-slate-200 hidden lg:inline max-w-[100px] truncate">
                {currentUser.name.split(' ')[0]}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden lg:inline" />
            </button>

            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 p-2 text-xs space-y-2 animate-fadeIn">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <div className="font-semibold text-slate-200 truncate">{currentUser.name}</div>
                    <div className="text-slate-400 text-[11px] truncate">{currentUser.email}</div>
                    <div className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] font-mono uppercase font-semibold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                      <Shield className="w-3 h-3" />
                      {currentUser.role} · {currentUser.title}
                    </div>
                  </div>

                  <div className="px-2 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Switch Test Account
                  </div>

                  <div className="space-y-1">
                    {users.map((u) => {
                      const isCurrent = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u.id);
                            setIsUserMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                            isCurrent
                              ? 'bg-slate-800 text-white font-medium'
                              : 'text-slate-300 hover:bg-slate-800/60'
                          }`}
                        >
                          <img
                            src={u.avatar}
                            alt={u.name}
                            referrerPolicy="no-referrer"
                            className="w-6 h-6 rounded-md object-cover shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-xs font-medium">{u.name}</div>
                            <div className="text-[10px] text-slate-400 capitalize">{u.role}</div>
                          </div>
                          {isCurrent && <span className="text-indigo-400 text-xs">✓</span>}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-1">
                    <button
                      onClick={() => {
                        setIsShortcutsOpen(true);
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg text-left"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>Keyboard Shortcuts (?)</span>
                    </button>
                    <button
                      onClick={() => {
                        resetToDefaults();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-amber-300 hover:bg-slate-800/60 rounded-lg text-left"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Demo Data</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sub-Nav */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 px-2 py-1.5 bg-slate-950/60 text-xs">
        {(['board', 'list', 'calendar', 'analytics'] as ViewMode[]).map((view) => {
          const labels: Record<ViewMode, string> = {
            board: 'Board',
            list: 'List',
            calendar: 'Calendar',
            analytics: 'Analytics',
          };
          const isActive = activeView === view;
          return (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-3 py-1 rounded-md transition-colors ${
                isActive ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {labels[view]}
            </button>
          );
        })}
      </div>
    </header>
  );
};
