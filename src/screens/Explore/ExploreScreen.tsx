// src/screens/Explore/ExploreScreen.tsx
import React, { useEffect, useState } from 'react';
import { useProfileStore } from '@/store/profileStore';
import { exploreContent, LearningContent } from '@/data/exploreContent';
import { generateExploreFeed } from '@/utils/exploreRanking';
import { ExploreCard } from '@/components/Explore/ExploreCard';
import { ExploreFilters } from '@/components/Explore/ExploreFilters';
import { ExploreSearch } from '@/components/Explore/ExploreSearch';

export const ExploreScreen: React.FC = () => {
  const profile = useProfileStore(state => ({
    technology: state.technology,
    role: state.role,
    interests: state.interests,
    experienceYears: parseInt(state.experience.split('-')[0] ?? '0', 10),
  }));

  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [feed, setFeed] = useState<LearningContent[]>([]);
  const feedRef = React.useRef<HTMLDivElement>(null);

  // Apply ranking and then filter/search
  useEffect(() => {
    let items = generateExploreFeed(profile, exploreContent);
    // Keep only published content
    items = items.filter(c => c.verificationStatus === 'published');
    if (filter !== 'All') {
      items = items.filter(c => c.topic.toLowerCase() === filter.toLowerCase() || c.technology.toLowerCase() === filter.toLowerCase());
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        c.technology.toLowerCase().includes(q) ||
        c.topic.toLowerCase().includes(q)
      );
    }
    setFeed(items);
  }, [profile, filter, search]);

  const scrollFeed = (delta: number) => {
    if (feedRef.current) {
      feedRef.current.scrollBy({ top: delta, behavior: 'smooth' });
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Explore Learning</h1>
      <ExploreFilters selected={filter} onSelect={setFilter} />
      <ExploreSearch query={search} onChange={setSearch} />
      {/* Accessible scroll buttons */}
      <div className="flex justify-between mb-2">
        <button onClick={() => scrollFeed(-200)} className="px-3 py-1 bg-gray-200 rounded" aria-label="Scroll up">↑ Up</button>
        <button onClick={() => scrollFeed(200)} className="px-3 py-1 bg-gray-200 rounded" aria-label="Scroll down">↓ Down</button>
      </div>
      {feed.length === 0 ? (
        <p className="text-center text-gray-500">No content matches your criteria.</p>
      ) : (
        <div className="space-y-4" ref={feedRef} style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {feed.map(item => (
            <ExploreCard key={item.id} content={item} />
          ))}
        </div>
      )}
    </div>
  );
};
