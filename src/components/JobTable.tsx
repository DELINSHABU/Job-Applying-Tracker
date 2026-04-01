import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import type { Job, JobStatus } from '../types';

interface JobTableProps {
  jobs: Job[];
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
  onView: (job: Job) => void;
  loading?: boolean;
}

function getStatusStyle(status: JobStatus) {
  switch (status) {
    case 'pending':
      return 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800';
    case 'interviewing':
    case 'callback':
      return 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800';
    case 'offer':
      return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800';
    case 'rejected':
      return 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800';
    default:
      return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-700';
  }
}

function getCompanyIcon(companyName: string): { icon: string; bgColor: string; iconColor: string } {
  const name = companyName.toLowerCase();
  if (name.includes('tech') || name.includes('software')) {
    return { icon: 'code', bgColor: 'bg-blue-50 dark:bg-blue-900/30', iconColor: 'text-blue-500' };
  }
  if (name.includes('finance') || name.includes('bank')) {
    return { icon: 'account_balance', bgColor: 'bg-emerald-50 dark:bg-emerald-900/30', iconColor: 'text-emerald-500' };
  }
  if (name.includes('health') || name.includes('medical')) {
    return { icon: 'health_and_safety', bgColor: 'bg-rose-50 dark:bg-rose-900/30', iconColor: 'text-rose-500' };
  }
  return { icon: 'business', bgColor: 'bg-purple-50 dark:bg-purple-900/30', iconColor: 'text-purple-500' };
}

export function JobTable({ jobs, onEdit, onDelete, onView, loading }: JobTableProps) {
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteJobId) {
      onDelete(deleteJobId);
      setDeleteJobId(null);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white dark:bg-card-bg rounded-[32px] border-slate-200 dark:border-card-border">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-6 w-48" />
            <div className="flex gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-4 border-b border-slate-100 dark:border-card-border last:border-0">
                <Skeleton className="w-11 h-11 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card className="bg-white dark:bg-card-bg rounded-[32px] border-slate-200 dark:border-card-border">
        <CardContent className="p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-light-grey mb-4">work_outline</span>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-off-white mb-2">No Applications Yet</h2>
          <p className="text-sm text-slate-500 dark:text-light-grey">
            Start tracking your job applications by clicking "New Application"
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-white dark:bg-card-bg rounded-[32px] border border-slate-200 dark:border-card-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-100 dark:border-card-border flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-off-white">Recent Applications</h3>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-slate-400 dark:text-light-grey">
            <span className="material-symbols-outlined">tune</span>
          </Button>
          <Button variant="link" className="text-primary px-2 py-1">View All</Button>
        </div>
      </div>

      {/* Table */}
      <Table className="w-full">
        <TableHeader>
          <TableRow className="bg-slate-50/50 dark:bg-card-border/30 hover:bg-slate-50/50 dark:hover:bg-card-border/30 border-0">
            <TableHead className="px-8 py-4 text-slate-400 dark:text-light-grey text-[11px] font-bold uppercase tracking-widest">Company & Role</TableHead>
            <TableHead className="px-6 py-4 text-slate-400 dark:text-light-grey text-[11px] font-bold uppercase tracking-widest">Status</TableHead>
            <TableHead className="px-6 py-4 text-slate-400 dark:text-light-grey text-[11px] font-bold uppercase tracking-widest">Location</TableHead>
            <TableHead className="px-6 py-4 text-slate-400 dark:text-light-grey text-[11px] font-bold uppercase tracking-widest">Salary</TableHead>
            <TableHead className="px-6 py-4 text-slate-400 dark:text-light-grey text-[11px] font-bold uppercase tracking-widest">Date Applied</TableHead>
            <TableHead className="px-8 py-4 text-right text-slate-400 dark:text-light-grey text-[11px] font-bold uppercase tracking-widest">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => {
            const companyIcon = getCompanyIcon(job.companyName);
            return (
              <TableRow 
                key={job.id} 
                className="group hover:bg-slate-50/80 dark:hover:bg-card-border/50 transition-colors cursor-pointer border-slate-50 dark:border-card-border"
                onClick={() => onView(job)}
              >
                <TableCell className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl ${companyIcon.bgColor} flex items-center justify-center shrink-0`}>
                      <span className={`material-symbols-outlined ${companyIcon.iconColor}`}>{companyIcon.icon}</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-off-white">{job.companyName}</p>
                      <p className="text-xs text-slate-500 dark:text-light-grey">{job.position}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-5">
                  <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full border ${getStatusStyle(job.status)}`}>
                    {job.status}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-5">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-light-grey">
                    <span className="material-symbols-outlined text-base text-slate-400 dark:text-light-grey">
                      {job.location?.toLowerCase().includes('remote') ? 'language' : 'location_on'}
                    </span>
                    {job.location || 'N/A'}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-5 text-sm font-medium text-slate-700 dark:text-off-white">
                  {job.salary || 'N/A'}
                </TableCell>
                <TableCell className="px-6 py-5 text-sm text-slate-500 dark:text-light-grey">
                  {formatDate(job.appliedDate)}
                </TableCell>
                <TableCell className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); onEdit(job); }}
                      className="p-2 h-auto text-slate-400 hover:text-primary hover:bg-white dark:hover:bg-card-bg hover:shadow-sm hover:border-slate-100 dark:hover:border-card-border"
                    >
                      <span className="material-symbols-outlined text-xl">edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); onView(job); }}
                      className="p-2 h-auto text-slate-400 hover:text-primary hover:bg-white dark:hover:bg-card-bg hover:shadow-sm hover:border-slate-100 dark:hover:border-card-border"
                    >
                      <span className="material-symbols-outlined text-xl">visibility</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); setDeleteJobId(job.id); }}
                      className="p-2 h-auto text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-card-bg hover:shadow-sm hover:border-slate-100 dark:hover:border-card-border"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Footer */}
      <div className="px-8 py-4 bg-slate-50/30 dark:bg-card-border/20 flex items-center justify-between border-t border-slate-100 dark:border-card-border">
        <p className="text-xs text-slate-500 dark:text-light-grey">
          Showing 1 to {Math.min(jobs.length, 10)} of {jobs.length} applications
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8 text-slate-400 dark:text-light-grey border-slate-200 dark:border-card-border">
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 text-slate-400 dark:text-light-grey border-slate-200 dark:border-card-border">
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={!!deleteJobId}
        onOpenChange={(open) => !open && setDeleteJobId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
