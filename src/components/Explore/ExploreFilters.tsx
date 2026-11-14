import React from 'react';

interface ExploreFiltersProps {
  selected: string;
  onSelect: (filter: string) => void;
}

const FILTERS = [
  'All',
  'For You',
  'Latest Updates',
  'Apex',
  'LWC',
  'Integration',
  'Salesforce Admin',
  'Security',
  'Flows',
  'Agentforce',
  'Interview Preparation',
];

export const ExploreFilters: React.FC<ExploreFiltersProps> = ({ selected, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map(f => (
        <button
          key={f}
          onClick={() => onSelect(f)}
          className={`px-3 py-1 rounded-full text-sm ${
            selected === f ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  );
};
