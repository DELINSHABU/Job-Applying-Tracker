import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import type { Job, DuplicateResult } from '../types';

interface DuplicateDetectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAnyway: () => void;
  onDiscard: () => void;
  existingJob: Job;
  duplicateResult: DuplicateResult;
  newJobData: Partial<Job>;
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-500/20 text-amber-400',
    interviewing: 'bg-purple-500/20 text-purple-400',
    callback: 'bg-purple-500/20 text-purple-400',
    offer: 'bg-emerald-500/20 text-emerald-400',
    rejected: 'bg-rose-500/20 text-rose-400',
  };
  return styles[status] || 'bg-slate-500/20 text-slate-400';
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function DuplicateDetectionModal({
  isOpen,
  onClose,
  onAddAnyway,
  onDiscard,
  existingJob,
  duplicateResult,
  newJobData,
}: DuplicateDetectionModalProps) {
  const confidence = Math.round(duplicateResult.confidence * 100);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full p-0 overflow-hidden bg-card-bg border-border rounded-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center gap-3 px-6 py-4 bg-card-bg/80 backdrop-blur-xl border-b border-border">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-icons-round text-primary">warning</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-off-white">Duplicate Detected</h2>
            <p className="text-xs text-light-grey">Review before adding</p>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* Introduction */}
          <p className="text-sm text-light-grey text-center">
            Found a similar application already in your database. Review the comparison below.
          </p>

          {/* Existing Application Card */}
          <div className="relative bg-surface-container rounded-2xl overflow-hidden border-l-4 border-primary">
            <div className="p-5">
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-primary">Existing</span>
                  </div>
                  <h3 className="text-lg font-semibold text-off-white">Current Application</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
                  <span className="material-icons-round text-primary">description</span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-light-grey mb-1">Company</p>
                  <p className="text-sm font-medium text-off-white">{existingJob.companyName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-light-grey mb-1">Position</p>
                  <p className="text-sm font-medium text-off-white">{existingJob.position}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-light-grey mb-1">Applied</p>
                  <p className="text-sm font-medium text-off-white font-mono">{formatDate(existingJob.appliedDate)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-light-grey mb-1">Platform</p>
                  <p className="text-sm font-medium text-off-white capitalize">{existingJob.platform || 'Direct'}</p>
                </div>
              </div>

              {/* Status */}
              <div className="mt-4 p-3 rounded-xl bg-surface-container-high/50 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-light-grey">Status</span>
                <span className={`px-2 py-1 rounded text-[10px] font-mono uppercase font-bold ${getStatusBadge(existingJob.status)}`}>
                  {existingJob.status}
                </span>
              </div>
            </div>
          </div>

          {/* VS Divider */}
          <div className="relative flex items-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative mx-auto w-10 h-10 rounded-full bg-card-bg flex items-center justify-center border border-primary/30">
              <span className="text-xs font-bold text-primary font-mono">VS</span>
            </div>
          </div>

          {/* New Entry Card */}
          <div className="relative bg-surface-container rounded-2xl overflow-hidden border-l-4 border-amber-500">
            <div className="p-5">
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500">New Entry</span>
                  </div>
                  <h3 className="text-lg font-semibold text-off-white">Potential Duplicate</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
                  <span className="material-icons-round text-amber-500">content_copy</span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-light-grey mb-1">Company</p>
                  <p className="text-sm font-medium text-off-white">{newJobData.companyName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-light-grey mb-1">Position</p>
                  <p className="text-sm font-medium text-off-white">{newJobData.position}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-light-grey mb-1">Applied</p>
                  <p className="text-sm font-medium text-amber-500 font-mono">{formatDate(newJobData.appliedDate)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-light-grey mb-1">Platform</p>
                  <p className="text-sm font-medium text-off-white capitalize">{newJobData.platform || 'Direct'}</p>
                </div>
              </div>

              {/* Status */}
              <div className="mt-4 p-3 rounded-xl bg-amber-500/10 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-light-grey">Status</span>
                <span className="px-2 py-1 rounded text-[10px] font-mono uppercase font-bold bg-amber-500/20 text-amber-500">
                  {newJobData.status || 'pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Confidence Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-xs font-mono font-medium text-primary">
                {confidence}% Match Confidence
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 flex gap-4 p-4 pb-6 bg-card-bg/90 backdrop-blur-xl border-t border-border">
          <Button
            variant="outline"
            onClick={onDiscard}
            className="flex-1 flex items-center justify-center gap-2 py-3"
          >
            <span className="material-icons-round">close</span>
            Discard
          </Button>
          <Button
            onClick={onAddAnyway}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90"
          >
            <span className="material-icons-round">add_moderator</span>
            Add Anyway
          </Button>
        </div>

        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl"></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}