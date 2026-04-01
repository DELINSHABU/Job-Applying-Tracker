import type { NavTab } from '../types';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

interface NavItemProps {
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, isActive, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
        isActive
          ? 'bg-white dark:bg-card-bg text-primary shadow-sm font-semibold'
          : 'text-slate-500 dark:text-light-grey hover:bg-white/50 dark:hover:bg-card-bg/50 hover:text-primary'
      }`}
    >
      <span className="material-symbols-outlined">{icon}</span>
      {label}
    </button>
  );
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="w-64 h-full border-r border-border bg-surface-container-lowest dark:bg-surface-container-lowest flex flex-col p-6 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-xl">rocket_launch</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-off-white">JobTrack</span>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 flex-1" aria-label="Main navigation">
        <NavItem
          icon="dashboard"
          label="Dashboard"
          isActive={activeTab === 'dashboard'}
          onClick={() => onTabChange('dashboard')}
        />
        <NavItem
          icon="work"
          label="Jobs"
          isActive={activeTab === 'jobs'}
          onClick={() => onTabChange('jobs')}
        />
        <NavItem
          icon="insights"
          label="Insights"
          isActive={activeTab === 'insights'}
          onClick={() => onTabChange('insights')}
        />
        <NavItem
          icon="settings"
          label="Settings"
          isActive={activeTab === 'settings'}
          onClick={() => onTabChange('settings')}
        />
      </nav>
    </aside>
  );
}
