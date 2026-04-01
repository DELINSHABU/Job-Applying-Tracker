import type { NavTab } from '../types';

interface BottomNavProps {
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
      className={`flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-slate-400 dark:text-light-grey'}`}
    >
      <span className="material-icons-round">{icon}</span>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-app-bg/90 backdrop-blur-xl border-t border-slate-200 dark:border-card-border px-6 py-3 flex justify-between items-center z-50" aria-label="Main navigation">
      <NavItem
        icon="dashboard"
        label="Dashboard"
        isActive={activeTab === 'dashboard'}
        onClick={() => onTabChange('dashboard')}
      />
      <NavItem
        icon="work_outline"
        label="Jobs"
        isActive={activeTab === 'jobs'}
        onClick={() => onTabChange('jobs')}
      />
      <NavItem
        icon="analytics"
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
  );
}
