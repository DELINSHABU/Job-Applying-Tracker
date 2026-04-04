import { useState, useMemo } from 'react';
import { Badge } from './badge';
import { Input } from './input';
import type { ScrapingOption } from '../../constants/scrapingOptions';
import { groupByCategory } from '../../constants/scrapingOptions';

interface ChipSelectorProps {
  options: ScrapingOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label?: string;
  description?: string;
  maxVisible?: number;
  searchable?: boolean;
  grouped?: boolean;
  singleSelect?: boolean;
  disabled?: boolean;
  showCustomInput?: boolean;
  onAddCustom?: (value: string) => void;
}

export function ChipSelector({
  options,
  selected,
  onChange,
  maxVisible = 20,
  searchable = false,
  grouped = false,
  singleSelect = false,
  disabled = false,
  showCustomInput = false,
  onAddCustom,
}: ChipSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase();
    return options.filter(
      o => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
    );
  }, [options, searchQuery]);

  const visibleOptions = expanded ? filteredOptions : filteredOptions.slice(0, maxVisible);
  const hasMore = filteredOptions.length > maxVisible;

  const toggleOption = (value: string) => {
    if (disabled) return;
    if (singleSelect) {
      onChange(selected.includes(value) ? [] : [value]);
    } else {
      onChange(
        selected.includes(value)
          ? selected.filter(v => v !== value)
          : [...selected, value]
      );
    }
  };

  const handleAddCustom = () => {
    const trimmed = customValue.trim();
    if (!trimmed || selected.includes(trimmed)) return;
    onAddCustom?.(trimmed);
    setCustomValue('');
  };

  const renderChips = () => {
    if (grouped) {
      const groups = groupByCategory(visibleOptions);
      return Object.entries(groups).map(([category, items]) => (
        <div key={category} className="mb-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            {category}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {items.map(option => (
              <Badge
                key={option.value}
                variant={selected.includes(option.value) ? 'default' : 'outline'}
                className={`cursor-pointer px-2.5 py-1 text-xs transition-all ${
                  selected.includes(option.value)
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => toggleOption(option.value)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>
      ));
    }

    return (
      <div className="flex flex-wrap gap-1.5">
        {visibleOptions.map(option => (
          <Badge
            key={option.value}
            variant={selected.includes(option.value) ? 'default' : 'outline'}
            className={`cursor-pointer px-2.5 py-1 text-xs transition-all ${
              selected.includes(option.value)
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => toggleOption(option.value)}
          >
            {option.label}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div>
      {searchable && (
        <div className="mb-3">
          <Input
            placeholder="Search options..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="text-sm"
          />
        </div>
      )}

      {selected.length > 0 && (
        <p className="text-xs text-primary font-medium mb-2">
          {selected.length} selected
        </p>
      )}

      {renderChips()}

      {hasMore && !searchQuery && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs text-primary hover:underline"
        >
          {expanded ? 'Show less' : `Show all ${filteredOptions.length} options`}
        </button>
      )}

      {showCustomInput && (
        <div className="mt-3">
          {!showCustom ? (
            <button
              onClick={() => setShowCustom(true)}
              className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              + Add custom value
            </button>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Custom value..."
                value={customValue}
                onChange={e => setCustomValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddCustom()}
                className="text-sm flex-1"
              />
              <Badge
                variant="outline"
                className="cursor-pointer px-3 py-1"
                onClick={handleAddCustom}
              >
                Add
              </Badge>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
