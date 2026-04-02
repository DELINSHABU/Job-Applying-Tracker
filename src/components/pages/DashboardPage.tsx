import { useState } from 'react';
import { motion } from 'motion/react';
import { SearchBar } from '../SearchBar';
import { JobList } from '../JobList';
import { StatsCards } from '../StatsCards';
import { SetDailyGoalModal } from '../SetDailyGoalModal';
import { User, Job, JobStats, StreakData, DailyGoal } from '../../types';
import { staggerContainerVariants } from '../../lib/animations';

interface DashboardPageProps {
  user: User | null;
  jobs: Job[];
  stats: JobStats;
  filters: { search: string };
  onSearchChange: (search: string) => void;
  onEdit: (job: Job) => void;
  onDelete: (jobId: string) => void;
  onView: (job: Job) => void;
  onLoginClick: () => void;
  onProfileClick: () => void;
  onAddClick: () => void;
  loading: boolean;
  streakData: StreakData;
  dailyGoal: DailyGoal | null;
  todayApplications: number;
  onSetDailyGoal: (target: number) => void;
}

export function DashboardPage({
  user,
  jobs,
  stats,
  filters,
  onSearchChange,
  onEdit,
  onDelete,
  onView,
  onLoginClick,
  onProfileClick,
  onAddClick,
  loading,
  streakData,
  dailyGoal,
  todayApplications,
  onSetDailyGoal,
}: DashboardPageProps) {
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const targetApplications = dailyGoal?.targetApplications ?? 10;
  const currentApplications = dailyGoal?.currentApplications ?? todayApplications;
  const progress = targetApplications > 0 ? currentApplications / targetApplications : 0;
  const isGoalCompleted = currentApplications >= targetApplications;

  // Calculate platform counts for today (based on appliedDate)
  const today = new Date().toISOString().split('T')[0] ?? '';
  const todayJobs = jobs.filter(j => {
    const appliedDate = j.appliedDate;
    return appliedDate?.startsWith(today);
  });
  const platformCounts = todayJobs.reduce((acc, job) => {
    const platform = (job.platform ?? '').toLowerCase() || 'other';
    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedPlatforms = Object.entries(platformCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      linkedin: 'bg-blue-600',
      indeed: 'bg-blue-400',
      glassdoor: 'bg-emerald-600',
      ziprecruiter: 'bg-green-500',
      monster: 'bg-purple-600',
      whatsapp: 'bg-green-400',
      email: 'bg-red-400',
      direct: 'bg-slate-500',
      referral: 'bg-orange-500',
    };
    return colors[platform.toLowerCase()] || 'bg-primary';
  };

  return (
    <motion.div
      key="dashboard"
      variants={staggerContainerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Header */}
      <header className="sticky top-0 z-30 bg-app-bg-light/80 dark:bg-app-bg/80 backdrop-blur-md px-5 pt-12 pb-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-off-white">Job Tracker</h1>
            <p className="text-sm text-slate-500 dark:text-light-grey">
              Welcome back, {user?.displayName?.split(' ')[0] || 'Guest'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full bg-slate-200/50 dark:bg-slate-800 transition-colors">
              <span className="material-icons-round text-xl">notifications</span>
            </button>
            <button onClick={user ? onProfileClick : onLoginClick} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
              {user?.displayName ? user.displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : 'G'}
            </button>
          </div>
        </div>

        {/* Daily Mission Section */}
        <div className="mb-6 bg-white dark:bg-card-bg rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-card-border">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="material-icons-round text-orange-500">local_fire_department</span>
              <span className="font-bold text-slate-900 dark:text-off-white">
                {streakData.currentStreak > 0 ? `${streakData.currentStreak} Day Streak!` : 'Start your streak!'}
              </span>
            </div>
            <button 
              onClick={() => setIsGoalModalOpen(true)}
              className="text-[11px] font-semibold text-primary uppercase tracking-wider hover:underline"
            >
              Set Daily Goal
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-end mb-1.5">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Daily Mission</span>
                <span className="text-xs font-bold">
                  {currentApplications}/{targetApplications} <span className="font-normal text-slate-400">Applications</span>
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${isGoalCompleted ? 'bg-emerald-500' : 'bg-primary'}`}
                  style={{ width: `${Math.min(progress * 100, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4 pt-1 overflow-x-auto hide-scrollbar whitespace-nowrap">
              {sortedPlatforms.length > 0 ? (
                sortedPlatforms.map(([platform, count]) => (
                  <div key={platform} className="flex items-center gap-1.5 shrink-0">
                    <div className={`w-2 h-2 rounded-full ${getPlatformColor(platform)}`}></div>
                    <span className="text-[11px] font-medium text-slate-500 capitalize">{platform}: {count}</span>
                  </div>
                ))
              ) : (
                <span className="text-[11px] font-medium text-slate-400 italic">No activity today</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="px-5">
        <StatsCards stats={stats} />
      </div>

      {/* Search Bar */}
      <SearchBar
        value={filters.search}
        onChange={onSearchChange}
      />

      {/* Job List */}
      <JobList
        jobs={jobs}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onView}
        loading={loading}
      />

      {/* Floating Action Button */}
      <button 
        onClick={onAddClick}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/40 flex items-center justify-center transition-transform active:scale-90 z-40 hover:scale-105"
      >
        <span className="material-icons-round text-3xl">add</span>
      </button>

      {/* Set Daily Goal Modal */}
      <SetDailyGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={onSetDailyGoal}
        streakData={streakData}
        currentGoal={dailyGoal}
        currentApplications={currentApplications}
      />
    </motion.div>
  );
}
