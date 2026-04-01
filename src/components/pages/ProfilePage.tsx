import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { pageVariants } from '../../lib/animations';
import type { User, Job } from '../../types';

interface ProfilePageProps {
  user: User;
  jobs: Job[];
  onBack: () => void;
  onLogout: () => void;
}

export function ProfilePage({ user, jobs, onBack, onLogout }: ProfilePageProps) {
  const getInitials = (user: User) => {
    if (user.displayName) {
      return user.displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email?.charAt(0).toUpperCase() || '?';
  };

  // Calculate stats
  const totalApplications = jobs.length;
  const interviewRate = totalApplications > 0 
    ? Math.round((jobs.filter(j => j.status === 'interviewing' || j.status === 'callback').length / totalApplications) * 100) 
    : 0;
  const offerRate = totalApplications > 0 
    ? Math.round((jobs.filter(j => j.status === 'offer').length / totalApplications) * 100) 
    : 0;

  // Get member since date (earliest job application or fallback)
  const earliestJob = jobs.length > 0 
    ? jobs.reduce((earliest, job) => {
        const jobDate = new Date(job.createdAt);
        return jobDate < new Date(earliest.createdAt) ? job : earliest;
      })
    : null;
  const memberSince = earliestJob 
    ? new Date(earliestJob.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-app-bg-light dark:bg-app-bg"
    >
      {/* Header */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-5 py-4 bg-app-bg-light/80 dark:bg-app-bg/80 backdrop-blur-md border-b border-slate-200 dark:border-card-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
          aria-label="Go back"
        >
          <span className="material-icons-round">arrow_back_ios_new</span>
        </Button>
        <span className="text-sm font-semibold tracking-wide uppercase text-slate-500 dark:text-light-grey">Profile</span>
        <div className="w-10" /> {/* Spacer for centering */}
      </nav>

      <main className="px-5 pt-4 pb-8 space-y-6 max-w-lg mx-auto">
        {/* Profile Header */}
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'Profile'} 
                className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-card-bg shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold border-4 border-white dark:border-card-bg shadow-xl">
                {getInitials(user)}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 border-4 border-app-bg-light dark:border-app-bg rounded-full flex items-center justify-center">
              <span className="material-icons-round text-white text-sm">check</span>
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-off-white">
              {user.displayName || 'User'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-light-grey">{user.email}</p>
            <p className="text-xs text-slate-400 dark:text-light-grey/70">Member since {memberSince}</p>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-3 gap-3">
          <Card className="bg-white dark:bg-card-bg border-slate-200 dark:border-card-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{totalApplications}</p>
              <p className="text-xs text-slate-500 dark:text-light-grey">Applications</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-card-bg border-slate-200 dark:border-card-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-500">{interviewRate}%</p>
              <p className="text-xs text-slate-500 dark:text-light-grey">Interview Rate</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-card-bg border-slate-200 dark:border-card-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-500">{offerRate}%</p>
              <p className="text-xs text-slate-500 dark:text-light-grey">Offer Rate</p>
            </CardContent>
          </Card>
        </section>

        {/* Account Section */}
        <section className="space-y-3">
          <h3 className="px-1 text-xs font-semibold text-slate-400 dark:text-light-grey uppercase tracking-wider">Account</h3>
          <Card className="bg-white dark:bg-card-bg border-slate-200 dark:border-card-border overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-card-border">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="material-icons-round text-blue-600 dark:text-blue-400">person</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-off-white">Display Name</p>
                  <p className="text-sm text-slate-500 dark:text-light-grey">{user.displayName || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-card-border">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <span className="material-icons-round text-purple-600 dark:text-purple-400">email</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-off-white">Email</p>
                  <p className="text-sm text-slate-500 dark:text-light-grey">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <span className="material-icons-round text-emerald-600 dark:text-emerald-400">verified</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-off-white">Account Status</p>
                  <p className="text-sm text-emerald-500">Verified</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Sign Out */}
        <section className="pt-4">
          <Button
            variant="destructive"
            onClick={onLogout}
            className="w-full py-4 h-auto bg-red-50 dark:bg-red-900/10 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 font-semibold rounded-xl"
          >
            <span className="material-icons-round text-xl">logout</span>
            Sign Out
          </Button>
        </section>
      </main>
    </motion.div>
  );
}
