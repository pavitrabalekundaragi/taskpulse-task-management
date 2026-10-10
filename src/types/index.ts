export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done';

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export type UserRole = 'admin' | 'member' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  title: string;
  department: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: string;
  timestamp: string;
  taskId?: string;
  taskTitle?: string;
}

export interface Task {
  id: string;
  code: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  reporterId: string;
  tags: string[];
  dueDate: string; // YYYY-MM-DD
  estimatedHours: number;
  loggedHours: number;
  subtasks: Subtask[];
  comments: TaskComment[];
  activities: ActivityLog[];
  createdAt: string;
  updatedAt: string;
}

export interface FilterState {
  search: string;
  status: 'all' | TaskStatus;
  priority: 'all' | TaskPriority;
  assigneeId: 'all' | string;
  tag: 'all' | string;
  sortBy: 'dueDate' | 'priority' | 'updatedAt' | 'title' | 'code';
  sortOrder: 'asc' | 'desc';
}

export type ViewMode = 'board' | 'list' | 'calendar' | 'analytics';
