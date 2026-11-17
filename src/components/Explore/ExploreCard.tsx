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
} from 'lucide-react';

interface ExploreCardProps {
  content: LearningContent;
}

export const ExploreCard: React.FC<ExploreCardProps> = ({ content }) => {
  const { toggleBookmark, isBookmarked } = useBookmarkStore();
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const bookmarked = isBookmarked(content.id);

  const handleBookmark = () => {
    toggleBookmark(content.id);
  };

  const handleShare = async () => {
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

  // Fallback conversation if content is legacy or custom AI generated
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

  return (
    <div
      className="card p-5 sm:p-6 space-y-4 border border-slate-200 dark:border-slate-800/90 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-700/80 transition-all rounded-3xl"
      data-testid={`explore-card-${content.id}`}
    >
      {/* Top Header: Release Tag, Topic & Reading Time */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {content.version && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 flex items-center gap-1">
              <Sparkles size={12} className="text-sky-600 dark:text-sky-400" />
              {content.version}
            </span>
          )}
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            {content.topic}
          </span>
          <span className="text-xs font-medium text-slate-500 capitalize">
            {content.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted">
          <Clock size={13} />
          <span>{content.readingTimeMinutes || 2} min read</span>
        </div>
      </div>

      {/* Main Title */}
      <h3 className="text-xl sm:text-2xl font-extrabold text-primary leading-tight tracking-tight">
        {content.title}
      </h3>

      {/* Conversational Dialogue Stream (Relaxing Coffee Chat Format) */}
      <div className="space-y-3 pt-1">
        {turns.map((turn, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${
              turn.speaker === 'mentor' ? 'flex-row' : 'flex-row'
            }`}
          >
            {/* Avatar Pill */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-base shadow-2xs select-none ${
                turn.speaker === 'mentor'
                  ? 'bg-emerald-100 border border-emerald-300 dark:bg-emerald-950 dark:border-emerald-800'
                  : 'bg-slate-200 border border-slate-300 dark:bg-slate-800 dark:border-slate-700'
              }`}
              title={turn.name}
            >
              <span>{turn.avatar}</span>
            </div>

            {/* Message Bubble */}
            <div className="flex-1 space-y-1">
              <span className="text-2xs font-bold text-muted px-1 uppercase tracking-wider">
                {turn.name}
              </span>
              <div
                className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  turn.speaker === 'mentor'
                    ? 'bg-gradient-to-r from-emerald-50/90 via-teal-50/80 to-sky-50/80 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-sky-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-100 rounded-tl-xs shadow-2xs font-normal'
                    : 'bg-slate-100 dark:bg-slate-800/90 text-primary border border-slate-200/80 dark:border-slate-700/80 rounded-tl-xs shadow-2xs'
                }`}
              >
                <p className="whitespace-pre-line">{turn.message}</p>

                {/* Optional In-Chat Code Snippet */}
                {turn.codeSnippet && (
                  <div className="mt-2.5 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner">
                    <pre className="p-3 text-[11px] sm:text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed">
                      <code>{turn.codeSnippet}</code>
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Takeaway Banner */}
      {content.keyTakeaway && (
        <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl flex items-start gap-2.5">
          <Lightbulb size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-amber-950 dark:text-amber-100 leading-relaxed font-medium">
            <strong className="font-bold">Key Takeaway: </strong>
            {content.keyTakeaway}
          </p>
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBookmark}
            data-testid="bookmark-btn"
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
              bookmarked
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Bookmark size={14} className={bookmarked ? 'fill-current' : ''} />
            <span>{bookmarked ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={handleShare}
            data-testid="share-btn"
            className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all active:scale-95"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
            <span>{copied ? 'Copied!' : 'Share'}</span>
          </button>

          <button
            onClick={() => setIsAssistantOpen(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-all active:scale-95"
          >
            <Bot size={14} />
            <span>Ask AI ✦</span>
          </button>
        </div>

        {content.sourceUrl && (
          <a
            href={content.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="readmore-link"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            <span>{content.sourceName || 'Official Help Docs'}</span>
            <ExternalLink size={12} />
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
