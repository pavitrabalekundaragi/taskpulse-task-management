import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  Plus,
  Send,
  AlertCircle,
  Tag,
  User,
  MessageSquare,
  History
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { TaskStatus, TaskPriority } from '../types';
import { AVAILABLE_TAGS } from '../data/mockData';

export const TaskDetailModal: React.FC = () => {
  const {
    activeTaskId,
    setActiveTaskId,
    tasks,
    updateTask,
    deleteTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    addComment,
    moveTaskStatus,
  } = useTasks();

  const { users, currentUser, canEditTask, canDeleteTask } = useAuth();

  const task = tasks.find(t => t.id === activeTaskId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(0);
  const [loggedHours, setLoggedHours] = useState(0);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'history'>('details');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setPriority(task.priority);
      setAssigneeId(task.assigneeId);
      setDueDate(task.dueDate);
      setEstimatedHours(task.estimatedHours);
      setLoggedHours(task.loggedHours);
    }
  }, [task]);

  if (!task) return null;

  const isEditable = canEditTask(task);
  const isDeletable = canDeleteTask(task);

  const handleSaveFields = () => {
    if (!isEditable) return;
    updateTask(task.id, {
      title,
      description,
      status,
      priority,
      assigneeId,
      dueDate,
      estimatedHours: Number(estimatedHours),
      loggedHours: Number(loggedHours),
    });
  };

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !isEditable) return;
    addSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    addComment(task.id, newCommentText.trim());
    setNewCommentText('');
  };

  const handleToggleTag = (tag: string) => {
    if (!isEditable) return;
    const exists = task.tags.includes(tag);
    const updatedTags = exists ? task.tags.filter(t => t !== tag) : [...task.tags, tag];
    updateTask(task.id, { tags: updatedTags });
  };

  const completedSubs = task.subtasks.filter(s => s.completed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
              {task.code}
            </span>
            <select
              value={task.status}
              disabled={!isEditable}
              onChange={(e) => moveTaskStatus(task.id, e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 capitalize focus:outline-none focus:border-indigo-500"
            >
              <option value="backlog">Backlog</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {isDeletable && (
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${task.code}?`)) {
                    deleteTask(task.id);
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setActiveTaskId(null)}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 px-6 pt-3 border-b border-slate-800 bg-slate-950/40 text-xs">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-2.5 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'details'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Overview & Checklist</span>
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`pb-2.5 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'comments'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Comments ({task.comments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Title Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Task Title
                </label>
                <input
                  type="text"
                  value={title}
                  disabled={!isEditable}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleSaveFields}
                  placeholder="Task title"
                  className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-lg text-sm font-semibold text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Description Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Description & Technical Specifications
                </label>
                <textarea
                  rows={3}
                  value={description}
                  disabled={!isEditable}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={handleSaveFields}
                  placeholder="Provide technical context, acceptance criteria, or reproduction steps..."
                  className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              {/* Metadata 2-Column Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl">
                {/* Priority */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400">Priority Level</label>
                  <select
                    value={priority}
                    disabled={!isEditable}
                    onChange={(e) => {
                      setPriority(e.target.value as any);
                      updateTask(task.id, { priority: e.target.value as any });
                    }}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 capitalize focus:outline-none focus:border-indigo-500"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                {/* Assignee */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400">Assignee</label>
                  <select
                    value={assigneeId}
                    disabled={!isEditable}
                    onChange={(e) => {
                      setAssigneeId(e.target.value);
                      updateTask(task.id, { assigneeId: e.target.value });
                    }}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Due Date */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    disabled={!isEditable}
                    onChange={(e) => {
                      setDueDate(e.target.value);
                      updateTask(task.id, { dueDate: e.target.value });
                    }}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Estimated vs Logged Hours */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400">Effort (Logged / Est. Hours)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={loggedHours}
                      disabled={!isEditable}
                      onChange={(e) => setLoggedHours(Number(e.target.value))}
                      onBlur={handleSaveFields}
                      className="w-1/2 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono tabular-nums text-slate-200"
                      title="Logged Hours"
                    />
                    <span className="text-slate-500 font-mono">/</span>
                    <input
                      type="number"
                      min={1}
                      value={estimatedHours}
                      disabled={!isEditable}
                      onChange={(e) => setEstimatedHours(Number(e.target.value))}
                      onBlur={handleSaveFields}
                      className="w-1/2 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono tabular-nums text-slate-200"
                      title="Estimated Hours"
                    />
                  </div>
                </div>
              </div>

              {/* Tags Section */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-500" />
                  <span>Tags & Domain Labels</span>
                </label>
                <div className="flex flex-wrap items-center gap-1.5">
                  {AVAILABLE_TAGS.map(t => {
                    const isSelected = task.tags.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        disabled={!isEditable}
                        onClick={() => handleToggleTag(t)}
                        className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                          isSelected
                            ? 'bg-indigo-600/30 border border-indigo-500/50 text-indigo-300'
                            : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        #{t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Checklist / Subtasks */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Checklist & Subtasks</span>
                  </label>
                  <span className="text-xs font-mono text-slate-400 tabular-nums">
                    {completedSubs} of {task.subtasks.length} done
                  </span>
                </div>

                {/* Subtask list */}
                <div className="space-y-1.5">
                  {task.subtasks.map(sub => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs group"
                    >
                      <label className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sub.completed}
                          disabled={!isEditable}
                          onChange={() => toggleSubtask(task.id, sub.id)}
                          className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-0 focus:ring-offset-0 bg-slate-900"
                        />
                        <span className={`truncate ${sub.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                          {sub.title}
                        </span>
                      </label>
                      {isEditable && (
                        <button
                          onClick={() => deleteSubtask(task.id, sub.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Subtask Input */}
                {isEditable && (
                  <form onSubmit={handleAddSubtaskSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      placeholder="Add subtask and press Enter..."
                      className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={!newSubtaskTitle.trim()}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                    >
                      Add
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {task.comments.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">
                    No comments yet. Start the conversation below.
                  </div>
                ) : (
                  task.comments.map(c => (
                    <div key={c.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={c.userAvatar}
                            alt={c.userName}
                            referrerPolicy="no-referrer"
                            className="w-5 h-5 rounded-full object-cover border border-slate-700"
                          />
                          <span className="font-semibold text-slate-200">{c.userName}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(c.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed pl-7">{c.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddCommentSubmit} className="space-y-2 pt-2">
                <textarea
                  rows={2}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Add a comment or status update..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newCommentText.trim()}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post Comment</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              {task.activities.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No logged activity history for this ticket yet.
                </div>
              ) : (
                task.activities.map(act => (
                  <div key={act.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-start gap-3 text-xs">
                    <img
                      src={act.userAvatar}
                      alt={act.userName}
                      referrerPolicy="no-referrer"
                      className="w-5 h-5 rounded-md object-cover border border-slate-700 shrink-0 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="text-slate-300">
                        <span className="font-semibold text-slate-200">{act.userName}</span> {act.action}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-1">
                        {new Date(act.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="text-xs text-slate-400 font-mono">
            Created: {new Date(task.createdAt).toLocaleDateString()}
          </div>
          <button
            onClick={() => {
              handleSaveFields();
              setActiveTaskId(null);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
