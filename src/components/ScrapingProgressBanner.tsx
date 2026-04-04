import { useScrapingProgress } from '../hooks/useScrapingProgress';
import { Progress } from './ui/progress';

interface ScrapingProgressBannerProps {
  onNavigate: () => void;
}

export function ScrapingProgressBanner({ onNavigate }: ScrapingProgressBannerProps) {
  const { status, progress, currentStep, clearMission } = useScrapingProgress();

  if (status === 'idle') return null;

  if (status === 'completed' || status === 'failed') {
    return (
      <div
        className={`w-full px-4 py-2 cursor-pointer transition-all ${
          status === 'completed'
            ? 'bg-green-500/10 border-b border-green-500/20'
            : 'bg-red-500/10 border-b border-red-500/20'
        }`}
        onClick={() => {
          onNavigate();
          setTimeout(clearMission, 100);
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${status === 'completed' ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm font-medium text-slate-900 dark:text-off-white">{currentStep}</span>
          </div>
          <span className="material-icons-round text-sm text-slate-500">chevron_right</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full bg-primary/5 border-b border-primary/20 cursor-pointer"
      onClick={onNavigate}
    >
      <div className="max-w-4xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-sm font-medium text-slate-900 dark:text-off-white">{currentStep}</span>
          </div>
          <span className="text-xs font-mono text-primary">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1" />
      </div>
    </div>
  );
}
