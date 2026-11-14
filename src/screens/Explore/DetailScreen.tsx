import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { exploreContent, LearningContent } from '@/data/exploreContent';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { useHistoryStore } from '@/store/historyStore';

export const DetailScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const content = exploreContent.find((c) => c.id === id) as LearningContent | undefined;
  const { toggleBookmark, isBookmarked } = useBookmarkStore();
  const { addViewed, getViewed } = useHistoryStore();

  useEffect(() => {
    if (content) {
      addViewed(content.id);
    }
  }, [content, addViewed]);

  if (!content) {
    return (
      <div className="p-4">
        <p className="text-center text-gray-500">Content not found.</p>
        <div className="text-center mt-4">
          <Link to="/explore" className="text-blue-600 underline">Back to Explore</Link>
        </div>
      </div>
    );
  }

  const lastViewed = getViewed(content.id);

  const handleBookmark = () => {
    toggleBookmark(content.id);
  };

  const handleShare = async () => {
    const shareData = {
      title: content.title,
      text: `${content.title} – ${content.summary}`,
      url: `${window.location.origin}/explore/${content.id}`,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        // ignore cancel
      }
    } else {
      await navigator.clipboard.writeText(shareData.url);
      alert('Link copied to clipboard');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Link to="/explore" className="text-blue-600 underline">← Back to Explore</Link>
      <h1 className="text-2xl font-bold">{content.title}</h1>
      <div className="flex flex-wrap gap-2 text-sm text-gray-600">
        <span>{content.technology}</span>
        <span>{content.topic}</span>
        <span>{content.difficulty}</span>
        {content.version && <span>{content.version}</span>}
        <span>{content.readingTimeMinutes} min read</span>
      </div>
      <p><strong>Summary:</strong> {content.summary}</p>
      <p><strong>Why it matters:</strong> {content.whyItMatters}</p>
      <p><strong>Project example:</strong> {content.projectExample}</p>
      {content.sourceUrl && (
        <p>
          <strong>Source:</strong>{' '}
          <a href={content.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
            {content.sourceName ?? content.sourceUrl}
          </a>
        </p>
      )}
      {lastViewed && (
        <p className="text-xs text-gray-500">Last viewed: {new Date(lastViewed).toLocaleString()}</p>
      )}
      <div className="flex space-x-4 mt-2">
        <button onClick={handleBookmark} className="text-sm text-blue-600">
          {isBookmarked(content.id) ? 'Remove Bookmark' : 'Bookmark'}
        </button>
        <button onClick={handleShare} className="text-sm text-blue-600">Share</button>
      </div>
    </div>
  );
};
