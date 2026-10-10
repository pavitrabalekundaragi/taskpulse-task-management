import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreHorizontal,
  ChevronDown,
  Layers
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { Task, TaskStatus, TaskPriority } from '../types';

export const ListView: React.FC = () => {
  const {
    filteredTasks,
    setActiveTaskId,
    moveTaskStatus,
    deleteTask,
    bulkUpdateStatus,
    bulkDelete,
    setIsCreateOpen,
  } = useTasks();

  const { users, currentUser, canEditTask, canDeleteTask, canCreateTask } = useAuth();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const isAllSelected = filteredTasks.length > 0 && selectedIds.length === filteredTasks.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTasks.map(t => t.id));
    }
  };

  const toggleSelectOne = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]));
  };

  const getPriorityStyle = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return 'text-rose-400 font-semibold';
      case 'high':
        return 'text-amber-400 font-medium';
      case 'medium':
        return 'text-sky-400 font-medium';
      case 'low':
        return 'text-slate-400';
    }
  };

  const isOverdue = (dueDate: string, status: TaskStatus) => {
    if (status === 'done') return false;
    return new Date(dueDate).getTime() < new Date().setHours(0, 0, 0, 0);
  };

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Bulk Actions Floating Bar */}
        {selectedIds.length > 0 && (
          <div className="bg-indigo-950/80 border border-indigo-500/50 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs animate-fadeIn shadow-lg">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-indigo-300 font-mono tabular-nums">
                {selectedIds.length} tasks selected
              </span>
              <button
                onClick={() => setSelectedIds([])}
                className="text-slate-400 hover:text-slate-200 underline"
              >
                Deselect all
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  bulkUpdateStatus(selectedIds, 'done');
                  setSelectedIds([]);
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-1.5 font-medium"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mark as Done
              </button>

              <button
                onClick={() => {
                  bulkUpdateStatus(selectedIds, 'in_progress');
                  setSelectedIds([]);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center gap-1.5 font-medium"
              >
                <Layers className="w-3.5 h-3.5" />
                Set In Progress
              </button>

              {currentUser.role === 'admin' && (
                <button
                  onClick={() => {
                    bulkDelete(selectedIds);
                    setSelectedIds([]);
                  }}
                  className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg transition-colors flex items-center gap-1.5 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Selected
                </button>
              )}
            </div>
          </div>
        )}

        {/* Data Table Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-semibold select-none">
                  <th className="py-3 px-4 w-10 text-center">
                    <button
                      onClick={toggleSelectAll}
                      className="text-slate-400 hover:text-slate-200"
                      title="Select all"
                    >
                      {isAllSelected ? (
                        <CheckSquare className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-3 w-24 font-mono">Code</th>
                  <th className="py-3 px-3">Title & Tags</th>
                  <th className="py-3 px-3 w-32">Status</th>
                  <th className="py-3 px-3 w-28">Priority</th>
                  <th className="py-3 px-3 w-40">Assignee</th>
                  <th className="py-3 px-3 w-28 font-mono">Checklist</th>
                  <th className="py-3 px-3 w-32 font-mono">Due Date</th>
                  <th className="py-3 px-3 w-24 text-right font-mono">Hours</th>
                  <th className="py-3 px-4 w-16 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-500">
                      No matching tasks found.
                      {canCreateTask() && (
                        <div className="mt-2">
                          <button
                            onClick={() => setIsCreateOpen(true)}
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                          >
                            + Create a new task
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => {
                    const isSelected = selectedIds.includes(task.id);
                    const assignee = users.find(u => u.id === task.assigneeId);
                    const completedSubs = task.subtasks.filter(s => s.completed).length;
                    const totalSubs = task.subtasks.length;
                    const overdue = isOverdue(task.dueDate, task.status);

                    return (
                      <tr
                        key={task.id}
                        onClick={() => setActiveTaskId(task.id)}
                        className={`group hover:bg-slate-800/50 transition-colors cursor-pointer ${
                          isSelected ? 'bg-indigo-950/20' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td
                          className="py-3 px-4 text-center"
                          onClick={(e) => toggleSelectOne(e, task.id)}
                        >
                          <button className="text-slate-400 hover:text-slate-200">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-indigo-400" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                            )}
                          </button>
                        </td>

                        {/* Code */}
                        <td className="py-3 px-3 font-mono text-slate-300 font-semibold">
                          {task.code}
                        </td>

                        {/* Title & Tags */}
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-200 group-hover:text-indigo-300 transition-colors line-clamp-1">
                            {task.title}
                          </div>
                          {task.tags.length > 0 && (
                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 mt-0.5">
                              {task.tags.map((t, idx) => (
                                <React.Fragment key={t}>
                                  <span>#{t}</span>
                                  {idx < task.tags.length - 1 && <span>·</span>}
                                </React.Fragment>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Status (Direct Selector) */}
                        <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={task.status}
                            disabled={!canEditTask(task)}
                            onChange={(e) => moveTaskStatus(task.id, e.target.value as any)}
                            className="bg-slate-950/80 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 capitalize"
                          >
                            <option value="backlog">Backlog</option>
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="in_review">In Review</option>
                            <option value="done">Done</option>
                          </select>
                        </td>

                        {/* Priority */}
                        <td className="py-3 px-3">
                          <span className={`capitalize ${getPriorityStyle(task.priority)}`}>
                            {task.priority}
                          </span>
                        </td>

                        {/* Assignee */}
                        <td className="py-3 px-3">
                          {assignee ? (
                            <div className="flex items-center gap-2">
                              <img
                                src={assignee.avatar}
                                alt={assignee.name}
                                referrerPolicy="no-referrer"
                                className="w-5 h-5 rounded-full object-cover border border-slate-700 shrink-0"
                              />
                              <span className="text-slate-300 truncate max-w-[100px]">{assignee.name}</span>
                            </div>
                          ) : (
                            <span className="text-slate-500">Unassigned</span>
                          )}
                        </td>

                        {/* Subtasks */}
                        <td className="py-3 px-3 font-mono text-slate-400 tabular-nums">
                          {totalSubs > 0 ? (
                            <span className={completedSubs === totalSubs ? 'text-emerald-400' : 'text-slate-400'}>
                              {completedSubs}/{totalSubs}
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        {/* Due Date */}
                        <td className="py-3 px-3 font-mono tabular-nums">
                          <span className={overdue ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
                            {task.dueDate}
                          </span>
                        </td>

                        {/* Hours */}
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-400">
                          {task.loggedHours}h / {task.estimatedHours}h
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          {canDeleteTask(task) && (
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                              title="Delete task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
