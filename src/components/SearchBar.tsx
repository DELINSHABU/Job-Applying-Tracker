import { Button } from './ui/button';
import { Input } from './ui/input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFilterClick?: () => void;
}

export function SearchBar({ value, onChange, onFilterClick }: SearchBarProps) {
  return (
    <section className="px-5 mt-4 flex gap-3">
      <div className="relative flex-1">
        <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-light-grey">
          search
        </span>
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 h-auto bg-white dark:bg-card-bg border-slate-200 dark:border-card-border rounded-xl shadow-sm text-sm"
          placeholder="Search applications..."
        />
      </div>
      {onFilterClick && (
        <Button
          variant="outline"
          size="icon"
          onClick={onFilterClick}
          className="h-auto p-3 rounded-xl bg-white dark:bg-card-bg border-slate-200 dark:border-card-border hover:border-primary"
        >
          <span className="material-icons-round text-slate-400 dark:text-light-grey">tune</span>
        </Button>
      )}
    </section>
  );
}
