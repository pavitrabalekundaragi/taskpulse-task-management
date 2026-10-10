import React, { useState } from 'react';
import {
  Plus,
  Clock,
  CheckCircle2,
  Calendar,
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  AlertCircle
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { Task, TaskStatus, TaskPriority } from '../types';

const COLUMNS: { id: TaskStatus; label: string; description: string }[] = [
  { id: 'backlog', label: 'Backlog', description: 'Queued sprint items' },
  { id: 'todo', label: 'To Do', description: 'Ready to commence' },
  { id: 'in_progress', label: 'In Progress', description: 'Active engineering' },
  { id: 'in_review', label: 'In Review', description: 'QA & peer code review' },
  { id: 'done', label: 'Done', description: 'Verified and shipped' },
];

export const KanbanView: React.FC = () => {
  const { filteredTasks, moveTaskStatus, setActiveTaskId, setIsCreateOpen } = useTasks();
  const { users, canEditTask, canCreateTask } = useAuth();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  // Group tasks by status
  const tasksByColumn = COLUMNS.reduce((acc, col) => {
    acc[col.id] = filteredTasks.filter(t => t.status === col.id);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(colId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      moveTaskStatus(taskId, targetStatus);
    }
    setDraggedTaskId(null);
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
    <div className="flex-1 overflow-x-auto p-4 sm:p-6">
      <div className="flex gap-4 min-w-[1240px] items-start pb-6">
        {COLUMNS.map((col) => {
          const colTasks = tasksByColumn[col.id] || [];
          const isDragTarget = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`w-72 sm:w-80 shrink-0 bg-slate-900/60 border rounded-xl flex flex-col max-h-[calc(100vh-175px)] transition-colors ${
                isDragTarget
                  ? 'border-indigo-500/80 bg-indigo-950/20'
                  : 'border-slate-800/80'
              }`}
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold text-slate-200 tracking-wide uppercase">
                    {col.label}
                  </h3>
                  <span className="text-[11px] font-mono tabular-nums text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                    {colTasks.length}
                  </span>
                </div>

                {canCreateTask() && (
                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
                    title={`Add task to ${col.label}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Column Task Cards */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 min-h-[140px]">
                {colTasks.length === 0 ? (
                  <div className="h-32 border border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-xs text-slate-500">No tasks in {col.label.toLowerCase()}</p>
                    {canCreateTask() && (
                      <button
                        onClick={() => setIsCreateOpen(true)}
                        className="mt-2 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                      >
                        + Create ticket
                      </button>
                    )}
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const assignee = users.find(u => u.id === task.assigneeId);
                    const completedSubs = task.subtasks.filter(s => s.completed).length;
                    const totalSubs = task.subtasks.length;
                    const overdue = isOverdue(task.dueDate, task.status);

                    return (
                      <div
                        key={task.id}
                        draggable={canEditTask(task)}
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => setActiveTaskId(task.id)}
                        className={`group bg-slate-900 border rounded-lg p-3.5 shadow-sm transition-all cursor-pointer select-none hover:border-slate-700 hover:bg-slate-850 ${
                          draggedTaskId === task.id ? 'opacity-40 border-dashed border-indigo-400' : 'border-slate-800'
                        }`}
                      >
                        {/* Card Header: Unboxed metadata line */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="text-slate-300 font-semibold">{task.code}</span>
                            <span aria-hidden="true" className="text-slate-600">·</span>
                            <span className={`capitalize ${getPriorityStyle(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>

                          {/* Quick Column Shift Controls */}
                          <div
                            className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {col.id !== 'backlog' && (
                              <button
                                onClick={() => {
                                  const prevMap: Record<TaskStatus, TaskStatus> = {
                                    backlog: 'backlog',
                                    todo: 'backlog',
                                    in_progress: 'todo',
                                    in_review: 'in_progress',
                                    done: 'in_review',
                                  };
                                  moveTaskStatus(task.id, prevMap[col.id]);
                                }}
                                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
                                title="Move left"
                              >
                                <ChevronLeft className="w-3 h-3" />
                              </button>
                            )}
                            {col.id !== 'done' && (
                              <button
                                onClick={() => {
                                  const nextMap: Record<TaskStatus, TaskStatus> = {
                                    backlog: 'todo',
                                    todo: 'in_progress',
                                    in_progress: 'in_review',
                                    in_review: 'done',
                                    done: 'done',
                                  };
                                  moveTaskStatus(task.id, nextMap[col.id]);
                                }}
                                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
                                title="Move right"
                              >
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-semibold text-slate-100 leading-snug mb-2 group-hover:text-indigo-300 transition-colors">
                          {task.title}
                        </h4>

                        {/* Description Preview */}
                        {task.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                            {task.description}
                          </p>
                        )}

                        {/* Tags (Unboxed inline text with separators) */}
                        {task.tags.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-400 mb-3">
                            {task.tags.map((tag, idx) => (
                              <React.Fragment key={tag}>
                                <span className="text-slate-400">#{tag}</span>
                                {idx < task.tags.length - 1 && <span className="text-slate-600">·</span>}
                              </React.Fragment>
                            ))}
                          </div>
                        )}

                        {/* Subtasks Progress */}
                        {totalSubs > 0 && (
                          <div className="mb-3 space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono tabular-nums">
                              <span>Checklist</span>
                              <span>{completedSubs}/{totalSubs}</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  completedSubs === totalSubs ? 'bg-emerald-500' : 'bg-indigo-500'
                                }`}
                                style={{ width: `${(completedSubs / totalSubs) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Card Footer: Due Date & Assignee Avatar */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                          <div className={`flex items-center gap-1 font-mono text-[10px] ${overdue ? 'text-rose-400 font-semibold' : 'text-slate-400'}`}>
                            {overdue ? <AlertCircle className="w-3 h-3 shrink-0" /> : <Calendar className="w-3 h-3 shrink-0 text-slate-500" />}
                            <span>{task.dueDate}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {task.loggedHours > 0 && (
                              <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                                {task.loggedHours}h / {task.estimatedHours}h
                              </span>
                            )}
                            {assignee && (
                              <img
                                src={assignee.avatar}
                                alt={assignee.name}
                                title={`Assigned to ${assignee.name}`}
                                referrerPolicy="no-referrer"
                                className="w-5 h-5 rounded-full object-cover border border-slate-700 shrink-0"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
