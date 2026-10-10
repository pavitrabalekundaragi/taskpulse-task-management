import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  AlertCircle,
  Clock,
  Plus
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { Task, TaskPriority } from '../types';

export const CalendarView: React.FC = () => {
  const { filteredTasks, setActiveTaskId, setIsCreateOpen } = useTasks();
  const { users, canCreateTask } = useAuth();

  // Current view date anchor (defaults to current date in October 2026)
  const [currentDate, setCurrentDate] = useState(() => new Date('2026-10-10'));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date('2026-10-10'));
  };

  const getPriorityBorder = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-2 border-l-rose-500 text-rose-300';
      case 'high':
        return 'border-l-2 border-l-amber-500 text-amber-300';
      case 'medium':
        return 'border-l-2 border-l-sky-500 text-sky-300';
      case 'low':
        return 'border-l-2 border-l-slate-500 text-slate-300';
    }
  };

  // Build grid days
  const calendarCells = [];

  // Trailing days from previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = prevMonthDays - i;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    calendarCells.push({
      dateStr,
      dayNum,
      isCurrentMonth: false,
    });
  }

  // Days of current month
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: true,
      isToday: d === 10 && month === 9 && year === 2026,
    });
  }

  // Remaining days to fill 35 or 42 grid cells
  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let r = 1; r <= remainingCells; r++) {
    const dateStr = `${year}-${String(month + 2).padStart(2, '0')}-${String(r).padStart(2, '0')}`;
    calendarCells.push({
      dateStr,
      dayNum: r,
      isCurrentMonth: false,
    });
  }

  // Group tasks by dueDate
  const tasksByDate = filteredTasks.reduce((acc, t) => {
    if (!acc[t.dueDate]) acc[t.dueDate] = [];
    acc[t.dueDate].push(t);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Calendar Navigation Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm sm:text-base font-semibold text-slate-100 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-indigo-400" />
              <span>{monthNames[month]} {year}</span>
            </h2>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          {/* Day of Week Header */}
          <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-950/60 text-center text-xs font-semibold text-slate-400 py-2.5">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-800/80">
            {calendarCells.map((cell, idx) => {
              const dayTasks = tasksByDate[cell.dateStr] || [];

              return (
                <div
                  key={idx}
                  className={`min-h-[110px] sm:min-h-[130px] p-2 flex flex-col justify-between transition-colors ${
                    cell.isCurrentMonth ? 'bg-slate-900/90' : 'bg-slate-950/40 text-slate-600'
                  } ${cell.isToday ? 'ring-1 ring-inset ring-indigo-500/50 bg-indigo-950/10' : ''}`}
                >
                  {/* Date number */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-mono tabular-nums ${
                        cell.isToday
                          ? 'w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold'
                          : cell.isCurrentMonth
                          ? 'text-slate-300 font-medium'
                          : 'text-slate-600'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {cell.isCurrentMonth && canCreateTask() && (
                      <button
                        onClick={() => setIsCreateOpen(true)}
                        className="opacity-0 hover:opacity-100 text-slate-500 hover:text-slate-300 text-[10px]"
                        title="Add task on this date"
                      >
                        +
                      </button>
                    )}
                  </div>

                  {/* Tasks on this day */}
                  <div className="space-y-1 flex-1 overflow-y-auto max-h-[85px]">
                    {dayTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setActiveTaskId(t.id)}
                        className={`px-1.5 py-1 bg-slate-850 hover:bg-slate-800 rounded border border-slate-700/60 text-[11px] leading-tight cursor-pointer truncate transition-colors ${getPriorityBorder(
                          t.priority
                        )}`}
                        title={`${t.code}: ${t.title} (${t.status})`}
                      >
                        <span className="font-mono text-[10px] text-slate-400 mr-1">{t.code}</span>
                        <span className="text-slate-200">{t.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
