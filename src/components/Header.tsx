import { Button } from './ui/button';
import type { User } from '../types';

interface HeaderProps {
  user: User | null;
  onLoginClick: () => void;
  onProfileClick: () => void;
}

export function Header({ user, onLoginClick, onProfileClick }: HeaderProps) {
  // Get user initials for avatar
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
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-app-bg/80 backdrop-blur-md px-5 pt-12 pb-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-off-white">Job Tracker</h1>
          <p className="text-sm text-slate-500 dark:text-light-grey">
            {user ? `Welcome back, ${user.displayName || user.email?.split('@')[0]}` : 'Sign in to track your applications'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-white dark:bg-card-bg border-slate-200 dark:border-card-border hover:border-primary"
            aria-label="Notifications"
          >
            <span className="material-icons-round text-xl text-slate-700 dark:text-off-white">notifications</span>
          </Button>
          {user ? (
            <Button
              onClick={onProfileClick}
              className="w-10 h-10 rounded-full font-semibold"
              title="View profile"
            >
              {getInitials(user)}
            </Button>
          ) : (
            <Button
              onClick={onLoginClick}
              className="rounded-full"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
