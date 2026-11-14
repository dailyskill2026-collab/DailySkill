// src/screens/Explore/ExploreScreen.tsx
import React, { useEffect, useState } from 'react';
import { useProfileStore } from '@/store/profileStore';
import { useProgressStore } from '@/store/progressStore';
import { exploreContent, LearningContent } from '@/data/exploreContent';
import { getPersonalizedRecommendations, ScoredRecommendation } from '@/services/recommendationEngine';
import { getWeakTopicsList } from '@/services/weakTopicService';
import { ExploreCard } from '@/components/Explore/ExploreCard';
import { ExploreFilters } from '@/components/Explore/ExploreFilters';
import { ExploreSearch } from '@/components/Explore/ExploreSearch';
import { Sparkles, Clock, Globe } from 'lucide-react';

export const ExploreScreen: React.FC = () => {
  const profile = useProfileStore();
  const { dailyProgress } = useProgressStore();

  const [activeTab, setActiveTab] = useState<'for-you' | 'latest' | 'all'>('for-you');
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [feed, setFeed] = useState<LearningContent[]>([]);
  const [scoredFeed, setScoredFeed] = useState<ScoredRecommendation[]>([]);
  const feedRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const completedIds = new Set(
      Object.keys(dailyProgress).filter((k) => dailyProgress[k]?.status === 'completed')
    );
    const weakTopics = new Set(getWeakTopicsList());

    // 1. Get personalized recommendations
    const scored = getPersonalizedRecommendations(exploreContent, {
      profile,
      completedIds,
      weakTopics,
    });

    setScoredFeed(scored);

    let items: LearningContent[] = [];

    if (activeTab === 'for-you') {
      items = scored.map((s) => s.content);
    } else if (activeTab === 'latest') {
      items = [...exploreContent]
        .filter((c) => c.verificationStatus === 'published' || c.verificationStatus === 'sample')
        .sort((a, b) => (b.lastVerified || '').localeCompare(a.lastVerified || '') || b.id.localeCompare(a.id));
    } else {
      items = [...exploreContent].filter(
        (c) => c.verificationStatus === 'published' || c.verificationStatus === 'sample'
      );
    }

    // Category / topic filter
    if (filter !== 'All') {
      items = items.filter(
        (c) =>
          c.topic.toLowerCase() === filter.toLowerCase() ||
          c.technology.toLowerCase() === filter.toLowerCase()
      );
    }

    // Search query filter
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.summary.toLowerCase().includes(q) ||
          c.technology.toLowerCase().includes(q) ||
          c.topic.toLowerCase().includes(q)
      );
    }

    setFeed(items);
  }, [profile, dailyProgress, activeTab, filter, search]);

  const scrollFeed = (delta: number) => {
    if (feedRef.current) {
      feedRef.current.scrollBy({ top: delta, behavior: 'smooth' });
    }
  };

  return (
    <div className="p-4 space-y-4 pb-safe">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Explore Feed</h1>
          <p className="text-xs text-secondary">Discover microlearning tailored for you</p>
        </div>
      </div>

      {/* Tabs: For You / Latest / All Content */}
      <div className="flex gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
        <button
          onClick={() => setActiveTab('for-you')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            activeTab === 'for-you'
              ? 'bg-white dark:bg-surface-dark text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-secondary hover:text-primary'
          }`}
        >
          <Sparkles size={13} />
          <span>For You</span>
        </button>
        <button
          onClick={() => setActiveTab('latest')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            activeTab === 'latest'
              ? 'bg-white dark:bg-surface-dark text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-secondary hover:text-primary'
          }`}
        >
          <Clock size={13} />
          <span>Latest</span>
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            activeTab === 'all'
              ? 'bg-white dark:bg-surface-dark text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-secondary hover:text-primary'
          }`}
        >
          <Globe size={13} />
          <span>All Content</span>
        </button>
      </div>

      <ExploreFilters selected={filter} onSelect={setFilter} />
      <ExploreSearch query={search} onChange={setSearch} />

      {/* Accessible scroll buttons */}
      <div className="flex justify-between items-center text-xs text-secondary">
        <span>Showing {feed.length} microlearning cards</span>
        <div className="flex gap-2">
          <button
            onClick={() => scrollFeed(-200)}
            className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200"
            aria-label="Scroll up"
          >
            ↑
          </button>
          <button
            onClick={() => scrollFeed(200)}
            className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200"
            aria-label="Scroll down"
          >
            ↓
          </button>
        </div>
      </div>

      {feed.length === 0 ? (
        <div className="card p-8 text-center space-y-2">
          <p className="text-sm font-semibold text-primary">No content matches your criteria.</p>
          <p className="text-xs text-secondary">Try clearing your search query or selecting a different category filter.</p>
        </div>
      ) : (
        <div className="space-y-4" ref={feedRef} style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {feed.map((item) => {
            const recommendation = scoredFeed.find((s) => s.content.id === item.id);
            return (
              <div key={item.id} className="space-y-1">
                {activeTab === 'for-you' && recommendation && (
                  <p className="text-2xs text-brand-600 dark:text-brand-400 font-medium px-1 flex items-center gap-1">
                    <Sparkles size={11} />
                    {recommendation.explanation}
                  </p>
                )}
                <ExploreCard content={item} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExploreScreen;
