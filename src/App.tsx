import { useState, lazy, Suspense, useMemo } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { pageVariants, slideInRightVariants } from './lib/animations';
import { BottomNav, Sidebar, DesktopHeader, LoadingScreen } from './components';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from './components/ui/sonner';
import { useAuth } from './hooks/useAuth';
import { useJobs } from './hooks/useJobs';
import { useSearch } from './hooks/useSearch';
import { useCustomPlatforms } from './hooks/useCustomPlatforms';
import { useDailyGoal } from './hooks/useDailyGoal';
import type { Job, JobFormData, NavTab } from './types';

// Lazy load page components (not needed on initial render)
const InsightsPage = lazy(() => import('./components/pages/InsightsPage').then(m => ({ default: m.InsightsPage })));
const JobDetailsPage = lazy(() => import('./components/pages/JobDetailsPage').then(m => ({ default: m.JobDetailsPage })));
const SettingsPage = lazy(() => import('./components/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const ProfilePage = lazy(() => import('./components/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const DashboardPage = lazy(() => import('./components/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const DashboardPageDesktop = lazy(() => import('./components/pages/DashboardPageDesktop').then(m => ({ default: m.DashboardPageDesktop })));
const JobsPage = lazy(() => import('./components/pages/JobsPage').then(m => ({ default: m.JobsPage })));

// Lazy load modals (only needed on user interaction)
const JobModal = lazy(() => import('./components/JobModal').then(m => ({ default: m.JobModal })));
const AuthModal = lazy(() => import('./components/AuthModal').then(m => ({ default: m.AuthModal })));

// Loading spinner for Suspense fallbacks
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-b-primary"></div>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Auth state and actions
  const {
    user,
    loading: authLoading,
    error: authError,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    clearError: clearAuthError,
  } = useAuth();

  // Custom Platforms persistence
  const { 
    customPlatforms, 
    addCustomPlatform, 
    removeCustomPlatform 
  } = useCustomPlatforms();

  // Jobs state and actions
  const {
    jobs,
    loading: jobsLoading,
    initialized: jobsInitialized,
    stats,
    addJob,
    updateJob,
    deleteJob,
  } = useJobs(user?.uid || null);

  // Search and filter
  const {
    filters,
    filteredJobs,
    setSearch,
  } = useSearch(jobs);

  // Calculate today's job count
  const todayDate = new Date().toISOString().split('T')[0] ?? '';
  const todayJobCount = useMemo(() => {
    return jobs.filter(job => {
      const appliedDate = job.appliedDate;
      return appliedDate?.startsWith(todayDate);
    }).length;
  }, [jobs, todayDate]);

  // Daily goal and streak
  const {
    dailyGoal,
    streakData,
    setDailyGoal: saveDailyGoal,
  } = useDailyGoal(user?.uid || null, todayJobCount);

  // Handler for setting daily goal
  const handleSetDailyGoal = async (target: number) => {
    await saveDailyGoal(target);
    toast.success(`Daily goal set to ${target} applications!`);
  };

  // Handlers
  const handleAddClick = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setEditingJob(null);
    setIsJobModalOpen(true);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setIsJobModalOpen(true);
  };

  const handleSaveJob = async (data: JobFormData) => {
    // If it's a new custom platform, add it to our list
    const predefinedPlatforms = [
      'indeed', 'linkedin', 'glassdoor', 'ziprecruiter', 
      'monster', 'whatsapp', 'email', 'direct', 'referral'
    ];
    const platform = data.platform.trim().toLowerCase();
    if (platform && !predefinedPlatforms.includes(platform)) {
      addCustomPlatform(platform);
    }

    if (editingJob) {
      await updateJob(editingJob.id, data);
      toast.success('Application updated successfully');
    } else {
      const duplicate = await addJob(data);
      if (duplicate?.isDuplicate) {
        toast.warning(`Possible duplicate: ${duplicate.reason}`, {
          duration: 5000,
        });
      } else {
        toast.success('Application added successfully');
      }
    }
  };

  const handleDeleteJob = async (id: string) => {
    await deleteJob(id);
    toast.success('Application deleted');
  };

  const handleLogout = async () => {
    await signOut();
    setActiveTab('dashboard');
    toast.success('Signed out successfully');
  };

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setActiveTab('details');
  };

  const handleBackFromDetails = () => {
    setSelectedJob(null);
    setActiveTab('dashboard');
  };

  const handleProfileClick = () => {
    if (user) {
      setActiveTab('profile');
    }
  };

  const handleBackFromProfile = () => {
    setActiveTab('dashboard');
  };

  const handleExport = () => {
    const xmlData = jobs.map(job => `
  <application>
    <companyName>${job.companyName}</companyName>
    <position>${job.position}</position>
    <status>${job.status}</status>
    <platform>${job.platform || ''}</platform>
    <salary>${job.salary || ''}</salary>
    <location>${job.location || ''}</location>
    <jobListing>${job.jobListing || ''}</jobListing>
    <notes>${job.notes || ''}</notes>
    <appliedDate>${job.appliedDate || ''}</appliedDate>
  </application>`).join('');
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<applications>${xmlData}\n</applications>`;
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'job-applications.xml';
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${jobs.length} applications`);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xml';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const text = await file.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'application/xml');
      const applications = doc.querySelectorAll('application');
      
      for (const app of applications) {
        const jobData: JobFormData = {
          companyName: app.querySelector('companyName')?.textContent || '',
          position: app.querySelector('position')?.textContent || '',
          status: (app.querySelector('status')?.textContent as Job['status']) || 'pending',
          platform: app.querySelector('platform')?.textContent || '',
          salary: app.querySelector('salary')?.textContent || '',
          location: app.querySelector('location')?.textContent || '',
          jobListing: app.querySelector('jobListing')?.textContent || '',
          notes: app.querySelector('notes')?.textContent || '',
          appliedDate: app.querySelector('appliedDate')?.textContent || new Date().toISOString().split('T')[0],
        };
        await addJob(jobData);
      }
      toast.success(`Imported ${applications.length} applications`);
    };
    input.click();
  };

  const handleAuthModalClose = () => {
    setIsAuthModalOpen(false);
    clearAuthError();
  };

  // Initial loading state (auth + first fetch of jobs)
  const isInitialLoading = authLoading || (user && !jobsInitialized);

  // Render mobile content based on active tab
  const renderMobileContent = () => {
    switch (activeTab) {
      case 'insights':
        return (
          <motion.div
            key="insights"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <InsightsPage jobs={jobs} stats={stats} />
          </motion.div>
        );
      case 'details':
        return selectedJob ? (
          <motion.div
            key="details"
            variants={slideInRightVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <JobDetailsPage
              job={selectedJob}
              onBack={handleBackFromDetails}
              onEdit={handleEditJob}
            />
          </motion.div>
        ) : (
          <div className="text-center py-8 text-light-grey">No job selected</div>
        );
      case 'profile':
        return user ? (
          <ProfilePage
            user={user}
            jobs={jobs}
            onBack={handleBackFromProfile}
            onLogout={handleLogout}
          />
        ) : (
          <div className="text-center py-8 text-light-grey">Please sign in</div>
        );
      case 'settings':
        return (
          <motion.div
            key="settings"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <SettingsPage
              user={user}
              jobs={jobs}
              onLogout={handleLogout}
              onExport={handleExport}
              onImport={handleImport}
            />
          </motion.div>
        );
      case 'jobs':
        return (
          <JobsPage
            jobs={filteredJobs}
            filters={filters}
            onSearchChange={setSearch}
            onEdit={handleEditJob}
            onDelete={handleDeleteJob}
            onView={handleViewJob}
            onAddClick={handleAddClick}
            loading={jobsLoading}
          />
        );
      case 'dashboard':
      default:
        return (
          <DashboardPage
            user={user}
            jobs={filteredJobs}
            stats={stats}
            filters={filters}
            onSearchChange={setSearch}
            onEdit={handleEditJob}
            onDelete={handleDeleteJob}
            onView={handleViewJob}
            onLoginClick={() => setIsAuthModalOpen(true)}
            onProfileClick={handleProfileClick}
            onAddClick={handleAddClick}
            loading={jobsLoading}
            streakData={streakData}
            dailyGoal={dailyGoal}
            todayApplications={todayJobCount}
            onSetDailyGoal={handleSetDailyGoal}
          />
        );
    }
  };

  // Render desktop content based on active tab
  const renderDesktopContent = () => {
    switch (activeTab) {
      case 'insights':
        return (
          <motion.div
            key="desktop-insights"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="max-w-6xl mx-auto"
          >
            <InsightsPage jobs={jobs} stats={stats} />
          </motion.div>
        );
      case 'details':
        return selectedJob ? (
          <motion.div
            key="desktop-details"
            variants={slideInRightVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="max-w-4xl mx-auto"
          >
            <JobDetailsPage
              job={selectedJob}
              onBack={handleBackFromDetails}
              onEdit={handleEditJob}
            />
          </motion.div>
        ) : (
          <div className="text-center py-8 text-light-grey">No job selected</div>
        );
      case 'profile':
        return user ? (
          <motion.div
            key="desktop-profile"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="max-w-2xl mx-auto"
          >
            <ProfilePage
              user={user}
              jobs={jobs}
              onBack={handleBackFromProfile}
              onLogout={handleLogout}
            />
          </motion.div>
        ) : (
          <div className="text-center py-8 text-light-grey">Please sign in</div>
        );
      case 'settings':
        return (
          <motion.div
            key="desktop-settings"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="max-w-2xl mx-auto"
          >
            <SettingsPage
              user={user}
              jobs={jobs}
              onLogout={handleLogout}
              onExport={handleExport}
              onImport={handleImport}
            />
          </motion.div>
        );
      case 'jobs':
        return (
          <motion.div
            key="desktop-jobs"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="max-w-6xl mx-auto"
          >
            <JobsPage
              jobs={filteredJobs}
              filters={filters}
              onSearchChange={setSearch}
              onEdit={handleEditJob}
              onDelete={handleDeleteJob}
              onView={handleViewJob}
              onAddClick={handleAddClick}
              loading={jobsLoading}
            />
          </motion.div>
        );
      case 'dashboard':
      default:
        return (
          <DashboardPageDesktop
            jobs={filteredJobs}
            stats={stats}
            filters={filters}
            onSearchChange={setSearch}
            onEdit={handleEditJob}
            onDelete={handleDeleteJob}
            onView={handleViewJob}
            onAddClick={handleAddClick}
            loading={jobsLoading}
            streakData={streakData}
            dailyGoal={dailyGoal}
            todayApplications={todayJobCount}
            onSetDailyGoal={handleSetDailyGoal}
          />
        );
    }
  };

  return (
    <ThemeProvider>
      <AnimatePresence mode="wait">
        {isInitialLoading ? (
          <motion.div
            key="loading-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LoadingScreen />
          </motion.div>
        ) : (
          <div key="main-app" className="contents">
            {/* Mobile Layout */}
            <div className={`lg:hidden min-h-screen bg-app-bg-light dark:bg-app-bg text-slate-900 dark:text-off-white font-display ${activeTab !== 'details' && activeTab !== 'profile' ? 'pb-24' : ''}`}>
              <Suspense fallback={<LoadingSpinner />}>
                <AnimatePresence mode="wait">
                  {renderMobileContent()}
                </AnimatePresence>
              </Suspense>

              {/* Bottom Navigation - hidden on detail and profile pages */}
              {activeTab !== 'details' && activeTab !== 'profile' && (
                <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
              )}
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:flex h-screen w-full bg-surface dark:bg-app-bg font-display overflow-hidden">
              {/* Sidebar */}
              <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

              {/* Main Content */}
              <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Desktop Header */}
                <DesktopHeader
                  user={user}
                  searchValue={filters.search}
                  onSearchChange={setSearch}
                  onLoginClick={() => setIsAuthModalOpen(true)}
                  onProfileClick={handleProfileClick}
                />

                {/* Content Area */}
                <div className={`flex-1 overflow-y-auto ${activeTab === 'details' || activeTab === 'profile' ? '' : 'p-8'}`}>
                  <Suspense fallback={<LoadingSpinner />}>
                    <AnimatePresence mode="wait">
                      {renderDesktopContent()}
                    </AnimatePresence>
                  </Suspense>
                </div>
              </main>
            </div>

            {/* Lazy-loaded Modals */}
            <Suspense fallback={null}>
              {/* Job Modal */}
              <JobModal
                isOpen={isJobModalOpen}
                onClose={() => setIsJobModalOpen(false)}
                onSave={handleSaveJob}
                job={editingJob}
                customPlatforms={customPlatforms}
                onDeleteCustomPlatform={removeCustomPlatform}
              />

              {/* Auth Modal */}
              <AuthModal
                isOpen={isAuthModalOpen}
                onClose={handleAuthModalClose}
                onSignIn={signIn}
                onSignUp={signUp}
                onGoogleSignIn={signInWithGoogle}
                error={authError}
              />
            </Suspense>

            {/* Toast notifications */}
            <Toaster />
          </div>
        )}
      </AnimatePresence>
    </ThemeProvider>
  );
}

export default App;
