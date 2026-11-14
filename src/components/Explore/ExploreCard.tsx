import React from 'react';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { LearningContent } from '@/data/exploreContent';

interface ExploreCardProps {
  content: LearningContent;
}

export const ExploreCard: React.FC<ExploreCardProps> = ({ content }) => {
  const { toggleBookmark, isBookmarked } = useBookmarkStore();

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
        // ignore user cancellation
      }
    } else {
      await navigator.clipboard.writeText(shareData.url);
      alert('Link copied to clipboard');
    }
  };

  const handleReadMore = () => {
    // navigation is handled by the parent screen via react‑router <Link>
  };

  return (
    <div className="card p-4 space-y-3" data-testid={`explore-card-${content.id}`}>
      <h3 className="text-lg font-medium">{content.title}</h3>
      <p className="text-sm text-gray-600">{content.summary}</p>
      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
        <span>{content.technology}</span>
        <span>{content.topic}</span>
        <span>{content.difficulty}</span>
        <span>{content.readingTimeMinutes} min read</span>
      </div>
      <div className="flex space-x-4 mt-2">
        <button
          onClick={handleBookmark}
          className="text-sm text-blue-600"
          data-testid="bookmark-btn"
        >
          {isBookmarked(content.id) ? 'Remove Bookmark' : 'Bookmark'}
        </button>
        <button
          onClick={handleShare}
          className="text-sm text-blue-600"
          data-testid="share-btn"
        >
          Share
        </button>
        <a
          href={`/explore/${content.id}`}
          className="text-sm text-blue-600"
          data-testid="readmore-link"
        >
          Read More
        </a>
      </div>
    </div>
  );
};

export default ExploreCard;
