import { useState, lazy, Suspense } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { pageVariants, slideInRightVariants } from './lib/animations';
import { Header, StatsCards, SearchBar, JobList, FloatingActionButton, BottomNav, Sidebar, DesktopHeader, DesktopStatsCards, LoadingScreen } from './components';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from './components/ui/sonner';
import { useAuth } from './hooks/useAuth';
import { useJobs } from './hooks/useJobs';
import { useSearch } from './hooks/useSearch';
import { useCustomPlatforms } from './hooks/useCustomPlatforms';
import type { Job, JobFormData, NavTab } from './types';

// Lazy load page components (not needed on initial render)
const InsightsPage = lazy(() => import('./components/pages/InsightsPage').then(m => ({ default: m.InsightsPage })));
const JobDetailsPage = lazy(() => import('./components/pages/JobDetailsPage').then(m => ({ default: m.JobDetailsPage })));
const SettingsPage = lazy(() => import('./components/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const ProfilePage = lazy(() => import('./components/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));

// Lazy load modals (only needed on user interaction)
const JobModal = lazy(() => import('./components/JobModal').then(m => ({ default: m.JobModal })));
const AuthModal = lazy(() => import('./components/AuthModal').then(m => ({ default: m.AuthModal })));
const JobTable = lazy(() => import('./components/JobTable').then(m => ({ default: m.JobTable })));

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
  const isInitialLoading = authLoading || (user && jobsLoading && jobs.length === 0);

  if (isInitialLoading) {
    return (
      <ThemeProvider>
        <LoadingScreen />
      </ThemeProvider>
    );
  }

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
      case 'dashboard':
      default:
        return (
          <motion.div
            key="dashboard"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Header */}
            <Header
              user={user}
              onLoginClick={() => setIsAuthModalOpen(true)}
              onProfileClick={handleProfileClick}
            />

            {/* Stats Cards */}
            <StatsCards stats={stats} />

            {/* Search Bar */}
            <SearchBar
              value={filters.search}
              onChange={setSearch}
            />

            {/* Job List */}
            <JobList
              jobs={filteredJobs}
              onEdit={handleEditJob}
              onDelete={handleDeleteJob}
              onView={handleViewJob}
              loading={jobsLoading}
            />

            {/* Floating Action Button */}
            <FloatingActionButton onClick={handleAddClick} />
          </motion.div>
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
      case 'dashboard':
      default:
        return (
          <motion.div
            key="desktop-dashboard"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-8"
          >
            {/* Dashboard Header */}
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-1 text-slate-900 dark:text-off-white">Dashboard Overview</h2>
                <p className="text-slate-500 dark:text-light-grey">
                  {stats.interviewing + stats.callback > 0 
                    ? `You have ${stats.interviewing + stats.callback} interviews scheduled.`
                    : 'Track and manage your job applications.'
                  }
                </p>
              </div>
              <button 
                onClick={handleAddClick}
                className="px-5 py-2.5 bg-primary text-white font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-primary/25 hover:scale-[1.02] transition-transform"
              >
                <span className="material-symbols-outlined text-xl">add</span>
                New Application
              </button>
            </div>

            {/* Stats Cards */}
            <DesktopStatsCards stats={stats} />

            {/* Job Table */}
            <JobTable
              jobs={filteredJobs}
              onEdit={handleEditJob}
              onDelete={handleDeleteJob}
              onView={handleViewJob}
              loading={jobsLoading}
            />
          </motion.div>
        );
    }
  };

  return (
    <ThemeProvider>
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
          <div className={`flex-1 overflow-y-auto hide-scrollbar ${activeTab === 'details' || activeTab === 'profile' ? '' : 'p-8'}`}>
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
    </ThemeProvider>
  );
}

export default App;
