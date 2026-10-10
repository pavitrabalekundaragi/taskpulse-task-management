import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Task } from '../types';
import { INITIAL_USERS } from '../data/mockData';

interface AuthContextType {
  currentUser: User;
  users: User[];
  switchUser: (userId: string) => void;
  updateUserRole: (userId: string, newRole: UserRole) => void;
  canCreateTask: () => boolean;
  canEditTask: (task?: Task) => boolean;
  canDeleteTask: (task?: Task) => boolean;
  canChangeStatus: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'taskpulse_current_user_id';
const STORAGE_KEY_USERS = 'taskpulse_users_list';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USERS);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      return saved && INITIAL_USERS.some(u => u.id === saved) ? saved : INITIAL_USERS[0].id;
    } catch {
      return INITIAL_USERS[0].id;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    } catch (e) {
      console.warn('Failed saving users to localStorage', e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USER, currentUserId);
    } catch (e) {
      console.warn('Failed saving currentUserId', e);
    }
  }, [currentUserId]);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  const switchUser = (userId: string) => {
    if (users.some(u => u.id === userId)) {
      setCurrentUserId(userId);
    }
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  // Authorization checks based on current role
  const canCreateTask = () => {
    return currentUser.role === 'admin' || currentUser.role === 'member';
  };

  const canEditTask = (_task?: Task) => {
    return currentUser.role === 'admin' || currentUser.role === 'member';
  };

  const canDeleteTask = (task?: Task) => {
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'member' && task) {
      return task.reporterId === currentUser.id || task.assigneeId === currentUser.id;
    }
    return false;
  };

  const canChangeStatus = () => {
    return currentUser.role === 'admin' || currentUser.role === 'member';
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        switchUser,
        updateUserRole,
        canCreateTask,
        canEditTask,
        canDeleteTask,
        canChangeStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
