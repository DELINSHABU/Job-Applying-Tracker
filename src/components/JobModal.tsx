import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Job, JobFormData, JobStatus, Platform } from '../types';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: JobFormData) => void;
  job?: Job | null;
}

const PLATFORMS: Platform[] = [
  'indeed',
  'linkedin',
  'glassdoor',
  'ziprecruiter',
  'monster',
  'whatsapp',
  'email',
  'direct',
  'referral',
];

const STATUSES: JobStatus[] = ['pending', 'callback', 'interviewing', 'offer', 'rejected'];

// Section header component
function SectionHeader({ icon, iconColor, title }: { icon: string; iconColor: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className={`material-symbols-outlined text-xl ${iconColor}`}>{icon}</span>
      <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">
        {title}
      </h2>
    </div>
  );
}

// Styled input component
function FormInput({ 
  label, 
  required, 
  icon, 
  iconColor,
  ...props 
}: { 
  label: string; 
  required?: boolean; 
  icon?: string;
  iconColor?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
        {label}{required && ' *'}
      </label>
      <div className="relative">
        {icon && (
          <span className={`absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-lg ${iconColor || 'text-slate-400'}`}>
            {icon}
          </span>
        )}
        <input
          {...props}
          className={`w-full bg-muted dark:bg-surface-container-high border border-input dark:border-border rounded-xl px-4 py-3.5 text-foreground dark:text-white placeholder:text-muted-foreground transition-all focus:ring-2 focus:ring-primary/40 focus:border-primary/50 outline-none ${icon ? 'pl-12' : ''} ${props.className || ''}`}
        />
      </div>
    </div>
  );
}

export function JobModal({ isOpen, onClose, onSave, job }: JobModalProps) {
  const [formData, setFormData] = useState<JobFormData>({
    companyName: '',
    position: '',
    website: '',
    jobListing: '',
    salary: '',
    location: '',
    email: '',
    phone: '',
    jobPostDate: '',
    appliedDate: new Date().toISOString().split('T')[0],
    platform: 'linkedin',
    status: 'pending',
    notes: '',
  });

  // Reset form when modal opens/closes or job changes
  useEffect(() => {
    if (job) {
      setFormData({
        companyName: job.companyName,
        position: job.position,
        website: job.website || '',
        jobListing: job.jobListing || '',
        salary: job.salary || '',
        location: job.location || '',
        email: job.email || '',
        phone: job.phone || '',
        jobPostDate: job.jobPostDate || '',
        appliedDate: job.appliedDate || '',
        platform: job.platform,
        status: job.status,
        notes: job.notes || '',
      });
    } else {
      setFormData({
        companyName: '',
        position: '',
        website: '',
        jobListing: '',
        salary: '',
        location: '',
        email: '',
        phone: '',
        jobPostDate: '',
        appliedDate: new Date().toISOString().split('T')[0],
        platform: 'linkedin',
        status: 'pending',
        notes: '',
      });
    }
  }, [job, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleChange = (field: keyof JobFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 gap-0 max-w-lg max-h-[95vh] overflow-hidden flex flex-col bg-card dark:bg-popover border border-border dark:border-border">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-card/80 dark:bg-popover/80 backdrop-blur-md border-b border-border dark:border-border px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
            {job ? 'Edit Application' : 'Add New Application'}
          </h1>
          <button
            type="button"
            onClick={handleSubmit}
            className="text-primary font-semibold px-2 py-1 hover:text-primary/80 transition-colors"
          >
            Save
          </button>
        </header>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pb-28">
          <div className="max-w-md mx-auto p-6 space-y-8">
            {/* Job Details Section */}
            <section className="space-y-5">
              <SectionHeader icon="work" iconColor="text-blue-400" title="Job Details" />
              
              <FormInput
                label="Position Title"
                required
                type="text"
                value={formData.position}
                onChange={(e) => handleChange('position', e.target.value)}
                placeholder="e.g. Senior Product Designer"
              />

              <FormInput
                label="Company Name"
                required
                type="text"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                placeholder="e.g. Google"
              />

              <FormInput
                label="Company Website"
                type="url"
                icon="language"
                iconColor="text-blue-400"
                value={formData.website || ''}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="e.g. https://google.com"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Platform</label>
                  <Select
                    value={formData.platform}
                    onValueChange={(value) => handleChange('platform', value)}
                  >
                    <SelectTrigger className="w-full bg-muted dark:bg-surface-container-high border border-input dark:border-border rounded-xl h-[52px] text-foreground dark:text-white">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map(p => (
                        <SelectItem key={p} value={p}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Status</label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange('status', value as JobStatus)}
                  >
                    <SelectTrigger className="w-full bg-muted dark:bg-surface-container-high border border-input dark:border-border rounded-xl h-[52px] text-foreground dark:text-white">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map(s => (
                        <SelectItem key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <FormInput
                label="Listing URL"
                type="url"
                icon="link"
                iconColor="text-purple-400"
                value={formData.jobListing}
                onChange={(e) => handleChange('jobListing', e.target.value)}
                placeholder="https://..."
              />
            </section>

            {/* Divider */}
            <div className="h-px bg-border dark:bg-border" />

            {/* Compensation & Location Section */}
            <section className="space-y-5">
              <SectionHeader icon="payments" iconColor="text-green-400" title="Compensation & Location" />
              
              <FormInput
                label="Salary Range"
                type="text"
                value={formData.salary}
                onChange={(e) => handleChange('salary', e.target.value)}
                placeholder="e.g. $120k - $150k"
              />

              <FormInput
                label="Location"
                type="text"
                icon="location_on"
                iconColor="text-orange-400"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="e.g. New York (Remote)"
              />
            </section>

            {/* Divider */}
            <div className="h-px bg-border dark:bg-border" />

            {/* Important Dates Section */}
            <section className="space-y-5">
              <SectionHeader icon="calendar_today" iconColor="text-rose-400" title="Important Dates" />
              
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Date Posted"
                  type="date"
                  value={formData.jobPostDate}
                  onChange={(e) => handleChange('jobPostDate', e.target.value)}
                  className="[color-scheme:light] dark:[color-scheme:dark]"
                />
                <FormInput
                  label="Date Applied"
                  type="date"
                  value={formData.appliedDate}
                  onChange={(e) => handleChange('appliedDate', e.target.value)}
                  className="[color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
            </section>

            {/* Divider */}
            <div className="h-px bg-border dark:bg-border" />

            {/* Notes Section */}
            <section className="space-y-5">
              <SectionHeader icon="description" iconColor="text-amber-400" title="Notes" />
              
              <div>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Mention key requirements, interview questions, or next steps..."
                  rows={4}
                  className="w-full bg-muted dark:bg-surface-container-high border border-input dark:border-border rounded-xl px-4 py-3.5 text-foreground dark:text-white placeholder:text-muted-foreground transition-all focus:ring-2 focus:ring-primary/40 focus:border-primary/50 outline-none resize-none"
                />
              </div>
            </section>
          </div>
        </form>

        {/* Fixed Bottom Action Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-card/95 dark:bg-popover/95 backdrop-blur-xl border-t border-border dark:border-border flex gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1 py-6 text-muted-foreground font-semibold rounded-2xl hover:bg-accent dark:hover:bg-accent"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="flex-[2] py-6 bg-primary text-white font-semibold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90"
          >
            {job ? 'Update Application' : 'Save Application'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
