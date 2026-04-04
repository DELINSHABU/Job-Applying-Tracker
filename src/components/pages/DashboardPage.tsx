import { useState } from 'react';
import { motion } from 'motion/react';
import { SearchBar } from '../SearchBar';
import { JobList } from '../JobList';
import { StatsCards } from '../StatsCards';
import { SetDailyGoalModal } from '../SetDailyGoalModal';
import { SuggestedJobCard } from '../SuggestedJobCard';
import { User, Job, JobStats, StreakData, DailyGoal, SuggestedJob } from '@/types';
import { staggerContainerVariants } from '@/lib/animations';
import { useSuggestedJobs } from '@/hooks/useSuggestedJobs';
import { getLocalDateString } from '@/lib/utils';

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
  onOpenMissionHistory: () => void;
  onViewSuggestedJob: (job: SuggestedJob) => void;
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
  onOpenMissionHistory,
  onViewSuggestedJob,
}: DashboardPageProps) {
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [suggestedJobsExpanded, setSuggestedJobsExpanded] = useState(true);
  
  const { 
    activeJobs, 
    dismissJob, 
    removeJob, 
    totalCount 
  } = useSuggestedJobs(user?.uid || null);

  const targetApplications = dailyGoal?.targetApplications ?? 10;
  const currentApplications = todayApplications;
  const progress = targetApplications > 0 ? currentApplications / targetApplications : 0;
  const isGoalCompleted = currentApplications >= targetApplications;

  // Calculate platform counts for today (based on appliedDate)
  const today = getLocalDateString();
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
            <button 
              onClick={user ? onProfileClick : onLoginClick} 
              className="w-10 h-10 rounded-full overflow-hidden bg-primary flex items-center justify-center text-white font-semibold transition-transform active:scale-95"
            >
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'Profile'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.displayName 
                  ? user.displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() 
                  : (user?.email?.charAt(0).toUpperCase() || 'G')
              )}
            </button>
          </div>
        </div>

        {/* Daily Mission Section */}
        <button 
          onClick={onOpenMissionHistory}
          className="w-full mb-6 bg-white dark:bg-card-bg rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-card-border text-left hover:opacity-90 transition-opacity"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="material-icons-round text-orange-500">local_fire_department</span>
              <span className="font-bold text-slate-900 dark:text-off-white">
                {streakData.currentStreak > 0 ? `${streakData.currentStreak} Day Streak!` : 'Start your streak!'}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
              View Details
            </span>
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
          </button>
        </header>

      {/* Stats Cards */}
      <div className="px-5">
        <StatsCards stats={stats} suggestedCount={totalCount} />
      </div>

      {/* Suggested Jobs Section */}
      {user && totalCount > 0 && (
        <div className="px-5 mt-4">
          <button
            onClick={() => setSuggestedJobsExpanded(!suggestedJobsExpanded)}
            className="w-full flex items-center justify-between mb-3"
          >
            <h2 className="text-sm font-semibold text-slate-900 dark:text-off-white flex items-center gap-2">
              <span className="material-icons-round text-primary">auto_awesome</span>
              Suggested Jobs
              <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                {activeJobs.length}
              </span>
            </h2>
            <span className="material-icons-round text-slate-400">
              {suggestedJobsExpanded ? 'expand_less' : 'expand_more'}
            </span>
          </button>
          
          {suggestedJobsExpanded && (
            <div className="space-y-3">
              {activeJobs.slice(0, 5).map(job => (
                <SuggestedJobCard
                  key={job.id}
                  job={job}
                  onDismiss={dismissJob}
                  onRemove={removeJob}
                  onView={onViewSuggestedJob}
                />
              ))}
              {activeJobs.length > 5 && (
                <button className="w-full text-center text-sm text-primary hover:text-primary/80 py-2">
                  View all {activeJobs.length} suggested jobs
                </button>
              )}
            </div>
          )}
        </div>
      )}

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
