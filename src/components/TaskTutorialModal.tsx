import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Radio,
  FileCode2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ArrowRight,
  UserCheck,
  ListTodo
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';

interface Chapter {
  id: number;
  title: string;
  tagline: string;
  description: string;
  duration: string;
  keyConcepts: string[];
  codeSnippet?: string;
}

const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: 'Architecture & Authorization Model',
    tagline: 'Multi-Role RBAC & Full-Stack Security',
    description: 'Learn how modern task management apps enforce Role-Based Access Control (RBAC). Admins possess deletion rights and user management; Members execute sprint workflows; Viewers audit and comment without mutation rights.',
    duration: '01:45',
    keyConcepts: [
      'Token-based authorization & header guards',
      'Granular permissions (Admin vs Member vs Viewer)',
      'Optimistic state reconciliation on the frontend',
    ],
    codeSnippet: `// Permission Guard Contract
function canMutateTask(user: User, task: Task): boolean {
  if (user.role === 'admin') return true;
  if (user.role === 'member') {
    return task.assigneeId === user.id || task.reporterId === user.id;
  }
  return false; // Viewers strictly read-only
}`,
  },
  {
    id: 2,
    title: 'Task Lifecycle & CRUD Mutations',
    tagline: 'Rich Metadata, Checklists & Workload Tracking',
    description: 'Master full-cycle CRUD operations: creating sprint tickets with priority weights, decomposing work into checklist subtasks, logging actual vs estimated work hours, and maintaining timestamped audit trails.',
    duration: '02:15',
    keyConcepts: [
      'Input sanitization & code ticket generation (e.g. TP-101)',
      'Subtask checklist completion percentage calculation',
      'Audit log appending on every mutation',
    ],
    codeSnippet: `// Task Mutation Payload
const taskPayload = {
  title: "Implement PKCE auth flow",
  priority: "urgent",
  status: "in_progress",
  dueDate: "2026-10-14",
  subtasks: [{ id: "s1", title: "Generate challenge", completed: true }]
};`,
  },
  {
    id: 3,
    title: 'Kanban State Flow & Views',
    tagline: 'Board, List, Calendar & Analytics',
    description: 'Understand how tasks transition across standard stages: Backlog → To Do → In Progress → In Review → Done. Switch seamlessly between agile Kanban board, dense tabular list, deadline calendar, and burndown analytics.',
    duration: '02:00',
    keyConcepts: [
      'State machines for task status transitions',
      'High-density data tables with tabular figures',
      'Burndown & velocity tracking metrics',
    ],
    codeSnippet: `// Status Transition State Machine
const VALID_TRANSITIONS = {
  backlog: ['todo'],
  todo: ['in_progress'],
  in_progress: ['in_review', 'todo'],
  in_review: ['done', 'in_progress'],
  done: ['in_progress']
};`,
  },
  {
    id: 4,
    title: 'Real-Time Sync & WebSocket Protocol',
    tagline: 'Live Multi-Client Event Broadcasts',
    description: 'Discover how concurrent users collaborate in real-time. Changes broadcast via WebSocket / BroadcastChannel events to prevent stale state, with instant toast feedback and live activity streams.',
    duration: '02:30',
    keyConcepts: [
      'WebSocket bi-directional event dispatch',
      'Cross-tab synchronization with BroadcastChannel',
      'Simulated concurrent teammate activity engine',
    ],
    codeSnippet: `// WebSocket Event Broadcast
channel.postMessage({
  type: 'SYNC_TASKS',
  action: 'TASK_MOVED',
  payload: { taskId: 'task-101', newStatus: 'in_review' },
  sender: currentUser.name
});`,
  },
];

export const TaskTutorialModal: React.FC = () => {
  const { isTutorialOpen, setIsTutorialOpen, tasks, moveTaskStatus, addToast } = useTasks();
  const { currentUser, switchUser, users } = useAuth();

  const [activeTab, setActiveTab] = useState<'video' | 'sandbox' | 'api'>('video');
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1);

  // Sandbox Challenge State
  const [sandboxSteps, setSandboxSteps] = useState({
    movedTask: false,
    checkedSubtask: false,
    testedViewerRole: false,
  });

  const activeChapter = CHAPTERS[activeChapterIndex];

  // Simulated video playback scrubber
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setPlaybackProgress(prev => {
          if (prev >= 100) {
            if (activeChapterIndex < CHAPTERS.length - 1) {
              setActiveChapterIndex(i => i + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return 100;
            }
          }
          return prev + 1.8 * playbackSpeed;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, activeChapterIndex]);

  if (!isTutorialOpen) return null;

  const handleStepComplete = (key: keyof typeof sandboxSteps) => {
    setSandboxSteps(prev => ({ ...prev, [key]: true }));
    addToast('Tutorial step completed!', 'success');
  };

  const allCompleted = sandboxSteps.movedTask && sandboxSteps.checkedSubtask && sandboxSteps.testedViewerRole;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Watch Task Tutorial & Developer Guide</h2>
              <p className="text-xs text-slate-400">Interactive walkthrough of full-stack architecture, RBAC, and real-time collaboration</p>
            </div>
          </div>
          <button
            onClick={() => setIsTutorialOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
            title="Close Tutorial (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-6 pt-3 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('video')}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'video'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t-md'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              Video Walkthrough Simulation
            </button>
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'sandbox'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t-md'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Hands-On Sandbox
              {allCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'api'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t-md'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              API Specs & Architecture
            </button>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Module {activeChapter.id} of {CHAPTERS.length}
          </span>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'video' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Player Canvas */}
              <div className="lg:col-span-2 space-y-4">
                {/* Simulated Screen Canvas */}
                <div className="relative aspect-video bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between p-5 shadow-inner">
                  {/* Canvas Header */}
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      <span className="ml-2 font-mono text-[11px] text-slate-400">taskpulse://sprint-14/tutorial</span>
                    </div>
                    <span className="font-mono text-indigo-400 text-[11px]">{activeChapter.tagline}</span>
                  </div>

                  {/* Simulated Stage Visuals */}
                  <div className="flex-1 flex flex-col justify-center items-center py-6 px-4 text-center">
                    {activeChapter.id === 1 && (
                      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3 shadow-lg">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="text-xs font-semibold text-slate-300">Role-Based Access Control</span>
                          <span className="text-[10px] font-mono text-emerald-400">RBAC Gate Verified</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="p-2 bg-slate-800/60 rounded border border-indigo-500/30">
                            <div className="font-semibold text-indigo-300">Admin</div>
                            <div className="text-[10px] text-slate-400">Full Mutate & Delete</div>
                          </div>
                          <div className="p-2 bg-slate-800/60 rounded border border-slate-700">
                            <div className="font-semibold text-slate-200">Member</div>
                            <div className="text-[10px] text-slate-400">Create & Update</div>
                          </div>
                          <div className="p-2 bg-slate-800/60 rounded border border-slate-700">
                            <div className="font-semibold text-slate-400">Viewer</div>
                            <div className="text-[10px] text-slate-400">Read & Comment</div>
                          </div>
                        </div>
                        <div className="text-left text-[11px] font-mono text-slate-400 bg-slate-950 p-2.5 rounded">
                          &gt; Current Session: <span className="text-indigo-400">{currentUser.name}</span> ({currentUser.role})
                        </div>
                      </div>
                    )}

                    {activeChapter.id === 2 && (
                      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3 shadow-lg text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-indigo-400">TP-101 (CRUD Pipeline)</span>
                          <span className="text-[10px] text-rose-400 font-mono">PRIORITY: URGENT</span>
                        </div>
                        <div className="text-xs text-slate-200 font-medium">Implement OAuth token refresh with PKCE flow</div>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2 text-slate-400">
                            <span className="text-emerald-400 text-xs">✓</span> Generate cryptographic code verifiers
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <span className="text-emerald-400 text-xs">✓</span> Sliding window token expiry interceptor
                          </div>
                          <div className="flex items-center gap-2 text-slate-300">
                            <span className="text-amber-400 text-xs">○</span> Integration test suite for revocation
                          </div>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full w-2/3" />
                        </div>
                      </div>
                    )}

                    {activeChapter.id === 3 && (
                      <div className="w-full max-w-lg grid grid-cols-4 gap-2 text-left">
                        {['Backlog', 'To Do', 'In Progress', 'Done'].map((col, idx) => (
                          <div key={col} className="bg-slate-900 border border-slate-800 p-2 rounded text-xs space-y-2">
                            <div className="font-semibold text-[11px] text-slate-400 flex items-center justify-between">
                              <span>{col}</span>
                              <span className="font-mono text-[10px]">{idx === 2 ? 2 : 1}</span>
                            </div>
                            <div className={`p-2 rounded text-[10px] border ${idx === 2 ? 'bg-indigo-950/40 border-indigo-500/40 text-slate-200' : 'bg-slate-800/60 border-slate-700/60 text-slate-400'}`}>
                              TP-10{idx + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeChapter.id === 4 && (
                      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3 shadow-lg">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-300">Live Socket Event Stream</span>
                          <span className="font-mono text-emerald-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Connected (12ms)
                          </span>
                        </div>
                        <div className="space-y-1.5 font-mono text-[11px] text-left">
                          <div className="text-slate-400 bg-slate-950/80 p-1.5 rounded">
                            <span className="text-indigo-400">broadcast:</span> Marcus Chen moved TP-101 to In Review
                          </div>
                          <div className="text-slate-400 bg-slate-950/80 p-1.5 rounded">
                            <span className="text-indigo-400">broadcast:</span> Sophia Martinez added comment on TP-102
                          </div>
                          <div className="text-slate-400 bg-slate-950/80 p-1.5 rounded">
                            <span className="text-indigo-400">ack:</span> Client synchronized (BroadcastChannel)
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Player Controls Bar */}
                  <div className="border-t border-slate-800/80 pt-3 space-y-2">
                    {/* Scrubber */}
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const percent = (clickX / rect.width) * 100;
                      setPlaybackProgress(Math.max(0, Math.min(100, percent)));
                    }}>
                      <div
                        className="bg-indigo-500 h-full transition-all duration-100"
                        style={{ width: `${playbackProgress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                        </button>
                        <button
                          onClick={() => setPlaybackProgress(0)}
                          className="p-1.5 hover:bg-slate-800 text-slate-300 rounded transition-colors"
                          title="Restart Chapter"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <span className="font-mono text-[11px]">
                          {Math.floor((playbackProgress / 100) * 120)}s / 120s
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">Speed:</span>
                        {[1, 1.5, 2].map(speed => (
                          <button
                            key={speed}
                            onClick={() => setPlaybackSpeed(speed as any)}
                            className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                              playbackSpeed === speed
                                ? 'bg-slate-700 text-white font-medium'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chapter Description & Concepts */}
                <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-200">{activeChapter.title}</h3>
                    <span className="text-xs font-mono text-slate-400">Duration: {activeChapter.duration}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{activeChapter.description}</p>
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Key Engineering Takeaways:</span>
                    <ul className="space-y-1 text-xs text-slate-400">
                      {activeChapter.keyConcepts.map((concept, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="text-indigo-400">·</span>
                          {concept}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Right Col: Chapter Playlist */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Course Modules
                </div>
                <div className="space-y-2">
                  {CHAPTERS.map((ch, idx) => {
                    const isActive = idx === activeChapterIndex;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => {
                          setActiveChapterIndex(idx);
                          setPlaybackProgress(0);
                          setIsPlaying(true);
                        }}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                          isActive
                            ? 'bg-indigo-950/30 border-indigo-500/40 text-slate-100 shadow-sm'
                            : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono shrink-0 mt-0.5 ${
                          isActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {ch.id}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold truncate text-slate-200">{ch.title}</div>
                          <div className="text-[11px] text-slate-400 truncate">{ch.tagline}</div>
                          <div className="text-[10px] font-mono text-slate-400 mt-1">{ch.duration}</div>
                        </div>
                        {isActive && <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0 self-center" />}
                      </button>
                    );
                  })}
                </div>

                {/* Chapter Code Preview */}
                {activeChapter.codeSnippet && (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                    <span className="text-[11px] font-mono text-indigo-400 font-medium">Architecture Snippet</span>
                    <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto p-2 bg-slate-900 rounded border border-slate-800/80">
                      <code>{activeChapter.codeSnippet}</code>
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'sandbox' && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">Interactive Hands-on Practice</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Try the three foundational task management interactions below to verify your skills.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-mono font-semibold text-indigo-400">
                      {Object.values(sandboxSteps).filter(Boolean).length} / 3 Completed
                    </div>
                    <div className="text-[11px] text-slate-400">Mastery Progress</div>
                  </div>
                  <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full transition-all"
                      style={{
                        width: `${(Object.values(sandboxSteps).filter(Boolean).length / 3) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 3 Step Challenges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Challenge 1 */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between space-y-4 ${
                  sandboxSteps.movedTask ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-slate-950/40 border-slate-800'
                }`}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-400">Challenge 1</span>
                      {sandboxSteps.movedTask ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                      )}
                    </div>
                    <h4 className="text-xs font-semibold text-slate-200">State Transition Test</h4>
                    <p className="text-xs text-slate-400">
                      Move the first sprint task (TP-101) directly to 'In Review' to practice status workflow.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (tasks.length > 0) {
                        moveTaskStatus(tasks[0].id, 'in_review');
                        handleStepComplete('movedTask');
                      }
                    }}
                    className="w-full py-2 px-3 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Trigger Move to In Review
                  </button>
                </div>

                {/* Challenge 2 */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between space-y-4 ${
                  sandboxSteps.checkedSubtask ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-slate-950/40 border-slate-800'
                }`}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-400">Challenge 2</span>
                      {sandboxSteps.checkedSubtask ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                      )}
                    </div>
                    <h4 className="text-xs font-semibold text-slate-200">Subtask Completion</h4>
                    <p className="text-xs text-slate-400">
                      Complete a checklist subtask to practice dynamic progress bar updates.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handleStepComplete('checkedSubtask');
                    }}
                    className="w-full py-2 px-3 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ListTodo className="w-3.5 h-3.5" />
                    Verify Checklist Calculation
                  </button>
                </div>

                {/* Challenge 3 */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between space-y-4 ${
                  sandboxSteps.testedViewerRole ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-slate-950/40 border-slate-800'
                }`}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-400">Challenge 3</span>
                      {sandboxSteps.testedViewerRole ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                      )}
                    </div>
                    <h4 className="text-xs font-semibold text-slate-200">Role Authorization</h4>
                    <p className="text-xs text-slate-400">
                      Switch active profile to Leo Vance (Viewer) to see how authorization locks creation & deletion.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const leo = users.find(u => u.role === 'viewer') || users[3];
                      switchUser(leo.id);
                      handleStepComplete('testedViewerRole');
                    }}
                    className="w-full py-2 px-3 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Switch to Viewer Profile
                  </button>
                </div>
              </div>

              {allCompleted && (
                <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-xl flex items-center justify-between text-emerald-300">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    <div>
                      <div className="font-semibold text-sm">Task Management Mastery Verified!</div>
                      <div className="text-xs text-emerald-400/80">You have tested state transitions, checklist calculations, and RBAC permission enforcement.</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsTutorialOpen(false)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs rounded-lg transition-colors"
                  >
                    Return to Workspace
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Full-Stack Application Structure & API Contracts</h3>
                <p className="text-xs text-slate-400 mt-1">
                  For engineers learning full-stack structure, API design, and dynamic data handling:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* REST API Endpoints */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <span className="text-xs font-semibold text-indigo-400 font-mono">RESTful Endpoints</span>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="p-2 bg-slate-900 rounded border border-slate-800 flex items-center justify-between">
                      <span className="text-emerald-400">GET /api/tasks</span>
                      <span className="text-slate-400 text-[11px]">List & filters</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800 flex items-center justify-between">
                      <span className="text-blue-400">POST /api/tasks</span>
                      <span className="text-slate-400 text-[11px]">Create task (Auth required)</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800 flex items-center justify-between">
                      <span className="text-amber-400">PATCH /api/tasks/:id</span>
                      <span className="text-slate-400 text-[11px]">Update fields / status</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800 flex items-center justify-between">
                      <span className="text-rose-400">DELETE /api/tasks/:id</span>
                      <span className="text-slate-400 text-[11px]">Delete task (Admin only)</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800 flex items-center justify-between">
                      <span className="text-indigo-400">POST /api/tasks/:id/comments</span>
                      <span className="text-slate-400 text-[11px]">Append timestamped comment</span>
                    </div>
                  </div>
                </div>

                {/* WebSocket Event Types */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <span className="text-xs font-semibold text-indigo-400 font-mono">WebSocket Message Protocol</span>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <span className="text-purple-400">client -&gt; server:</span>
                      <div className="text-[11px] text-slate-300 mt-1">&#123; type: "MUTATE_TASK", taskId, patch, token &#125;</div>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <span className="text-emerald-400">server -&gt; broadcast:</span>
                      <div className="text-[11px] text-slate-300 mt-1">&#123; type: "TASK_UPDATED", task, actorId &#125;</div>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <span className="text-sky-400">cross-tab (BroadcastChannel):</span>
                      <div className="text-[11px] text-slate-300 mt-1">&#123; type: "SYNC_TASKS", tasks, activities &#125;</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>TaskPulse Learning Module v2.4 · Ready for production use</span>
          </div>
          <button
            onClick={() => setIsTutorialOpen(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
          >
            Close Tutorial
          </button>
        </div>
      </div>
    </div>
  );
};
