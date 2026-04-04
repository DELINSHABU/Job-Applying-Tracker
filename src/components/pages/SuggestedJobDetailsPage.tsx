import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  suggestedJobsService, 
  jobsService 
} from '@/services/firebase';
import { getLocalDateString } from '@/lib/utils';
import type { SuggestedJob, JobFormData, JobStatus } from '@/types';

interface SuggestedJobDetailsPageProps {
  job: SuggestedJob;
  userId: string;
  onBack: () => void;
}

export function SuggestedJobDetailsPage({ job, userId, onBack }: SuggestedJobDetailsPageProps) {
  const [showAddToApplied, setShowAddToApplied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<Partial<JobFormData>>({
    companyName: job.companyName,
    position: job.position,
    jobListing: job.jobListing,
    salary: job.salary,
    location: job.location,
    platform: job.platform,
    notes: '',
    status: 'pending' as JobStatus,
    tags: [],
  });

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      linkedin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      indeed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      naukri: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      naukrigulf: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      glassdoor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    };
    return colors[platform] || 'bg-slate-100 text-slate-700';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleOpenOriginal = () => {
    if (job.jobListing) {
      window.open(job.jobListing, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDismiss = async () => {
    try {
      await suggestedJobsService.dismissSuggestedJob(userId, job.id);
      toast.success('Job hidden from suggestions');
      onBack();
    } catch (err) {
      toast.error('Failed to dismiss job');
    }
  };

  const handleAddToApplied = async () => {
    if (!formData.companyName || !formData.position) {
      toast.error('Company name and position are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const newJob: JobFormData = {
        companyName: formData.companyName || '',
        position: formData.position || '',
        jobListing: formData.jobListing,
        salary: formData.salary,
        location: formData.location,
        platform: formData.platform || 'linkedin',
        notes: formData.notes,
        status: formData.status || 'pending',
        tags: formData.tags,
        appliedDate: getLocalDateString(),
      };

      const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const jobWithId = { ...newJob, id: jobId };

      await jobsService.saveJob(userId, jobWithId as any);
      await suggestedJobsService.markAsApplied(userId, job.id, jobId);

      toast.success('Job added to your applications!');
      setShowAddToApplied(false);
      onBack();
    } catch (err) {
      toast.error('Failed to add job to applications');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-md mx-auto px-5 pb-24 pt-4">
      {/* Header */}
      <header className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <span className="material-icons-round">arrow_back</span>
        </Button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-off-white">Job Details</h1>
      </header>

      {/* Job Info */}
      <div className="bg-white dark:bg-card-bg rounded-xl p-5 shadow-sm border border-slate-200 dark:border-card-border mb-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
            {job.companyName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-off-white">
              {job.position}
            </h2>
            <p className="text-slate-600 dark:text-light-grey">{job.companyName}</p>
            <Badge className={`mt-2 ${getPlatformColor(job.platform)}`}>
              {job.platform}
            </Badge>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mb-4">
          {job.jobListing && (
            <Button onClick={handleOpenOriginal} variant="outline" className="flex-1">
              <span className="material-icons-round mr-1 text-sm">open_in_new</span>
              Open Original
            </Button>
          )}
          <Button onClick={handleDismiss} variant="outline" className="flex-1">
            <span className="material-icons-round mr-1 text-sm">visibility_off</span>
            Hide
          </Button>
        </div>

        {/* Job Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {job.location && (
            <div>
              <p className="text-slate-400 dark:text-light-grey text-xs">Location</p>
              <p className="font-medium text-slate-900 dark:text-off-white">{job.location}</p>
            </div>
          )}
          {job.salary && (
            <div>
              <p className="text-slate-400 dark:text-light-grey text-xs">Salary</p>
              <p className="font-medium text-slate-900 dark:text-off-white">{job.salary}</p>
            </div>
          )}
          {job.jobPostDate && (
            <div>
              <p className="text-slate-400 dark:text-light-grey text-xs">Posted</p>
              <p className="font-medium text-slate-900 dark:text-off-white">{formatDate(job.jobPostDate)}</p>
            </div>
          )}
          <div>
            <p className="text-slate-400 dark:text-light-grey text-xs">Fetched</p>
            <p className="font-medium text-slate-900 dark:text-off-white">{formatDate(job.fetchedAt)}</p>
          </div>
        </div>

        {/* Skills */}
        {job.skills && job.skills.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-card-border">
            <p className="text-slate-400 dark:text-light-grey text-xs mb-2">Skills</p>
            <div className="flex flex-wrap gap-1">
              {job.skills.map((skill: string) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {job.description && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-card-border">
            <p className="text-slate-400 dark:text-light-grey text-xs mb-2">Description</p>
            <p className="text-sm text-slate-600 dark:text-light-grey line-clamp-4">
              {job.description}
            </p>
          </div>
        )}
      </div>

      {/* Add to Applied Section */}
      <div className="bg-white dark:bg-card-bg rounded-xl shadow-sm border border-slate-200 dark:border-card-border overflow-hidden">
        <button
          onClick={() => setShowAddToApplied(!showAddToApplied)}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-card-border transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white">
              <span className="material-icons-round">add_circle</span>
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-900 dark:text-off-white">Add to Applied Jobs</p>
              <p className="text-xs text-slate-500 dark:text-light-grey">
                Mark this as applied and track it
              </p>
            </div>
          </div>
          <span className="material-icons-round text-slate-400">
            {showAddToApplied ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {showAddToApplied && (
          <div className="p-4 pt-0 border-t border-slate-100 dark:border-card-border">
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 dark:text-light-grey">Company Name</label>
                <input
                  type="text"
                  value={formData.companyName || ''}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-card-border bg-white dark:bg-card-bg text-slate-900 dark:text-off-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-light-grey">Position</label>
                <input
                  type="text"
                  value={formData.position || ''}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-card-border bg-white dark:bg-card-bg text-slate-900 dark:text-off-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-light-grey">Notes (optional)</label>
                <Textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any notes..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              <Button
                onClick={handleAddToApplied}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Adding...' : 'Confirm & Add to Applications'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
