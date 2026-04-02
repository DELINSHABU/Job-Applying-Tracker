import { motion } from 'motion/react';
import { SearchBar } from '../SearchBar';
import { JobList } from '../JobList';
import { Job } from '../../types';

interface JobsPageProps {
  jobs: Job[];
  filters: { search: string };
  onSearchChange: (search: string) => void;
  onEdit: (job: Job) => void;
  onDelete: (jobId: string) => void;
  onView: (job: Job) => void;
  onAddClick: () => void;
  loading: boolean;
}

export function JobsPage({
  jobs,
  filters,
  onSearchChange,
  onEdit,
  onDelete,
  onView,
  onAddClick,
  loading,
}: JobsPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <header className="sticky top-0 z-30 bg-app-bg-light/80 dark:bg-app-bg/80 backdrop-blur-md px-5 pt-12 pb-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-off-white">Applications</h1>
            <p className="text-sm text-slate-500 dark:text-light-grey">
              {jobs.length} {jobs.length === 1 ? 'application' : 'applications'}
            </p>
          </div>
        </div>
      </header>

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
    </motion.div>
  );
}
