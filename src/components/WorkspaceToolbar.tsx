import React, { useState } from 'react';
import {
  Search,
  Filter,
  X,
  Radio,
  Download,
  Sparkles,
  ArrowUpDown,
  Check,
  ChevronDown
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { TaskStatus, TaskPriority } from '../types';
import { AVAILABLE_TAGS } from '../data/mockData';

export const WorkspaceToolbar: React.FC = () => {
  const {
    filters,
    setFilters,
    resetFilters,
    tasks,
    filteredTasks,
    syncStatus,
    isSimulatingRealtime,
    setIsSimulatingRealtime,
    triggerSimulatedUpdate,
    exportData,
  } = useTasks();

  const { users } = useAuth();
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const hasActiveFilters =
    filters.search !== '' ||
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.assigneeId !== 'all' ||
    filters.tag !== 'all';

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Search & Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search code, title, tags..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950/70 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
            {filters.search && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
            className="px-2.5 py-1.5 bg-slate-950/70 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="backlog">Backlog</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="done">Done</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value as any }))}
            className="px-2.5 py-1.5 bg-slate-950/70 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Assignee Filter */}
          <select
            value={filters.assigneeId}
            onChange={(e) => setFilters(prev => ({ ...prev, assigneeId: e.target.value }))}
            className="px-2.5 py-1.5 bg-slate-950/70 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Assignees</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          {/* Tag Filter */}
          <select
            value={filters.tag}
            onChange={(e) => setFilters(prev => ({ ...prev, tag: e.target.value }))}
            className="px-2.5 py-1.5 bg-slate-950/70 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Tags</option>
            {AVAILABLE_TAGS.map(tag => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>

          {/* Sort Control */}
          <div className="flex items-center gap-1 bg-slate-950/70 border border-slate-800 rounded-lg px-2 py-1">
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="bg-transparent text-xs text-slate-300 focus:outline-none pr-1"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="code">Code</option>
              <option value="title">Title</option>
            </select>
            <button
              onClick={() => setFilters(prev => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }))}
              className="text-[11px] font-mono text-slate-400 hover:text-slate-200 px-1 uppercase"
              title="Toggle sort direction"
            >
              {filters.sortOrder}
            </button>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-2 py-1 text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right: Live Sync & Teammate Activity Trigger & Export */}
        <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
          {/* Item count */}
          <div className="text-xs text-slate-400 font-mono tabular-nums">
            {filteredTasks.length} / {tasks.length} tasks
          </div>

          {/* Live Sync Status */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                syncStatus === 'connected'
                  ? 'bg-emerald-500'
                  : syncStatus === 'syncing'
                  ? 'bg-amber-500 animate-ping'
                  : 'bg-rose-500'
              }`}
            />
            <span className="text-slate-300 text-[11px] hidden sm:inline">
              {syncStatus === 'connected' ? 'Live Sync' : 'Syncing...'}
            </span>
            <button
              onClick={triggerSimulatedUpdate}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 pl-1 border-l border-slate-800 transition-colors"
              title="Simulate teammate interaction"
            >
              <Sparkles className="w-3 h-3" />
              <span>Simulate</span>
            </button>
          </div>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 rounded-lg text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isExportMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsExportMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-36 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-50 p-1 text-xs space-y-1">
                  <button
                    onClick={() => {
                      exportData('csv');
                      setIsExportMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => {
                      exportData('json');
                      setIsExportMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    Export as JSON
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
