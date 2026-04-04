import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SuggestedJob } from '@/types';

interface SuggestedJobCardProps {
  job: SuggestedJob;
  onDismiss: (jobId: string) => void;
  onRemove: (jobId: string) => void;
  onView: (job: SuggestedJob) => void;
}

export function SuggestedJobCard({ job, onDismiss, onRemove, onView }: SuggestedJobCardProps) {
  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      linkedin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      indeed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      naukri: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      naukrigulf: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      glassdoor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      ziprecruiter: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
      monster: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    };
    return colors[platform] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-card-bg border-slate-200 dark:border-card-border"
      onClick={() => onView(job)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-off-white truncate">
              {job.position}
            </h3>
            <p className="text-sm text-slate-600 dark:text-light-grey truncate">
              {job.companyName}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className={`text-xs ${getPlatformColor(job.platform)}`}>
              {job.platform}
            </Badge>
            {job.fitScore !== undefined && (
              <span className="text-xs font-medium text-primary">
                {job.fitScore}% match
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-light-grey mb-2">
          {job.location && (
            <span className="flex items-center gap-1">
              <span className="material-icons-round text-sm">location_on</span>
              {job.location}
            </span>
          )}
          {job.salary && (
            <span className="flex items-center gap-1">
              <span className="material-icons-round text-sm">payments</span>
              {job.salary}
            </span>
          )}
          {job.jobPostDate && (
            <span className="flex items-center gap-1">
              <span className="material-icons-round text-sm">schedule</span>
              {formatDate(job.jobPostDate)}
            </span>
          )}
        </div>

        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.skills.slice(0, 4).map((skill: string) => (
              <Badge key={skill} variant="outline" className="text-[10px] py-0 px-1">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 4 && (
              <Badge variant="outline" className="text-[10px] py-0 px-1">
                +{job.skills.length - 4}
              </Badge>
            )}
          </div>
        )}

        <div 
          className="flex items-center gap-1 mt-3 pt-2 border-t border-slate-100 dark:border-card-border"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(job.id);
            }}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
          >
            <span className="material-icons-round text-sm">visibility_off</span>
            Hide
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(job.id);
            }}
            className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 ml-3"
          >
            <span className="material-icons-round text-sm">delete</span>
            Remove
          </button>
          {job.jobListing && (
            <a
              href={job.jobListing}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 ml-auto"
            >
              <span className="material-icons-round text-sm">open_in_new</span>
              View
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
