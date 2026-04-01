import { Button } from '../ui/button';
import { useTheme } from '../../contexts/ThemeContext';
import { usePWA } from '../../hooks/usePWA';
import type { User, Job } from '../../types';

interface SettingsPageProps {
  user: User | null;
  jobs: Job[];
  onLogout: () => void;
  onExport: () => void;
  onImport: () => void;
}

export function SettingsPage({ user, jobs, onLogout, onExport, onImport }: SettingsPageProps) {
  const { theme, toggleTheme } = useTheme();
  const { isInstallable, isStandalone, installApp } = usePWA();

  const getInitials = (user: User | null) => {
    if (!user) return '?';
    if (user.displayName) {
      return user.displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email?.charAt(0).toUpperCase() || '?';
  };

  return (
    <main className="max-w-md mx-auto px-5 pb-24 pt-4">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-off-white">Settings</h1>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-white dark:bg-card-bg border-slate-200 dark:border-card-border text-primary"
          aria-label="Help"
        >
          <span className="material-icons-round leading-none">help_outline</span>
        </Button>
      </header>

      {/* Profile Section */}
      {user ? (
        <div className="bg-white dark:bg-card-bg rounded-xl p-5 mb-8 shadow-sm border border-slate-200 dark:border-card-border flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
              {getInitials(user)}
            </div>
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-card-bg rounded-full"></div>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold leading-tight text-slate-900 dark:text-off-white">
              {user.displayName || 'User'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-light-grey">{user.email}</p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-card-bg rounded-xl p-5 mb-8 shadow-sm border border-slate-200 dark:border-card-border text-center">
          <p className="text-slate-500 dark:text-light-grey">Sign in to sync your data</p>
        </div>
      )}

      {/* Account Group */}
      <div className="mb-8">
        <h3 className="px-1 mb-2 text-xs font-semibold text-slate-400 dark:text-light-grey uppercase tracking-wider">Account</h3>
        <div className="bg-white dark:bg-card-bg rounded-xl shadow-sm border border-slate-200 dark:border-card-border overflow-hidden">
          {/* Sync Status */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-card-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary">
                <span className="material-icons-round text-xl">sync</span>
              </div>
              <span className="font-medium text-slate-900 dark:text-off-white">Cloud Sync</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 dark:text-light-grey font-medium">
                {user ? 'Connected' : 'Not signed in'}
              </span>
              <div className={`w-2 h-2 rounded-full ${user ? 'bg-green-500' : 'bg-slate-400'}`}></div>
            </div>
          </div>
          {/* Stats */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-card-border flex items-center justify-center text-slate-500 dark:text-light-grey">
                <span className="material-icons-round text-xl">folder</span>
              </div>
              <span className="font-medium text-slate-900 dark:text-off-white">Total Applications</span>
            </div>
            <span className="text-sm font-bold text-primary">{jobs.length}</span>
          </div>
        </div>
      </div>

      {/* Data Management Group */}
      <div className="mb-8">
        <h3 className="px-1 mb-2 text-xs font-semibold text-slate-400 dark:text-light-grey uppercase tracking-wider">Data Management</h3>
        <div className="bg-white dark:bg-card-bg rounded-xl shadow-sm border border-slate-200 dark:border-card-border overflow-hidden">
          {/* Export */}
          <Button
            variant="ghost"
            onClick={onExport}
            className="w-full flex items-center justify-between p-4 h-auto rounded-none border-b border-slate-100 dark:border-card-border active:bg-slate-50 dark:active:bg-card-border"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-icons-round text-xl">file_upload</span>
              </div>
              <div className="text-left">
                <p className="font-medium leading-none mb-1 text-slate-900 dark:text-off-white">Export to XML</p>
                <p className="text-[11px] text-slate-400 dark:text-light-grey">Download your applications list</p>
              </div>
            </div>
            <span className="material-icons-round text-slate-300 dark:text-light-grey text-xl">chevron_right</span>
          </Button>
          {/* Import */}
          <Button
            variant="ghost"
            onClick={onImport}
            className="w-full flex items-center justify-between p-4 h-auto rounded-none active:bg-slate-50 dark:active:bg-card-border"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-icons-round text-xl">file_download</span>
              </div>
              <div className="text-left">
                <p className="font-medium leading-none mb-1 text-slate-900 dark:text-off-white">Import XML</p>
                <p className="text-[11px] text-slate-400 dark:text-light-grey">Upload existing tracking data</p>
              </div>
            </div>
            <span className="material-icons-round text-slate-300 dark:text-light-grey text-xl">chevron_right</span>
          </Button>
        </div>
      </div>

      {/* Preferences Group */}
      <div className="mb-12">
        <h3 className="px-1 mb-2 text-xs font-semibold text-slate-400 dark:text-light-grey uppercase tracking-wider">Preferences</h3>
        <div className="bg-white dark:bg-card-bg rounded-xl shadow-sm border border-slate-200 dark:border-card-border overflow-hidden">
          {/* Dark Mode */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                <span className="material-icons-round text-lg">dark_mode</span>
              </div>
              <span className="font-medium text-slate-900 dark:text-off-white">Dark Mode</span>
            </div>
            <label className="relative inline-block w-11 h-6 cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={theme === 'dark'}
                onChange={toggleTheme}
              />
              <div className="w-11 h-6 bg-input dark:bg-surface-container-high peer-checked:bg-primary rounded-full transition-colors"></div>
              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-card dark:bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Install App Section */}
      {!isStandalone && (
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={installApp}
            disabled={!isInstallable}
            className={`w-full py-4 h-auto font-semibold rounded-xl active:scale-[0.98] flex items-center justify-center gap-2 transition-all ${
              isInstallable 
                ? "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20" 
                : "bg-slate-50 dark:bg-card-border/30 text-slate-400 dark:text-light-grey/40 border-slate-100 dark:border-card-border cursor-not-allowed"
            }`}
          >
            <span className="material-icons-round text-xl">{isInstallable ? 'download' : 'sync'}</span>
            {isInstallable ? 'Install as App' : 'Checking App Status...'}
          </Button>
          {!isInstallable && (
            <p className="text-[10px] text-center mt-2 text-slate-400 dark:text-light-grey/50 px-4">
              Your browser will enable installation once the app is fully verified.
            </p>
          )}
        </div>
      )}

      {/* Logout Section */}
      {user && (
        <div className="space-y-6">
          <Button
            variant="destructive"
            onClick={onLogout}
            className="w-full py-4 h-auto bg-red-50 dark:bg-red-900/10 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 font-semibold rounded-xl active:scale-[0.98]"
          >
            <span className="material-icons-round text-xl">logout</span>
            Sign Out
          </Button>
        </div>
      )}

      {/* Version Info */}
      <div className="text-center mt-8 space-y-1">
        <p className="text-xs text-slate-400 dark:text-light-grey">Version 2.0.0 (React)</p>
        <p className="text-[10px] text-slate-300 dark:text-light-grey/50">Built with React + TypeScript + Vite</p>
      </div>
    </main>
  );
}
