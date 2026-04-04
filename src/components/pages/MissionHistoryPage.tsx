import { useState, useEffect, useMemo } from 'react';
import { db } from '../../services/firebase';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { getLocalDateString } from '../../lib/utils';
import type { StreakData, DailyGoal, Job } from '../../types';

interface MissionHistoryPageProps {
  jobs: Job[];
  streakData: StreakData;
  dailyGoal: DailyGoal | null;
  onBack: () => void;
}

const DAYS_OF_WEEK = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

function getWeekDates(offset: number): Date[] {
  const today = new Date();
  if (!today) return Array(7).fill(new Date());
  
  const startOfWeek = new Date(today);
  // Get Monday of current week
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff + (offset * 7));
  
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    dates.push(date);
  }
  return dates;
}

function formatDateKey(date: Date): string {
  return getLocalDateString(date);
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getWeekRange(offset: number): string {
  const dates = getWeekDates(offset);
  const start = dates[0];
  const end = dates[6];
  if (!start || !end) return '';
  return `${formatDisplayDate(start)} — ${formatDisplayDate(end)}`;
}

export function MissionHistoryPage({ jobs, streakData, dailyGoal, onBack }: MissionHistoryPageProps) {
  const [goals, setGoals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const userId = localStorage.getItem('userId') || null;

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const weekRange = useMemo(() => getWeekRange(weekOffset), [weekOffset]);

  // Group jobs by date
  const jobCountsByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach(job => {
      if (job.appliedDate) {
        const date = job.appliedDate.split('T')[0];
        if (date) {
          counts[date] = (counts[date] || 0) + 1;
        }
      }
    });
    return counts;
  }, [jobs]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    const fetchGoals = async () => {
      try {
        const goalsRef = collection(db, 'users', userId, 'goals');
        const q = query(
          goalsRef,
          orderBy('date', 'desc'),
          limit(60)
        );
        const snapshot = await getDocs(q);
        const goalsData: Record<string, number> = {};
        snapshot.docs.forEach(doc => {
          const data = doc.data() as DailyGoal;
          goalsData[data.date] = data.targetApplications;
        });
        setGoals(goalsData);
      } catch (error) {
        console.error('Error fetching goals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [userId]);

  // Create history from jobs and goals
  const history = useMemo(() => {
    const todayStr = getLocalDateString();
    const allDates = new Set([...Object.keys(jobCountsByDate), ...Object.keys(goals), todayStr]);
    const sortedDates = Array.from(allDates)
      .filter((date): date is string => !!date)
      .sort((a, b) => b.localeCompare(a));
    
    const defaultTarget = dailyGoal?.targetApplications || 10;
    
    return sortedDates.map(date => {
      const actual = jobCountsByDate[date] || 0;
      const target = goals[date] || defaultTarget;
      return {
        id: date,
        date,
        actualApplications: actual,
        targetApplications: target,
        completed: actual >= target,
      };
    });
  }, [jobCountsByDate, goals, dailyGoal]);

  const weekHistory = useMemo(() => {
    const historyMap = new Map<string, { date: string, actualApplications: number, targetApplications: number, completed: boolean }>();
    history.forEach(h => {
      if (h.date) {
        historyMap.set(h.date, h);
      }
    });
    
    const todayStr = getLocalDateString();
    
    return weekDates.map(date => {
      const dateKey = formatDateKey(date);
      const isToday = dateKey === todayStr;
      
      // For today, use real-time data from props if available
      let historyItem = historyMap.get(dateKey);
      if (isToday && dailyGoal) {
        historyItem = {
          date: dateKey,
          actualApplications: Math.max(jobCountsByDate[dateKey] || 0, dailyGoal.currentApplications),
          targetApplications: dailyGoal.targetApplications,
          completed: Math.max(jobCountsByDate[dateKey] || 0, dailyGoal.currentApplications) >= dailyGoal.targetApplications
        };
      }

      return {
        date,
        history: historyItem || null,
        isToday,
        isFuture: date > new Date(),
      };
    });
  }, [weekDates, history, dailyGoal, jobCountsByDate]);

  const completedDays = weekHistory.filter(w => w.history?.completed).length;
  const totalDays = weekHistory.filter(w => !w.isFuture && w.history).length;
  const accuracy = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  const totalCompletions = history.filter(h => h.completed).length;

  return (
    <div className="min-h-screen bg-[#080C18] text-[#dfe2f4] font-body">
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 bg-[#080C18] flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/5 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[#8B5CF6]">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold text-white font-headline tracking-tight">Mission History</h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#262a37] flex items-center justify-center">
          <span className="material-symbols-outlined text-sm text-slate-400">more_vert</span>
        </div>
      </header>

      <main className="px-6 py-4 space-y-6 max-w-lg mx-auto">
        {/* 1. Current Streak Overview (Bento Style) */}
        <section className="grid grid-cols-2 gap-4">
          <div className="col-span-2 relative overflow-hidden bg-[#171b28] rounded-xl p-6 border border-white/5">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-[#ffb95f]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                <span className="font-headline uppercase tracking-widest text-xs text-[#ffb95f]">Active Streak</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-headline font-bold text-white">{streakData.currentStreak}</span>
                <span className="text-xl font-headline text-slate-400">Days</span>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-label">Target</p>
                  <p className="text-sm mono-stat text-[#dfe2f4]">{dailyGoal?.targetApplications || 10} Applications/Day</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-label">Status</p>
                  <p className="text-sm font-medium text-[#4edea3]">{dailyGoal?.completed ? 'Completed' : 'In Progress'}</p>
                </div>
              </div>
            </div>
          </div>
          {/* 4. Mission Insights (Small Cards) */}
          <div className="bg-[#1b1f2c] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-label mb-2">Longest Streak</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-headline font-bold text-white">{streakData.longestStreak}</span>
              <span className="text-xs text-slate-400">Days</span>
            </div>
          </div>
          <div className="bg-[#1b1f2c] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-label mb-2">Completions</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-headline font-bold text-white">{totalCompletions}</span>
              <span className="text-xs text-slate-400">Missions</span>
            </div>
          </div>
        </section>

        {/* 2. Weekly Consistency Calendar */}
        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-xs uppercase tracking-[0.2em] text-slate-500 font-label px-1">Weekly Consistency</h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setWeekOffset(prev => prev + 1)}
                disabled={weekOffset >= 0}
                className="p-1 rounded hover:bg-white/5 disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button 
                onClick={() => setWeekOffset(prev => Math.max(prev - 1, -10))}
                disabled={weekOffset <= -10}
                className="p-1 rounded hover:bg-white/5 disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
          <div className="bg-[#171b28] rounded-xl p-5 border border-white/5">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-label text-white/60">{weekRange}</span>
              <span className="mono-stat text-[10px] text-[#4edea3] bg-[#4edea3]/10 px-2 py-0.5 rounded-full">{accuracy}% Accuracy</span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {weekHistory.map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-3">
                  <span className="text-[10px] text-slate-500 mono-stat">{DAYS_OF_WEEK[index]}</span>
                  {item.isFuture ? (
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                      <span className="material-symbols-outlined text-lg text-slate-600">remove</span>
                    </div>
                  ) : item.history?.completed ? (
                    <div className="w-8 h-8 rounded-full bg-[#4edea3]/20 flex items-center justify-center text-[#4edea3]">
                      <span className="material-symbols-outlined text-lg">check_circle</span>
                    </div>
                  ) : item.history ? (
                    <div className="w-8 h-8 rounded-full bg-[#ffb95f]/20 flex items-center justify-center text-[#ffb95f]">
                      <span className="material-symbols-outlined text-lg">radio_button_checked</span>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                      <span className="material-symbols-outlined text-lg text-slate-600">close</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Daily Goal History */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xs uppercase tracking-[0.2em] text-slate-500 font-label">History Logs</h2>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-slate-500">Loading...</div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No history yet. Start your first mission!</div>
            ) : (
              history.slice(0, 10).map((item) => (
                <div 
                  key={item.id} 
                  className="group flex items-center justify-between p-4 rounded-xl bg-[#262a37] transition-all hover:bg-[#353946]"
                >
                  <div className="flex flex-col">
                    <span className="text-xs mono-stat text-slate-400 mb-1">
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <h3 className="font-medium text-white">
                      {item.actualApplications}/{item.targetApplications} Applications
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] mono-stat px-2 py-1 rounded ${
                      item.completed 
                        ? 'text-[#4edea3] bg-[#4edea3]/10' 
                        : 'text-[#ffb95f] bg-[#ffb95f]/10'
                    }`}>
                      {item.completed ? 'MET' : 'MISSED'}
                    </span>
                    <span className="material-symbols-outlined text-slate-500 group-hover:text-white transition-colors">
                      chevron_right
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          {history.length > 10 && (
            <button className="w-full py-4 text-xs font-headline tracking-[0.2em] text-slate-500 uppercase border border-white/5 rounded-xl hover:bg-white/5 active:scale-[0.98] transition-all">
              Load Full Archives
            </button>
          )}
        </section>
      </main>
    </div>
  );
}