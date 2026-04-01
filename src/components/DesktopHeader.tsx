import { Button } from './ui/button';
import type { User } from '../types';

interface DesktopHeaderProps {
  user: User | null;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onLoginClick: () => void;
  onProfileClick: () => void;
}

export function DesktopHeader({ 
  user, 
  searchValue, 
  onSearchChange, 
  onLoginClick, 
  onProfileClick 
}: DesktopHeaderProps) {
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
    <header className="h-20 border-b border-border bg-card/50 dark:bg-surface-container/50 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
      {/* Search */}
      <div className="relative w-96">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-light-grey text-xl">
          search
        </span>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-muted dark:bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none text-foreground dark:text-off-white placeholder:text-muted-foreground"
          placeholder="Search applications, companies..."
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notification */}
        <Button
          variant="outline"
          size="icon"
          className="w-10 h-10 rounded-full text-slate-500 dark:text-light-grey hover:bg-slate-100 dark:hover:bg-card-bg border-slate-200 dark:border-card-border"
        >
          <span className="material-symbols-outlined">notifications</span>
        </Button>

        <div className="h-8 w-[1px] bg-slate-200 dark:bg-card-border mx-2"></div>

        {/* User */}
        {user ? (
          <div className="flex items-center gap-3 pl-2 cursor-pointer" onClick={onProfileClick}>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900 dark:text-off-white">
                {user.displayName || user.email?.split('@')[0]}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-light-grey">Candidate</p>
            </div>
            <Button
              className="w-10 h-10 rounded-full font-semibold"
              title="View profile"
            >
              {getInitials(user)}
            </Button>
          </div>
        ) : (
          <Button
            onClick={onLoginClick}
            className="px-5 py-2.5 rounded-xl font-semibold"
          >
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
}
