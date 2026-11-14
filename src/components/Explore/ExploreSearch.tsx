import React from 'react';

interface ExploreSearchProps {
  query: string;
  onChange: (value: string) => void;
}

export const ExploreSearch: React.FC<ExploreSearchProps> = ({ query, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        placeholder="Search learning..."
        value={query}
        onChange={e => onChange(e.target.value)}
        className="flex-1 p-2 border rounded"
      />
      {query && (
        <button
          onClick={() => onChange('')}
          className="px-2 py-1 text-sm text-gray-600"
        >
          Clear
        </button>
      )}
    </div>
  );
};
