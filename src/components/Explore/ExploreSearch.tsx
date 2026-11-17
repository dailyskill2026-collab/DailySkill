// src/components/Explore/ExploreSearch.tsx
import React from 'react';
import { Search, X } from 'lucide-react';

interface ExploreSearchProps {
  query: string;
  onChange: (value: string) => void;
}

export const ExploreSearch: React.FC<ExploreSearchProps> = ({ query, onChange }) => {
  return (
    <div className="relative flex items-center">
      <Search
        size={16}
        className="absolute left-3.5 text-slate-400 pointer-events-none"
      />
      <input
        type="text"
        placeholder="Search latest releases, topics, questions (e.g. Agentforce, Flows, Cursors)..."
        value={query}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm text-primary placeholder:text-muted focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-xs"
      />
      {query && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
};

export default ExploreSearch;
