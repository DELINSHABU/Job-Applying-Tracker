import { Button } from '../ui/button';
import type { Job, JobStatus } from '../../types';

interface JobDetailsPageProps {
  job: Job;
  onBack: () => void;
  onEdit: (job: Job) => void;
}

function getStatusStyle(status: JobStatus) {
  switch (status) {
    case 'pending':
      return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' };
    case 'interviewing':
    case 'callback':
      return { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-500' };
    case 'offer':
      return { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' };
    case 'rejected':
      return { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-600 dark:text-rose-400', dot: 'bg-rose-500' };
    default:
      return { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', dot: 'bg-slate-500' };
  }
}

export function JobDetailsPage({ job, onBack, onEdit }: JobDetailsPageProps) {
  const statusStyle = getStatusStyle(job.status);
  
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const openJobLink = () => {
    if (job.jobListing) {
      window.open(job.jobListing, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-app-bg-light dark:bg-app-bg pb-24 lg:pb-28">
      {/* Header Navigation */}
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
        <span className="text-sm font-semibold tracking-wide uppercase text-slate-500 dark:text-light-grey">Application Details</span>
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
          aria-label="Share"
        >
          <span className="material-icons-round">ios_share</span>
        </Button>
      </nav>

      <main className="px-5 pt-4 space-y-8">
        {/* Main Profile Header */}
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-white dark:bg-card-bg shadow-xl flex items-center justify-center p-4 overflow-hidden border border-slate-200 dark:border-card-border">
              <span className="material-icons-round text-4xl text-primary">business</span>
            </div>
            <div className={`absolute -bottom-2 -right-2 w-8 h-8 ${statusStyle.dot} border-4 border-card dark:border-background rounded-full`}></div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-off-white">{job.position}</h1>
            <p className="text-lg text-slate-500 dark:text-light-grey font-medium">{job.companyName}</p>
          </div>
          <div className={`inline-flex items-center px-4 py-1.5 rounded-full ${statusStyle.bg} ${statusStyle.text} border border-current/20`}>
            <span className={`w-2 h-2 rounded-full ${statusStyle.dot} mr-2`}></span>
            <span className="text-sm font-semibold tracking-wide capitalize">{job.status}</span>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            onClick={() => onEdit(job)}
            className="flex flex-col items-center justify-center p-4 h-auto rounded-xl bg-white dark:bg-card-bg border-slate-200 dark:border-card-border active:scale-95"
          >
            <span className="material-icons-round text-primary mb-1">edit</span>
            <span className="text-xs font-medium text-slate-700 dark:text-off-white">Edit</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center p-4 h-auto rounded-xl bg-white dark:bg-card-bg border-slate-200 dark:border-card-border active:scale-95"
          >
            <span className="material-icons-round text-primary mb-1">sync_alt</span>
            <span className="text-xs font-medium text-slate-700 dark:text-off-white">Status</span>
          </Button>
          <Button
            variant="outline"
            onClick={openJobLink}
            className="flex flex-col items-center justify-center p-4 h-auto rounded-xl bg-white dark:bg-card-bg border-slate-200 dark:border-card-border active:scale-95"
            disabled={!job.jobListing}
          >
            <span className="material-icons-round text-primary mb-1">open_in_new</span>
            <span className="text-xs font-medium text-slate-700 dark:text-off-white">Job Link</span>
          </Button>
        </section>

        {/* Job Info Grid */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 dark:text-light-grey uppercase tracking-widest px-1">Job Info</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-card-bg border border-slate-200 dark:border-card-border">
              <p className="text-xs text-slate-500 dark:text-light-grey mb-1">Salary Range</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-off-white">{job.salary || 'Not specified'}</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-card-bg border border-slate-200 dark:border-card-border">
              <p className="text-xs text-slate-500 dark:text-light-grey mb-1">Location</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-off-white">{job.location || 'Not specified'}</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-card-bg border border-slate-200 dark:border-card-border">
              <p className="text-xs text-slate-500 dark:text-light-grey mb-1">Platform</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-off-white capitalize">{job.platform}</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-card-bg border border-slate-200 dark:border-card-border">
              <p className="text-xs text-slate-500 dark:text-light-grey mb-1">Applied Date</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-off-white">{formatDate(job.appliedDate)}</p>
            </div>
            {job.website && (
              <div className="col-span-2 p-4 rounded-xl bg-white dark:bg-card-bg border border-slate-200 dark:border-card-border">
                <p className="text-xs text-slate-500 dark:text-light-grey mb-1">Website</p>
                <a 
                  href={job.website.startsWith('http') ? job.website : `https://${job.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-primary hover:underline break-all"
                >
                  {job.website}
                </a>
              </div>
            )}
          </div>
        </section>

        {/* Timeline Section */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 dark:text-light-grey uppercase tracking-widest px-1">Timeline</h3>
          <div className="space-y-0 relative">
            <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-card-border"></div>
            
            {/* Current Status */}
            <div className="relative pl-10 pb-6">
              <div className="absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full bg-primary ring-4 ring-card dark:ring-background"></div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-off-white capitalize">{job.status}</p>
                <p className="text-xs text-slate-500 dark:text-light-grey">Current status</p>
              </div>
            </div>
            
            {/* Applied */}
            <div className="relative pl-10">
              <div className="absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full bg-muted-foreground ring-4 ring-card dark:ring-background"></div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-off-white">Application Submitted</p>
                <p className="text-xs text-slate-500 dark:text-light-grey">{formatDate(job.appliedDate)}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Notes Section */}
        {job.notes && (
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-slate-400 dark:text-light-grey uppercase tracking-widest">Notes</h3>
              <span className="material-icons-round text-primary text-sm">edit_note</span>
            </div>
            <div className="p-5 rounded-xl bg-white dark:bg-card-bg border border-slate-200 dark:border-card-border leading-relaxed text-sm text-slate-600 dark:text-light-grey">
              {job.notes}
            </div>
          </section>
        )}

        {/* Contact Info */}
        {(job.email || job.phone) && (
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 dark:text-light-grey uppercase tracking-widest px-1">Contact</h3>
            <div className="space-y-3">
              {job.email && (
                <a href={`mailto:${job.email}`} className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-card-bg border border-slate-200 dark:border-card-border">
                  <span className="material-icons-round text-primary">email</span>
                  <span className="text-sm text-slate-700 dark:text-off-white">{job.email}</span>
                </a>
              )}
              {job.phone && (
                <a href={`tel:${job.phone}`} className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-card-bg border border-slate-200 dark:border-card-border">
                  <span className="material-icons-round text-primary">phone</span>
                  <span className="text-sm text-slate-700 dark:text-off-white">{job.phone}</span>
                </a>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Bottom Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 pb-6 lg:p-6 bg-gradient-to-t from-app-bg-light dark:from-app-bg via-app-bg-light/95 dark:via-app-bg/95 to-transparent">
        <div className="max-w-md mx-auto lg:max-w-sm">
          <Button
            onClick={() => onEdit(job)}
            className="w-full py-3 h-auto rounded-xl shadow-lg shadow-primary/30 font-bold active:scale-[0.98]"
          >
            <span className="material-icons-round">edit</span>
            <span>Edit Application</span>
          </Button>
        </div>
      </footer>
    </div>
  );
}
