// src/components/Explore/ExploreFilters.tsx
import React from 'react';
import { Sparkles, Layers } from 'lucide-react';

interface ExploreFiltersProps {
  selected: string;
  onSelect: (filter: string) => void;
  selectedRelease?: string;
  onSelectRelease?: (release: string) => void;
}

const TOPIC_FILTERS = [
  'All',
  'Agentforce',
  'Apex',
  'Flows',
  'LWC',
  'Security',
  'Data Cloud',
  'Integration',
];

const RELEASE_FILTERS = [
  'All Releases',
  "Winter '27",
  "Summer '26",
  "Spring '26",
];

export const ExploreFilters: React.FC<ExploreFiltersProps> = ({
  selected,
  onSelect,
  selectedRelease = 'All Releases',
  onSelectRelease,
}) => {
  return (
    <div className="space-y-2.5">
      {/* Release Version Filter Row */}
      {onSelectRelease && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <span className="text-2xs uppercase tracking-wider font-bold text-muted shrink-0 flex items-center gap-1 mr-1">
            <Sparkles size={11} className="text-sky-500" />
            Release:
          </span>
          {RELEASE_FILTERS.map((rel) => {
            const isSelected = selectedRelease === rel;
            return (
              <button
                key={rel}
                type="button"
                onClick={() => onSelectRelease(rel)}
                className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/80 hover:bg-sky-100'
                }`}
              >
                {rel}
              </button>
            );
          })}
        </div>
      )}

      {/* Category Pills Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <span className="text-2xs uppercase tracking-wider font-bold text-muted shrink-0 flex items-center gap-1 mr-1">
          <Layers size={11} className="text-emerald-500" />
          Topic:
        </span>
        {TOPIC_FILTERS.map((f) => {
          const isSelected = selected.toLowerCase() === f.toLowerCase();
          return (
            <button
              key={f}
              type="button"
              onClick={() => onSelect(f)}
              className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all active:scale-95 ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {f === 'All' ? 'All Topics' : f}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ExploreFilters;
