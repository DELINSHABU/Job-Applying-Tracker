import { Button } from '../ui/button';
import type { JobStats, Job } from '../../types';

interface InsightsPageProps {
  stats: JobStats;
  jobs: Job[];
}

export function InsightsPage({ stats, jobs }: InsightsPageProps) {
  // Calculate success rate (interviews / total)
  const successRate = stats.total > 0 
    ? Math.round(((stats.interviewing + stats.callback) / stats.total) * 100) 
    : 0;

  // Calculate platform distribution
  const platformCounts = jobs.reduce((acc, job) => {
    acc[job.platform] = (acc[job.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topPlatforms = Object.entries(platformCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Calculate monthly trend (last 6 months)
  const getMonthlyData = () => {
    const months: Record<string, number> = {};
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toLocaleString('default', { month: 'short' });
      months[key] = 0;
    }
    
    jobs.forEach(job => {
      if (job.appliedDate) {
        const date = new Date(job.appliedDate);
        const key = date.toLocaleString('default', { month: 'short' });
        if (key in months && months[key] !== undefined) {
          months[key] = months[key] + 1;
        }
      }
    });
    
    return Object.entries(months);
  };

  const monthlyData = getMonthlyData();
  const maxMonthly = Math.max(...monthlyData.map(([, count]) => count), 1);

  return (
    <main className="flex-1 overflow-y-auto px-5 pb-24 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-off-white">Insights</h1>
          <p className="text-xs text-slate-500 dark:text-light-grey mt-0.5">Your application analytics</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="w-10 h-10 rounded-full bg-white dark:bg-card-bg border-slate-200 dark:border-card-border text-primary"
        >
          <span className="material-icons-round text-xl">sync</span>
        </Button>
      </div>

      {/* Time Filter */}
      <div className="flex p-1 bg-slate-200/50 dark:bg-card-bg rounded-xl">
        <Button variant="secondary" className="flex-1 py-2 h-auto text-xs rounded-lg bg-white dark:bg-card-border shadow-sm text-slate-900 dark:text-off-white">1M</Button>
        <Button variant="ghost" className="flex-1 py-2 h-auto text-xs text-slate-500 dark:text-light-grey">3M</Button>
        <Button variant="ghost" className="flex-1 py-2 h-auto text-xs text-slate-500 dark:text-light-grey">6M</Button>
        <Button variant="ghost" className="flex-1 py-2 h-auto text-xs text-slate-500 dark:text-light-grey">ALL</Button>
      </div>

      {/* Success Rate Card */}
      <section className="bg-white dark:bg-card-bg rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-card-border flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-slate-500 dark:text-light-grey text-sm font-medium">Success Rate</span>
          <div className="text-4xl font-bold text-slate-900 dark:text-off-white">{successRate}%</div>
          <div className="flex items-center text-emerald-500 text-xs font-semibold">
            <span className="material-icons-round text-sm mr-1">trending_up</span>
            Interview rate
          </div>
        </div>
        <div className="relative flex items-center justify-center">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle 
              className="text-slate-100 dark:text-card-border" 
              cx="48" cy="48" r="40" 
              fill="transparent" 
              stroke="currentColor" 
              strokeWidth="8"
            />
            <circle 
              className="text-primary" 
              cx="48" cy="48" r="40" 
              fill="transparent" 
              stroke="currentColor" 
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - (251.2 * successRate / 100)}
            />
          </svg>
          <span className="absolute text-primary text-xs font-bold">INTERVIEW</span>
        </div>
      </section>

      {/* Applications Trend */}
      <section className="bg-white dark:bg-card-bg rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-card-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-900 dark:text-off-white">Applications Trend</h3>
          <span className="material-icons-round text-slate-400 dark:text-light-grey">more_horiz</span>
        </div>
        <div className="h-40 flex items-end justify-between gap-2 px-1">
          {monthlyData.map(([month, count], index) => (
            <div key={month} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className={`w-full rounded-t-md transition-all ${
                  index === monthlyData.length - 1 
                    ? 'bg-primary' 
                    : 'bg-slate-200 dark:bg-card-border'
                }`}
                style={{ height: `${Math.max((count / maxMonthly) * 128, 16)}px` }}
              />
              <span className={`text-[10px] font-medium ${
                index === monthlyData.length - 1 
                  ? 'text-slate-800 dark:text-off-white' 
                  : 'text-slate-400 dark:text-light-grey'
              }`}>{month.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Status Distribution */}
      <section className="bg-white dark:bg-card-bg rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-card-border">
        <h3 className="font-bold text-slate-900 dark:text-off-white mb-6">Application Status</h3>
        <div className="flex items-center gap-8">
          <div className="relative w-28 h-28">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="56" cy="56" r="44" fill="transparent" stroke="#6366F1" strokeWidth="14" 
                strokeDasharray="276" strokeDashoffset={276 - (276 * (stats.pending / Math.max(stats.total, 1)))} />
              <circle cx="56" cy="56" r="44" fill="transparent" stroke="#10B981" strokeWidth="14"
                strokeDasharray="276" strokeDashoffset={276 - (276 * ((stats.interviewing + stats.callback) / Math.max(stats.total, 1)))} 
                style={{ transform: `rotate(${(stats.pending / Math.max(stats.total, 1)) * 360}deg)`, transformOrigin: '56px 56px' }} />
              <circle cx="56" cy="56" r="44" fill="transparent" stroke="#EF4444" strokeWidth="14"
                strokeDasharray="276" strokeDashoffset={276 - (276 * (stats.rejected / Math.max(stats.total, 1)))}
                style={{ transform: `rotate(${((stats.pending + stats.interviewing + stats.callback) / Math.max(stats.total, 1)) * 360}deg)`, transformOrigin: '56px 56px' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-slate-900 dark:text-off-white">{stats.total}</span>
              <span className="text-[9px] text-slate-400 dark:text-light-grey font-bold uppercase tracking-widest">Total</span>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                <span className="text-xs font-medium text-slate-600 dark:text-light-grey">Pending</span>
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-off-white">{stats.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-medium text-slate-600 dark:text-light-grey">Interview</span>
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-off-white">{stats.interviewing + stats.callback}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                <span className="text-xs font-medium text-slate-600 dark:text-light-grey">Offers</span>
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-off-white">{stats.offer}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <span className="text-xs font-medium text-slate-600 dark:text-light-grey">Rejected</span>
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-off-white">{stats.rejected}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Top Platforms */}
      <section className="bg-white dark:bg-card-bg rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-card-border">
        <h3 className="font-bold text-slate-900 dark:text-off-white mb-6">Top Platforms</h3>
        <div className="space-y-4">
          {topPlatforms.length > 0 ? topPlatforms.map(([platform, count]) => {
            const percentage = Math.round((count / stats.total) * 100);
            return (
              <div key={platform} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900 dark:text-off-white capitalize">{platform}</span>
                  <span className="text-xs font-medium text-slate-500 dark:text-light-grey">{percentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-card-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          }) : (
            <p className="text-sm text-slate-500 dark:text-light-grey text-center py-4">No data yet</p>
          )}
        </div>
      </section>
    </main>
  );
}
