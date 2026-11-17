// src/components/Explore/ExploreCard.tsx
import React, { useState } from 'react';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { LearningContent } from '@/data/exploreContent';
import LearningAssistantModal from '@/components/assistant/LearningAssistantModal';
import {
  Bookmark,
  Share2,
  ExternalLink,
  Sparkles,
  Clock,
  Bot,
  Lightbulb,
  Check,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from 'lucide-react';

interface ExploreCardProps {
  content: LearningContent;
  defaultExpanded?: boolean;
}

export const ExploreCard: React.FC<ExploreCardProps> = ({ content, defaultExpanded = false }) => {
  const { toggleBookmark, isBookmarked } = useBookmarkStore();
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);

  const bookmarked = isBookmarked(content.id);

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark(content.id);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: content.title,
      text: `${content.title} – ${content.summary}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancel
      }
    } else {
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Fallback conversation turns if not present
  const turns = content.conversation || [
    {
      speaker: 'learner',
      name: 'Leo',
      avatar: '👨‍💻',
      message: `Hey Maya, what is the best way to handle "${content.title}" in Salesforce?`,
    },
    {
      speaker: 'mentor',
      name: 'Maya',
      avatar: '👩‍💻',
      message: `${content.summary} ${content.whyItMatters}`,
    },
  ];

  const firstQuestion = turns[0]?.message || content.summary;

  return (
    <div
      className="card p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-700/80 transition-all rounded-3xl space-y-3"
      data-testid={`explore-card-${content.id}`}
    >
      {/* Top Header: Release Tag, Topic & Reading Time */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {content.version && (
            <span className="text-2xs sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 flex items-center gap-1">
              <Sparkles size={11} className="text-sky-600 dark:text-sky-400" />
              {content.version}
            </span>
          )}
          <span className="text-2xs sm:text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            {content.topic}
          </span>
          <span className="text-2xs font-medium text-slate-500 capitalize">
            {content.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-1 text-2xs sm:text-xs text-muted">
          <Clock size={12} />
          <span>{content.readingTimeMinutes || 2} min</span>
        </div>
      </div>

      {/* Main Title */}
      <h3
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-base sm:text-lg font-bold text-primary leading-snug cursor-pointer hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
      >
        {content.title}
      </h3>

      {/* Collapsed Teaser Preview */}
      {!isExpanded && (
        <div
          onClick={() => setIsExpanded(true)}
          className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl cursor-pointer hover:bg-emerald-50/40 dark:hover:bg-slate-800 transition-all flex items-start justify-between gap-3"
        >
          <div className="flex items-start gap-2 min-w-0">
            <span className="text-base select-none shrink-0">👨‍💻</span>
            <p className="text-xs sm:text-sm text-secondary line-clamp-2 leading-relaxed">
              <strong className="text-primary font-medium">Leo: </strong>
              "{firstQuestion}"
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-2xs font-bold flex items-center gap-1 shadow-2xs"
          >
            <span>Read Chat ({turns.length})</span>
            <ChevronDown size={12} />
          </button>
        </div>
      )}

      {/* Expanded Mobile Chat Conversation View */}
      {isExpanded && (
        <div className="space-y-3 pt-1 animate-fade-in">
          {/* Friendly chat partner banner */}
          <div className="flex items-center justify-between text-2xs text-muted px-1 border-b border-slate-100 dark:border-slate-800 pb-1.5">
            <span className="flex items-center gap-1 font-medium">
              <MessageSquare size={12} className="text-emerald-600" />
              Chat: 👨‍💻 Leo (Learner) & 👩‍💻 Maya (Architect)
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-0.5"
            >
              <span>Collapse</span>
              <ChevronUp size={12} />
            </button>
          </div>

          {/* Chat Messages Stream */}
          <div className="space-y-2.5">
            {turns.map((turn, idx) => {
              const isMentor = turn.speaker === 'mentor';
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isMentor ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-xs">{turn.avatar}</span>
                    <span className="text-3xs font-bold uppercase tracking-wider text-muted">
                      {turn.name}
                    </span>
                  </div>

                  <div
                    className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm leading-relaxed ${
                      isMentor
                        ? 'bg-gradient-to-r from-emerald-50/90 via-teal-50/80 to-sky-50/80 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-sky-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-100 rounded-tl-xs shadow-2xs font-normal'
                        : 'bg-slate-100 dark:bg-slate-800 text-primary border border-slate-200 dark:border-slate-700 rounded-tr-xs shadow-2xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{turn.message}</p>

                    {/* Code Snippet if present in turn */}
                    {turn.codeSnippet && (
                      <div className="mt-2 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner">
                        <pre className="p-2.5 text-[11px] font-mono text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed">
                          <code>{turn.codeSnippet}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Takeaway Banner */}
          {content.keyTakeaway && (
            <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl flex items-start gap-2">
              <Lightbulb size={15} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-950 dark:text-amber-100 leading-relaxed">
                <strong className="font-bold">Key Takeaway: </strong>
                {content.keyTakeaway}
              </p>
            </div>
          )}

          {/* Collapse Chat Button at Bottom */}
          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 py-1 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <span>Collapse Chat</span>
              <ChevronUp size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleBookmark}
            data-testid="bookmark-btn"
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 ${
              bookmarked
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Bookmark size={13} className={bookmarked ? 'fill-current' : ''} />
            <span>{bookmarked ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={handleShare}
            data-testid="share-btn"
            className="px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all active:scale-95"
          >
            {copied ? <Check size={13} className="text-emerald-600" /> : <Share2 size={13} />}
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsAssistantOpen(true);
            }}
            className="px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-all active:scale-95"
          >
            <Bot size={13} />
            <span>Ask AI ✦</span>
          </button>
        </div>

        {content.sourceUrl && (
          <a
            href={content.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="readmore-link"
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            <span>{content.sourceName || 'Docs'}</span>
            <ExternalLink size={11} />
          </a>
        )}
      </div>

      {/* Learning Assistant Modal */}
      <LearningAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        context={{
          topicId: content.topic.toLowerCase(),
          topicTitle: content.title,
          lessonId: content.id,
          lessonTitle: content.title,
        }}
      />
    </div>
  );
};

export default ExploreCard;
