import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Task, TaskStatus, FilterState, ActivityLog, ViewMode } from '../types';
import { INITIAL_TASKS } from '../data/mockData';
import { useAuth } from './AuthContext';

export interface ToastItem {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warn' | 'error';
  timestamp: number;
}

interface TaskContextType {
  tasks: Task[];
  filteredTasks: Task[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
  activeTaskId: string | null;
  setActiveTaskId: (id: string | null) => void;
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  isTutorialOpen: boolean;
  setIsTutorialOpen: (open: boolean) => void;
  isShortcutsOpen: boolean;
  setIsShortcutsOpen: (open: boolean) => void;
  createTask: (data: Partial<Task>) => Task | null;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => boolean;
  moveTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  addComment: (taskId: string, text: string) => void;
  bulkUpdateStatus: (taskIds: string[], newStatus: TaskStatus) => void;
  bulkDelete: (taskIds: string[]) => void;
  resetToDefaults: () => void;
  exportData: (format: 'json' | 'csv') => void;
  // Real-time synchronization & simulation
  isSimulatingRealtime: boolean;
  setIsSimulatingRealtime: React.Dispatch<React.SetStateAction<boolean>>;
  triggerSimulatedUpdate: () => void;
  syncStatus: 'connected' | 'syncing' | 'offline';
  recentActivities: ActivityLog[];
  toasts: ToastItem[];
  addToast: (message: string, type?: ToastItem['type']) => void;
  removeToast: (id: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const STORAGE_KEY_TASKS = 'taskpulse_tasks_list';
const STORAGE_KEY_ACTIVITIES = 'taskpulse_activities_list';

const INITIAL_FILTERS: FilterState = {
  search: '',
  status: 'all',
  priority: 'all',
  assigneeId: 'all',
  tag: 'all',
  sortBy: 'dueDate',
  sortOrder: 'asc',
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, users, canCreateTask, canEditTask, canDeleteTask } = useAuth();

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TASKS);
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
      if (saved) return JSON.parse(saved);
      // Collect activities from initial tasks
      return INITIAL_TASKS.flatMap(t => t.activities).sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch {
      return [];
    }
  });

  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [activeView, setActiveView] = useState<ViewMode>('board');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isSimulatingRealtime, setIsSimulatingRealtime] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'offline'>('connected');
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Persistent storage save
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Failed saving tasks', e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(recentActivities.slice(0, 50)));
    } catch (e) {
      console.warn('Failed saving activities', e);
    }
  }, [recentActivities]);

  const addToast = useCallback((message: string, type: ToastItem['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts(prev => [...prev, { id, message, type, timestamp: Date.now() }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // BroadcastChannel for cross-tab sync
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    const channel = new BroadcastChannel('taskpulse_channel');

    channel.onmessage = (event) => {
      if (event.data?.type === 'SYNC_TASKS') {
        setSyncStatus('syncing');
        setTasks(event.data.tasks);
        if (event.data.activities) {
          setRecentActivities(event.data.activities);
        }
        if (event.data.toast) {
          addToast(event.data.toast.message, event.data.toast.type);
        }
        setTimeout(() => setSyncStatus('connected'), 400);
      }
    };

    return () => {
      channel.close();
    };
  }, [addToast]);

  const broadcastChange = useCallback((updatedTasks: Task[], newActivity?: ActivityLog, toastMessage?: string) => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    try {
      const channel = new BroadcastChannel('taskpulse_channel');
      channel.postMessage({
        type: 'SYNC_TASKS',
        tasks: updatedTasks,
        activities: newActivity ? [newActivity, ...recentActivities].slice(0, 50) : recentActivities,
        toast: toastMessage ? { message: toastMessage, type: 'info' } : undefined,
      });
      channel.close();
    } catch (e) {
      console.warn('BroadcastChannel error', e);
    }
  }, [recentActivities]);

  const logActivity = useCallback((action: string, taskId?: string, taskTitle?: string) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      action,
      timestamp: new Date().toISOString(),
      taskId,
      taskTitle,
    };
    setRecentActivities(prev => [newLog, ...prev].slice(0, 50));
    return newLog;
  }, [currentUser]);

  // CRUD Operations
  const createTask = (data: Partial<Task>): Task | null => {
    if (!canCreateTask()) {
      addToast('Permission denied: Viewer role cannot create tasks', 'error');
      return null;
    }

    const nextNumber = tasks.reduce((max, t) => {
      const match = t.code.match(/TP-(\d+)/);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 100) + 1;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      code: `TP-${nextNumber}`,
      title: data.title?.trim() || 'Untitled Task',
      description: data.description?.trim() || '',
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      assigneeId: data.assigneeId || currentUser.id,
      reporterId: currentUser.id,
      tags: data.tags || ['Frontend'],
      dueDate: data.dueDate || new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      estimatedHours: data.estimatedHours || 4,
      loggedHours: data.loggedHours || 0,
      subtasks: data.subtasks || [],
      comments: [],
      activities: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newTask, ...tasks];
    setTasks(updated);
    const act = logActivity(`Created ${newTask.code}: ${newTask.title}`, newTask.id, newTask.title);
    broadcastChange(updated, act, `Task ${newTask.code} created`);
    addToast(`Task ${newTask.code} created successfully`, 'success');
    return newTask;
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;

    if (!canEditTask(target)) {
      addToast('Permission denied: Viewer role cannot edit tasks', 'error');
      return;
    }

    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    setTasks(updated);
    const act = logActivity(`Updated ${target.code}: ${target.title}`, target.id, target.title);
    broadcastChange(updated, act);
    addToast(`Updated ${target.code}`, 'info');
  };

  const deleteTask = (taskId: string): boolean => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return false;

    if (!canDeleteTask(target)) {
      addToast('Permission denied: Only Admin or task owner can delete tasks', 'error');
      return false;
    }

    const updated = tasks.filter(t => t.id !== taskId);
    setTasks(updated);
    if (activeTaskId === taskId) {
      setActiveTaskId(null);
    }
    const act = logActivity(`Deleted ${target.code}: ${target.title}`);
    broadcastChange(updated, act);
    addToast(`Deleted ${target.code}`, 'warn');
    return true;
  };

  const moveTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target || target.status === newStatus) return;

    if (!canEditTask(target)) {
      addToast('Permission denied: Viewer role cannot modify task status', 'error');
      return;
    }

    const statusNames: Record<TaskStatus, string> = {
      backlog: 'Backlog',
      todo: 'To Do',
      in_progress: 'In Progress',
      in_review: 'In Review',
      done: 'Done',
    };

    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    setTasks(updated);
    const act = logActivity(`Moved ${target.code} to ${statusNames[newStatus]}`, target.id, target.title);
    broadcastChange(updated, act);
    addToast(`${target.code} moved to ${statusNames[newStatus]}`, 'info');
  };

  const addSubtask = (taskId: string, title: string) => {
    if (!title.trim()) return;
    const target = tasks.find(t => t.id === taskId);
    if (!target || !canEditTask(target)) {
      addToast('Cannot add subtask in read-only mode', 'error');
      return;
    }

    const newSub = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      title: title.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: [...t.subtasks, newSub],
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    setTasks(updated);
    broadcastChange(updated);
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target || !canEditTask(target)) {
      addToast('Cannot edit subtask in read-only mode', 'error');
      return;
    }

    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: t.subtasks.map(s => (s.id === subtaskId ? { ...s, completed: !s.completed } : s)),
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    setTasks(updated);
    broadcastChange(updated);
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target || !canEditTask(target)) return;

    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: t.subtasks.filter(s => s.id !== subtaskId),
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    setTasks(updated);
    broadcastChange(updated);
  };

  const addComment = (taskId: string, text: string) => {
    if (!text.trim()) return;
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;

    const newComment = {
      id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          comments: [...t.comments, newComment],
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    setTasks(updated);
    const act = logActivity(`Commented on ${target.code}`, target.id, target.title);
    broadcastChange(updated, act);
    addToast(`Comment added to ${target.code}`, 'info');
  };

  const bulkUpdateStatus = (taskIds: string[], newStatus: TaskStatus) => {
    if (!canCreateTask()) {
      addToast('Permission denied for bulk operations', 'error');
      return;
    }

    const updated = tasks.map(t => {
      if (taskIds.includes(t.id)) {
        return { ...t, status: newStatus, updatedAt: new Date().toISOString() };
      }
      return t;
    });

    setTasks(updated);
    const act = logActivity(`Bulk updated ${taskIds.length} tasks to ${newStatus}`);
    broadcastChange(updated, act);
    addToast(`Updated ${taskIds.length} tasks`, 'success');
  };

  const bulkDelete = (taskIds: string[]) => {
    if (currentUser.role !== 'admin') {
      addToast('Permission denied: Only Admin can perform bulk deletions', 'error');
      return;
    }

    const updated = tasks.filter(t => !taskIds.includes(t.id));
    setTasks(updated);
    const act = logActivity(`Bulk deleted ${taskIds.length} tasks`);
    broadcastChange(updated, act);
    addToast(`Deleted ${taskIds.length} tasks`, 'warn');
  };

  const resetToDefaults = () => {
    setTasks(INITIAL_TASKS);
    setRecentActivities(
      INITIAL_TASKS.flatMap(t => t.activities).sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    );
    setFilters(INITIAL_FILTERS);
    localStorage.removeItem(STORAGE_KEY_TASKS);
    localStorage.removeItem(STORAGE_KEY_ACTIVITIES);
    addToast('Reset workspace to initial sprint state', 'info');
  };

  const exportData = (format: 'json' | 'csv') => {
    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `taskpulse-export-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      addToast('Exported tasks as JSON', 'success');
    } else {
      const headers = ['Code', 'Title', 'Status', 'Priority', 'Assignee', 'DueDate', 'EstimatedHours', 'LoggedHours'];
      const rows = tasks.map(t => {
        const assignee = users.find(u => u.id === t.assigneeId)?.name || 'Unassigned';
        return [
          `"${t.code}"`,
          `"${t.title.replace(/"/g, '""')}"`,
          `"${t.status}"`,
          `"${t.priority}"`,
          `"${assignee}"`,
          `"${t.dueDate}"`,
          t.estimatedHours,
          t.loggedHours,
        ].join(',');
      });
      const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent([headers.join(','), ...rows].join('\n'));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', csvContent);
      downloadAnchor.setAttribute('download', `taskpulse-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      addToast('Exported tasks as CSV', 'success');
    }
  };

  // Real-Time Teammate Simulation
  const triggerSimulatedUpdate = useCallback(() => {
    const teammates = users.filter(u => u.id !== currentUser.id);
    if (teammates.length === 0 || tasks.length === 0) return;

    const randomTeammate = teammates[Math.floor(Math.random() * teammates.length)];
    const randomTask = tasks[Math.floor(Math.random() * tasks.length)];

    const actions = [
      'comment',
      'toggle_subtask',
      'status_shift',
      'log_hours',
    ] as const;
    const chosenAction = actions[Math.floor(Math.random() * actions.length)];

    let actionDescription = '';
    let updatedTasks = [...tasks];

    if (chosenAction === 'comment') {
      const commentTexts = [
        'Reviewed the implementation logic, looks solid.',
        'Staging build verified. No regressions detected.',
        'Updated API payload schema to match backend v2.4 specification.',
        'Ready for design review tomorrow morning.',
        'Added extra unit tests to cover timeout edge cases.',
      ];
      const commentText = commentTexts[Math.floor(Math.random() * commentTexts.length)];
      const newComment = {
        id: `c-sim-${Date.now()}`,
        userId: randomTeammate.id,
        userName: randomTeammate.name,
        userAvatar: randomTeammate.avatar,
        text: commentText,
        timestamp: new Date().toISOString(),
      };
      updatedTasks = tasks.map(t =>
        t.id === randomTask.id ? { ...t, comments: [...t.comments, newComment], updatedAt: new Date().toISOString() } : t
      );
      actionDescription = `${randomTeammate.name} commented on ${randomTask.code}`;
    } else if (chosenAction === 'toggle_subtask' && randomTask.subtasks.length > 0) {
      const randomSub = randomTask.subtasks[Math.floor(Math.random() * randomTask.subtasks.length)];
      updatedTasks = tasks.map(t => {
        if (t.id === randomTask.id) {
          return {
            ...t,
            subtasks: t.subtasks.map(s => (s.id === randomSub.id ? { ...s, completed: !s.completed } : s)),
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      });
      actionDescription = `${randomTeammate.name} updated subtask on ${randomTask.code}`;
    } else if (chosenAction === 'status_shift') {
      const statusCycle: Record<TaskStatus, TaskStatus> = {
        backlog: 'todo',
        todo: 'in_progress',
        in_progress: 'in_review',
        in_review: 'done',
        done: 'in_progress',
      };
      const nextStatus = statusCycle[randomTask.status];
      updatedTasks = tasks.map(t =>
        t.id === randomTask.id ? { ...t, status: nextStatus, updatedAt: new Date().toISOString() } : t
      );
      actionDescription = `${randomTeammate.name} shifted ${randomTask.code} to ${nextStatus.replace('_', ' ')}`;
    } else {
      updatedTasks = tasks.map(t =>
        t.id === randomTask.id ? { ...t, loggedHours: t.loggedHours + 1, updatedAt: new Date().toISOString() } : t
      );
      actionDescription = `${randomTeammate.name} logged 1h work on ${randomTask.code}`;
    }

    setTasks(updatedTasks);
    const simulatedActivity: ActivityLog = {
      id: `act-sim-${Date.now()}`,
      userId: randomTeammate.id,
      userName: randomTeammate.name,
      userAvatar: randomTeammate.avatar,
      action: actionDescription,
      timestamp: new Date().toISOString(),
      taskId: randomTask.id,
      taskTitle: randomTask.title,
    };
    setRecentActivities(prev => [simulatedActivity, ...prev].slice(0, 50));
    addToast(actionDescription, 'info');
  }, [users, currentUser, tasks, addToast]);

  // Periodic simulation timer
  useEffect(() => {
    if (!isSimulatingRealtime) return;
    const interval = setInterval(() => {
      triggerSimulatedUpdate();
    }, 28000); // Trigger every 28 seconds quietly
    return () => clearInterval(interval);
  }, [isSimulatingRealtime, triggerSimulatedUpdate]);

  // Filtering and Sorting
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const matchesTitle = task.title.toLowerCase().includes(q);
          const matchesCode = task.code.toLowerCase().includes(q);
          const matchesDesc = task.description.toLowerCase().includes(q);
          const matchesTag = task.tags.some(t => t.toLowerCase().includes(q));
          if (!matchesTitle && !matchesCode && !matchesDesc && !matchesTag) return false;
        }

        if (filters.status !== 'all' && task.status !== filters.status) {
          return false;
        }

        if (filters.priority !== 'all' && task.priority !== filters.priority) {
          return false;
        }

        if (filters.assigneeId !== 'all' && task.assigneeId !== filters.assigneeId) {
          return false;
        }

        if (filters.tag !== 'all' && !task.tags.includes(filters.tag)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const order = filters.sortOrder === 'asc' ? 1 : -1;
        if (filters.sortBy === 'dueDate') {
          return order * (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        }
        if (filters.sortBy === 'priority') {
          const pOrder: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
          return order * (pOrder[b.priority] - pOrder[a.priority]);
        }
        if (filters.sortBy === 'title') {
          return order * a.title.localeCompare(b.title);
        }
        if (filters.sortBy === 'code') {
          return order * a.code.localeCompare(b.code);
        }
        return order * (new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      });
  }, [tasks, filters]);

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        filteredTasks,
        filters,
        setFilters,
        resetFilters,
        activeView,
        setActiveView,
        activeTaskId,
        setActiveTaskId,
        isCreateOpen,
        setIsCreateOpen,
        isTutorialOpen,
        setIsTutorialOpen,
        isShortcutsOpen,
        setIsShortcutsOpen,
        createTask,
        updateTask,
        deleteTask,
        moveTaskStatus,
        addSubtask,
        toggleSubtask,
        deleteSubtask,
        addComment,
        bulkUpdateStatus,
        bulkDelete,
        resetToDefaults,
        exportData,
        isSimulatingRealtime,
        setIsSimulatingRealtime,
        triggerSimulatedUpdate,
        syncStatus,
        recentActivities,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
