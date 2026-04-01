import { motion } from 'motion/react';
import { JobCard } from './JobCard';
import { JobListSkeleton } from './JobCardSkeleton';
import { Card, CardContent } from './ui/card';
import { staggerContainerVariants, staggerItemVariants } from '../lib/animations';
import type { Job } from '../types';

interface JobListProps {
  jobs: Job[];
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
  onView?: (job: Job) => void;
  loading?: boolean;
}

export function JobList({ jobs, onEdit, onDelete, onView, loading }: JobListProps) {
  if (loading) {
    return <JobListSkeleton count={3} />;
  }

  if (jobs.length === 0) {
    return (
      <main className="px-5 mt-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-white dark:bg-card-bg rounded-2xl border-slate-200 dark:border-card-border">
            <CardContent className="p-8 text-center">
              <span className="material-icons-round text-5xl text-slate-400 dark:text-light-grey mb-4">work_outline</span>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-off-white mb-2">No Applications Yet</h2>
              <p className="text-sm text-slate-500 dark:text-light-grey">
                Start tracking your job applications by tapping the + button
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="px-5 mt-6 space-y-4 pb-24">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold text-lg text-slate-900 dark:text-off-white">Recent Applications</h2>
        <span className="text-primary text-sm font-medium">{jobs.length} total</span>
      </div>
      
      <motion.div
        className="space-y-4"
        variants={staggerContainerVariants}
        initial="initial"
        animate="animate"
      >
        {jobs.map(job => (
          <motion.div key={job.id} variants={staggerItemVariants}>
            <JobCard
              job={job} 
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
            />
          </motion.div>
        ))}
      </motion.div>
    </main>
  );
}
