import React, { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider, useTasks } from './context/TaskContext';
import { TopNav } from './components/TopNav';
import { TutorialBanner } from './components/TutorialBanner';
import { WorkspaceToolbar } from './components/WorkspaceToolbar';
import { KanbanView } from './components/KanbanView';
import { ListView } from './components/ListView';
import { CalendarView } from './components/CalendarView';
import { AnalyticsView } from './components/AnalyticsView';
import { TaskTutorialModal } from './components/TaskTutorialModal';
import { CreateTaskModal } from './components/CreateTaskModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { ToastContainer } from './components/ToastContainer';

const MainWorkspace: React.FC = () => {
  const {
    activeView,
    setActiveView,
    setIsCreateOpen,
    setIsTutorialOpen,
    setIsShortcutsOpen,
    setActiveTaskId,
  } = useTasks();

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when user is typing inside an input or textarea
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      if (e.key === 'Escape') {
        setActiveTaskId(null);
        setIsCreateOpen(false);
        setIsTutorialOpen(false);
        setIsShortcutsOpen(false);
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsCreateOpen(true);
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setIsTutorialOpen(true);
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(true);
      } else if (e.key === '1') {
        setActiveView('board');
      } else if (e.key === '2') {
        setActiveView('list');
      } else if (e.key === '3') {
        setActiveView('calendar');
      } else if (e.key === '4') {
        setActiveView('analytics');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTaskId, setIsCreateOpen, setIsTutorialOpen, setIsShortcutsOpen, setActiveView]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar */}
      <TopNav />

      {/* Tutorial Banner */}
      <TutorialBanner />

      {/* Workspace Toolbar (Search & Filters) */}
      <WorkspaceToolbar />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {activeView === 'board' && <KanbanView />}
        {activeView === 'list' && <ListView />}
        {activeView === 'calendar' && <CalendarView />}
        {activeView === 'analytics' && <AnalyticsView />}
      </main>

      {/* Modals & Overlays */}
      <TaskTutorialModal />
      <CreateTaskModal />
      <TaskDetailModal />
      <KeyboardShortcutsModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <MainWorkspace />
      </TaskProvider>
    </AuthProvider>
  );
}
