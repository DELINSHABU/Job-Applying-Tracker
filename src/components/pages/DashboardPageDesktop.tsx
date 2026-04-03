import { useState } from 'react';
import { motion } from 'motion/react';
import { SearchBar } from '../SearchBar';
import { JobTable } from '../JobTable';
import { DesktopStatsCards } from '../DesktopStatsCards';
import { SetDailyGoalModal } from '../SetDailyGoalModal';
import { Job, JobStats, StreakData, DailyGoal } from '../../types';
import { staggerContainerVariants } from '../../lib/animations';

interface DashboardPageDesktopProps {
  jobs: Job[];
  stats: JobStats;
  filters: { search: string };
  onSearchChange: (search: string) => void;
  onEdit: (job: Job) => void;
  onDelete: (jobId: string) => void;
  onView: (job: Job) => void;
  onAddClick: () => void;
  loading: boolean;
  streakData: StreakData;
  dailyGoal: DailyGoal | null;
  todayApplications: number;
  onSetDailyGoal: (target: number) => void;
  onOpenMissionHistory: () => void;
}

export function DashboardPageDesktop({
  jobs,
  stats,
  filters,
  onSearchChange,
  onEdit,
  onDelete,
  onView,
  onAddClick,
  loading,
  streakData,
  dailyGoal,
  todayApplications,
  onSetDailyGoal,
  onOpenMissionHistory,
}: DashboardPageDesktopProps) {
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const targetApplications = dailyGoal?.targetApplications ?? 10;
  const currentApplications = todayApplications;
  const progress = targetApplications > 0 ? currentApplications / targetApplications : 0;
  const isGoalCompleted = currentApplications >= targetApplications;

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
      variants={staggerContainerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-8"
    >
      {/* Dashboard Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 text-slate-900 dark:text-off-white">
            Dashboard Overview
          </h2>
          <p className="text-slate-500 dark:text-light-grey">
            {stats.interviewing + stats.callback > 0 
              ? `You have ${stats.interviewing + stats.callback} interviews scheduled.`
              : 'Track and manage your job applications.'
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Streak Badge */}
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 rounded-xl border border-orange-500/20">
            <span className="material-icons-round text-orange-500">local_fire_department</span>
            <span className="font-bold text-orange-500">
              {streakData.currentStreak > 0 ? `${streakData.currentStreak} Day Streak!` : 'Start streak!'}
            </span>
          </div>
          <button 
            onClick={() => setIsGoalModalOpen(true)}
            className="px-4 py-2 text-sm font-semibold text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors"
          >
            Set Daily Goal
          </button>
          <button 
            onClick={onAddClick}
            className="px-5 py-2.5 bg-primary text-white font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-primary/25 hover:scale-[1.02] transition-transform"
          >
            <span className="material-icons-round text-xl">add</span>
            New Application
          </button>
        </div>
      </div>

      {/* Daily Goal Card */}
      <button 
        onClick={onOpenMissionHistory}
        className="w-full text-left bg-white dark:bg-card-bg rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-card-border hover:opacity-90 transition-opacity"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="material-icons-round text-orange-500">local_fire_department</span>
            <span className="font-bold text-slate-900 dark:text-off-white">
              Daily Mission
            </span>
          </div>
          <span className="text-xs font-semibold text-primary">
            {streakData.currentStreak > 0 ? `${streakData.currentStreak} Day Streak!` : 'Start your streak!'}
          </span>
        </div>
        
        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-3">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Progress</span>
              <span className="text-sm font-bold">
                {currentApplications}/{targetApplications} Applications
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${isGoalCompleted ? 'bg-emerald-500' : 'bg-primary'}`}
                style={{ width: `${Math.min(progress * 100, 100)}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-4 justify-end">
            {sortedPlatforms.length > 0 ? (
              sortedPlatforms.map(([platform, count]) => (
                <div key={platform} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${getPlatformColor(platform)}`}></div>
                  <span className="text-xs font-medium text-slate-500 capitalize">{platform}: {count}</span>
                </div>
              ))
            ) : (
              <span className="text-xs font-medium text-slate-400 italic">No activity today</span>
            )}
          </div>
        </div>
      </button>

      {/* Stats Cards */}
      <DesktopStatsCards stats={stats} />

      {/* Search Bar */}
      <div className="max-w-md">
        <SearchBar
          value={filters.search}
          onChange={onSearchChange}
        />
      </div>

      {/* Job Table */}
      <JobTable
        jobs={jobs}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onView}
        loading={loading}
      />

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
