import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Activity,
  Layers,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { TaskStatus, TaskPriority } from '../types';

export const AnalyticsView: React.FC = () => {
  const { tasks, recentActivities, setActiveTaskId } = useTasks();
  const { users } = useAuth();

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const overdueTasks = tasks.filter(t => {
    if (t.status === 'done') return false;
    return new Date(t.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);
  });

  const totalEstimatedHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  const totalLoggedHours = tasks.reduce((sum, t) => sum + (t.loggedHours || 0), 0);

  const statuses: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'backlog', label: 'Backlog', color: 'bg-slate-500' },
    { id: 'todo', label: 'To Do', color: 'bg-blue-500' },
    { id: 'in_progress', label: 'In Progress', color: 'bg-amber-500' },
    { id: 'in_review', label: 'In Review', color: 'bg-purple-500' },
    { id: 'done', label: 'Done', color: 'bg-emerald-500' },
  ];

  const priorities: { id: TaskPriority; label: string; color: string }[] = [
    { id: 'urgent', label: 'Urgent', color: 'bg-rose-500' },
    { id: 'high', label: 'High', color: 'bg-amber-500' },
    { id: 'medium', label: 'Medium', color: 'bg-sky-500' },
    { id: 'low', label: 'Low', color: 'bg-slate-500' },
  ];

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Completion Rate</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-100">
              {completionRate}%
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {doneTasks} of {totalTasks} sprint items shipped
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Sprint Workload</span>
              <Clock className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-100">
              {totalLoggedHours}h / {totalEstimatedHours}h
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {Math.max(0, totalEstimatedHours - totalLoggedHours)}h remaining effort
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Overdue Items</span>
              <AlertCircle className={`w-4 h-4 ${overdueTasks.length > 0 ? 'text-rose-400' : 'text-slate-500'}`} />
            </div>
            <div className={`text-2xl font-bold font-mono tabular-nums ${overdueTasks.length > 0 ? 'text-rose-400' : 'text-slate-100'}`}>
              {overdueTasks.length}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {overdueTasks.length > 0 ? 'Action required before release' : 'All items on schedule'}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Active Engineering</span>
              <Layers className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-100">
              {inProgressTasks}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Tasks in active implementation
            </div>
          </div>
        </div>

        {/* Section 2: Status & Priority Distributions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span>Sprint Status Distribution</span>
            </h3>

            {/* Proportional Stack Bar */}
            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden flex">
              {statuses.map(st => {
                const count = tasks.filter(t => t.status === st.id).length;
                const pct = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
                if (pct === 0) return null;
                return (
                  <div
                    key={st.id}
                    title={`${st.label}: ${count} (${Math.round(pct)}%)`}
                    style={{ width: `${pct}%` }}
                    className={`${st.color} transition-all`}
                  />
                );
              })}
            </div>

            {/* Status Legend Rows */}
            <div className="space-y-2 pt-2">
              {statuses.map(st => {
                const count = tasks.filter(t => t.status === st.id).length;
                const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                return (
                  <div key={st.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className={`w-2.5 h-2.5 rounded-full ${st.color}`} />
                      <span>{st.label}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono tabular-nums text-slate-400">
                      <span>{count} tasks</span>
                      <span className="text-slate-500 w-10 text-right">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Task Priority Breakdown</span>
            </h3>

            {/* Proportional Stack Bar */}
            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden flex">
              {priorities.map(pr => {
                const count = tasks.filter(t => t.priority === pr.id).length;
                const pct = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
                if (pct === 0) return null;
                return (
                  <div
                    key={pr.id}
                    title={`${pr.label}: ${count} (${Math.round(pct)}%)`}
                    style={{ width: `${pct}%` }}
                    className={`${pr.color} transition-all`}
                  />
                );
              })}
            </div>

            {/* Priority Legend Rows */}
            <div className="space-y-2 pt-2">
              {priorities.map(pr => {
                const count = tasks.filter(t => t.priority === pr.id).length;
                const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                return (
                  <div key={pr.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className={`w-2.5 h-2.5 rounded-full ${pr.color}`} />
                      <span>{pr.label}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono tabular-nums text-slate-400">
                      <span>{count} tasks</span>
                      <span className="text-slate-500 w-10 text-right">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 3: Team Workload & Activity Velocity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Teammate Workload */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Team Workload Allocation</span>
            </h3>

            <div className="space-y-3">
              {users.map(u => {
                const userTasks = tasks.filter(t => t.assigneeId === u.id);
                const userLogged = userTasks.reduce((acc, t) => acc + t.loggedHours, 0);
                const userEst = userTasks.reduce((acc, t) => acc + t.estimatedHours, 0);

                return (
                  <div key={u.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          referrerPolicy="no-referrer"
                          className="w-6 h-6 rounded-md object-cover border border-slate-700"
                        />
                        <div>
                          <div className="font-semibold text-slate-200">{u.name}</div>
                          <div className="text-[11px] text-slate-400 capitalize">{u.role} · {u.title}</div>
                        </div>
                      </div>
                      <div className="text-right font-mono tabular-nums">
                        <div className="text-slate-200 font-semibold">{userTasks.length} tasks</div>
                        <div className="text-[11px] text-slate-400">{userLogged}h / {userEst}h</div>
                      </div>
                    </div>

                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full"
                        style={{
                          width: `${userEst > 0 ? Math.min(100, (userLogged / userEst) * 100) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Activity Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span>Sprint Activity Velocity</span>
            </h3>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {recentActivities.length === 0 ? (
                <div className="text-xs text-slate-500 py-8 text-center">No recent activity logged yet.</div>
              ) : (
                recentActivities.slice(0, 8).map(act => (
                  <div key={act.id} className="p-2.5 bg-slate-950/50 border border-slate-800/80 rounded-lg flex items-start gap-3 text-xs">
                    <img
                      src={act.userAvatar}
                      alt={act.userName}
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-md object-cover border border-slate-700 shrink-0 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-300 leading-snug">
                        <span className="font-semibold text-slate-200">{act.userName}</span>{' '}
                        <span>{act.action}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-1">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
