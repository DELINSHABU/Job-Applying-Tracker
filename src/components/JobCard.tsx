import { useState } from 'react';
import { Button } from './ui/button';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import type { Job, JobStatus } from '../types';

interface JobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
  onView?: (job: Job) => void;
}

// Get status badge styling
function getStatusStyle(status: JobStatus): { bg: string; text: string; border: string } {
  switch (status) {
    case 'pending':
      return { 
        bg: 'bg-amber-50 dark:bg-amber-900/30', 
        text: 'text-amber-600 dark:text-amber-400', 
        border: 'border-amber-100 dark:border-amber-800' 
      };
    case 'interviewing':
    case 'callback':
      return { 
        bg: 'bg-blue-50 dark:bg-blue-900/30', 
        text: 'text-blue-600 dark:text-blue-400', 
        border: 'border-blue-100 dark:border-blue-800' 
      };
    case 'offer':
      return { 
        bg: 'bg-emerald-50 dark:bg-emerald-900/30', 
        text: 'text-emerald-600 dark:text-emerald-400', 
        border: 'border-emerald-100 dark:border-emerald-800' 
      };
    case 'rejected':
      return { 
        bg: 'bg-rose-50 dark:bg-rose-900/30', 
        text: 'text-rose-600 dark:text-rose-400', 
        border: 'border-rose-100 dark:border-rose-800' 
      };
    default:
      return { 
        bg: 'bg-slate-50 dark:bg-slate-800', 
        text: 'text-slate-600 dark:text-slate-400', 
        border: 'border-slate-100 dark:border-slate-700' 
      };
  }
}

// Get icon and color for company
function getCompanyIcon(companyName: string): { icon: string; bgColor: string; iconColor: string } {
  const name = companyName.toLowerCase();
  if (name.includes('tech') || name.includes('software')) {
    return { icon: 'code', bgColor: 'bg-blue-50 dark:bg-blue-900/30', iconColor: 'text-blue-500 dark:text-blue-400' };
  }
  if (name.includes('finance') || name.includes('bank')) {
    return { icon: 'account_balance', bgColor: 'bg-emerald-50 dark:bg-emerald-900/30', iconColor: 'text-emerald-500 dark:text-emerald-400' };
  }
  if (name.includes('health') || name.includes('medical')) {
    return { icon: 'health_and_safety', bgColor: 'bg-rose-50 dark:bg-rose-900/30', iconColor: 'text-rose-500 dark:text-rose-400' };
  }
  // Default business icon
  return { icon: 'business', bgColor: 'bg-purple-50 dark:bg-purple-900/30', iconColor: 'text-purple-500 dark:text-purple-400' };
}

export function JobCard({ job, onEdit, onDelete, onView }: JobCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const statusStyle = getStatusStyle(job.status);
  const companyIcon = getCompanyIcon(job.companyName);
  
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleDelete = () => {
    onDelete(job.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div 
        className="bg-white dark:bg-card-bg p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-card-border hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
        onClick={() => onView?.(job)}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-3">
            <div className={`w-12 h-12 rounded-xl ${companyIcon.bgColor} border border-${companyIcon.iconColor.replace('text-', '')}/50 flex items-center justify-center`}>
              <span className={`material-icons-round ${companyIcon.iconColor}`}>{companyIcon.icon}</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-off-white">{job.companyName}</h3>
              <p className="text-sm text-slate-500 dark:text-light-grey">{job.position}</p>
            </div>
          </div>
          <span className={`px-3 py-1 ${statusStyle.bg} ${statusStyle.text} text-[10px] font-bold uppercase tracking-wider rounded-full border ${statusStyle.border}`}>
            {job.status}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-y-3 mt-4 border-t border-slate-100 dark:border-card-border pt-4">
          {job.location && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-light-grey">
              <span className="material-icons-round text-sm">location_on</span>
              {job.location}
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-light-grey">
            <span className="material-icons-round text-sm">payments</span>
            {job.salary || 'N/A'}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-light-grey">
            <span className="material-icons-round text-sm">calendar_today</span>
            Applied {formatDate(job.appliedDate)}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-light-grey">
            <span className="material-icons-round text-sm">link</span>
            {job.platform}
          </div>
        </div>

        {/* Action buttons */}
        <div 
          className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-card-border"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="secondary"
            onClick={(e) => { e.stopPropagation(); onEdit(job); }}
            className="flex-1 bg-primary/20 text-primary hover:bg-primary/30"
          >
            Edit
          </Button>
          <Button
            variant="secondary"
            onClick={(e) => { e.stopPropagation(); setShowDeleteDialog(true); }}
            className="flex-1 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
      />
    </>
  );
}
