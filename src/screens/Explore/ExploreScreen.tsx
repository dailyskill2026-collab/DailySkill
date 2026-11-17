// src/screens/Explore/ExploreScreen.tsx
import React, { useEffect, useState } from 'react';
import { useProfileStore } from '@/store/profileStore';
import { useProgressStore } from '@/store/progressStore';
import { LearningContent } from '@/data/exploreContent';
import { getAllExploreContent } from '@/services/contentCatalogService';
import { getPersonalizedRecommendations, ScoredRecommendation } from '@/services/recommendationEngine';
import { getWeakTopicsList } from '@/services/weakTopicService';
import { ExploreCard } from '@/components/Explore/ExploreCard';
import { ExploreFilters } from '@/components/Explore/ExploreFilters';
import { ExploreSearch } from '@/components/Explore/ExploreSearch';
import { Sparkles, Clock, Globe, Coffee, RotateCcw } from 'lucide-react';
import { analytics } from '@/services/analyticsService';

export const ExploreScreen: React.FC = () => {
  const profile = useProfileStore();
  const { dailyProgress } = useProgressStore();

  const [activeTab, setActiveTab] = useState<'for-you' | 'latest' | 'all'>('for-you');
  const [filter, setFilter] = useState<string>('All');
  const [releaseFilter, setReleaseFilter] = useState<string>('All Releases');
  const [search, setSearch] = useState<string>('');
  const [feed, setFeed] = useState<LearningContent[]>([]);
  const [scoredFeed, setScoredFeed] = useState<ScoredRecommendation[]>([]);

  useEffect(() => {
    const completedIds = new Set(
      Object.keys(dailyProgress).filter((k) => dailyProgress[k]?.status === 'completed')
    );
    const weakTopics = new Set(getWeakTopicsList());

    const catalogRaw = getAllExploreContent();
    // Deduplicate by ID and Title
    const seen = new Set<string>();
    const catalog: LearningContent[] = [];
    for (const item of catalogRaw) {
      const key = `${item.title.toLowerCase().trim()}`;
      if (!seen.has(key)) {
        seen.add(key);
        catalog.push(item);
      }
    }

    // 1. Get personalized recommendations
    const scored = getPersonalizedRecommendations(catalog, {
      profile,
      completedIds,
      weakTopics,
    });

    setScoredFeed(scored);

    let items: LearningContent[] = [];

    if (activeTab === 'for-you') {
      items = scored.map((s) => s.content);
    } else if (activeTab === 'latest') {
      items = [...catalog]
        .filter((c) => c.verificationStatus === 'published' || c.verificationStatus === 'sample')
        .sort((a, b) => (b.version || '').localeCompare(a.version || '') || b.id.localeCompare(a.id));
    } else {
      items = [...catalog].filter(
        (c) => c.verificationStatus === 'published' || c.verificationStatus === 'sample'
      );
    }

    // 2. Filter by Release version if selected
    if (releaseFilter !== 'All Releases') {
      items = items.filter((c) => c.version && c.version.toLowerCase().includes(releaseFilter.toLowerCase().replace(' release', '')));
    }

    // 3. Category / topic filter
    if (filter !== 'All') {
      items = items.filter(
        (c) =>
          (c.topic && c.topic.toLowerCase().includes(filter.toLowerCase())) ||
          (c.technology && c.technology.toLowerCase() === filter.toLowerCase())
      );
    }

    // 4. Search query filter
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((c) => {
        const titleMatch = c.title.toLowerCase().includes(q);
        const summaryMatch = c.summary.toLowerCase().includes(q);
        const topicMatch = c.topic.toLowerCase().includes(q);
        const versionMatch = c.version?.toLowerCase().includes(q);
        const convoMatch = c.conversation?.some(
          (t) => t.message.toLowerCase().includes(q) || t.name.toLowerCase().includes(q)
        );
        return titleMatch || summaryMatch || topicMatch || versionMatch || convoMatch;
      });
    }

    if (search.trim()) {
      analytics.trackSearchPerformed(search.trim(), items.length);
    }

    setFeed(items);
  }, [profile, dailyProgress, activeTab, filter, releaseFilter, search]);

  const handleResetFilters = () => {
    setActiveTab('for-you');
    setFilter('All');
    setReleaseFilter('All Releases');
    setSearch('');
  };

  return (
    <div className="p-4 sm:p-5 space-y-4 pb-safe max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-2xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
            <Coffee size={11} />
            Conversational Feed
          </span>
          <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200">
            Winter '27 • Summer '26 • Spring '26
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
          Explore Latest Releases
        </h1>
        <p className="text-xs sm:text-sm text-secondary">
          Bite-sized coffee chat stories explaining what's new in Salesforce—no boring textbook walls of text.
        </p>
      </div>

      {/* Main Mode Tabs: For You / Latest Releases / All Stories */}
      <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveTab('for-you')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
            activeTab === 'for-you'
              ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-200 shadow-xs'
              : 'text-secondary hover:text-primary'
          }`}
        >
          <Sparkles size={14} className={activeTab === 'for-you' ? 'text-emerald-600' : ''} />
          <span>For You</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('latest')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
            activeTab === 'latest'
              ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-200 shadow-xs'
              : 'text-secondary hover:text-primary'
          }`}
        >
          <Clock size={14} className={activeTab === 'latest' ? 'text-emerald-600' : ''} />
          <span>Latest Releases</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
            activeTab === 'all'
              ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-200 shadow-xs'
              : 'text-secondary hover:text-primary'
          }`}
        >
          <Globe size={14} className={activeTab === 'all' ? 'text-emerald-600' : ''} />
          <span>All Content</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <ExploreSearch query={search} onChange={setSearch} />

      {/* Filter Chips (Release & Categories) */}
      <ExploreFilters
        selected={filter}
        onSelect={setFilter}
        selectedRelease={releaseFilter}
        onSelectRelease={setReleaseFilter}
      />

      {/* Stories Counter */}
      <div className="flex justify-between items-center text-xs sm:text-sm text-secondary pt-1">
        <span className="font-medium">
          Showing <strong className="text-primary">{feed.length}</strong> conversational stories
        </span>
        {(filter !== 'All' || releaseFilter !== 'All Releases' || search.trim()) && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
          >
            <RotateCcw size={12} />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Feed List */}
      {feed.length === 0 ? (
        <div className="card p-8 sm:p-10 text-center space-y-3 rounded-3xl border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center mx-auto text-emerald-600">
            <Sparkles size={22} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-primary">No stories match your filter</h3>
          <p className="text-xs sm:text-sm text-secondary max-w-sm mx-auto">
            Try clearing your search query or switching to 'All Releases' to see everything.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition"
          >
            Show All Release Stories
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {feed.map((item, idx) => {
            const recommendation = scoredFeed.find((s) => s.content.id === item.id);
            return (
              <div key={item.id} className="space-y-1">
                {activeTab === 'for-you' && recommendation && (
                  <p className="text-2xs sm:text-xs text-emerald-800 dark:text-emerald-300 font-semibold px-2 flex items-center gap-1.5">
                    <Sparkles size={11} className="text-emerald-600" />
                    <span>{recommendation.explanation}</span>
                  </p>
                )}
                <ExploreCard content={item} defaultExpanded={idx === 0} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExploreScreen;
