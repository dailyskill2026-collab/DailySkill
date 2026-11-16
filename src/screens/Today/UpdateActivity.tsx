// src/screens/Today/UpdateActivity.tsx
import React, { useState } from 'react';
import { LearningContent } from '@/types/learning';
import Badge from '@/components/common/Badge';
import { useProgressStore } from '@/store/progressStore';
import ContentFeedbackBar from '@/components/feedback/ContentFeedbackBar';
import LearningAssistantModal from '@/components/assistant/LearningAssistantModal';
import { analytics } from '@/services/analyticsService';
import {
  Bot,
  Lightbulb,
  Target,
  Code2,
  ExternalLink,
  CheckCircle,
  Circle,
  Sparkles,
  Clock,
  BookOpen,
} from 'lucide-react';

interface Props {
  content: LearningContent & {
    codeSnippet?: string;
    keyTakeaways?: string[];
  };
}

const UpdateActivity: React.FC<Props> = ({ content }) => {
  const isVerified = content.verificationStatus === 'verified';
  const { dailyProgress, setProgress } = useProgressStore();
  const progressed = dailyProgress[content.id];
  const [isCompleted, setIsCompleted] = useState<boolean>(!!(progressed?.status === 'completed'));
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const handleToggle = () => {
    const newState = !isCompleted;
    setIsCompleted(newState);
    if (newState) {
      setProgress({
        activityId: content.id,
        status: 'completed',
        completedAt: new Date().toISOString(),
      });
      analytics.trackLessonCompleted(content.id, 'today');
    }
  };

  return (
    <div
      role="button"
      aria-label={`Apex Queueable: Stay Updated - ${content.title}`}
      aria-pressed={isCompleted}
      onClick={handleToggle}
      className={`card p-5 space-y-4 transition-all duration-200 border text-left cursor-pointer ${
        isCompleted
          ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/10'
          : 'border-slate-200 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-700 shadow-sm'
      }`}
    >
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-2xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-0.5 rounded-full border border-brand-200 dark:border-brand-800">
            Stay Updated
          </span>
          {content.releaseVersion && (
            <span className="text-2xs font-semibold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
              <Sparkles size={10} />
              {content.releaseVersion}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-2xs text-muted">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {content.estimatedMinutes || 2} min read
          </span>
          {!isVerified && <Badge label="Sample" variant="sample" />}
        </div>
      </div>

      {/* Main Title & Summary */}
      <div className="space-y-1.5">
        <h3 className="text-lg sm:text-xl font-bold text-primary leading-tight">
          {content.title}
        </h3>
        <p className="text-xs sm:text-sm text-secondary leading-relaxed">
          {content.summary}
        </p>
      </div>

      {/* Structured Content Blocks (Snackable Microlearning) */}
      <div className="space-y-3 pt-1" onClick={(e) => e.stopPropagation()}>
        {/* 1. What's New / Innovation Callout */}
        {content.explanation && (
          <div className="p-3.5 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/80 dark:border-blue-900/60 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-300">
              <Lightbulb size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
              <span>What's New in this Release?</span>
            </div>
            <p className="text-xs text-blue-950/90 dark:text-blue-100/90 leading-relaxed">
              {content.explanation}
            </p>
          </div>
        )}

        {/* 2. Production Impact / Why It Matters */}
        {content.realWorldExample && (
          <div className="p-3.5 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200/80 dark:border-emerald-900/60 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-300">
              <Target size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Why It Matters in Production</span>
            </div>
            <p className="text-xs text-emerald-950/90 dark:text-emerald-100/90 leading-relaxed">
              {content.realWorldExample}
            </p>
          </div>
        )}

        {/* 3. Code Pattern / Architecture Snippet */}
        {content.codeSnippet && (
          <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
            <div className="px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-2xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Code2 size={13} className="text-indigo-400" />
                Modern Implementation Pattern
              </span>
              <span className="text-[10px] text-slate-500 uppercase">Salesforce Apex</span>
            </div>
            <pre className="p-3 text-[11px] font-mono leading-relaxed text-slate-200 overflow-x-auto whitespace-pre">
              <code>{content.codeSnippet}</code>
            </pre>
          </div>
        )}

        {/* 4. Key Takeaways */}
        {content.keyTakeaways && content.keyTakeaways.length > 0 && (
          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
            <p className="text-xs font-bold text-primary flex items-center gap-1.5">
              <BookOpen size={13} className="text-brand-600 dark:text-brand-400" />
              Key Technical Takeaways
            </p>
            <ul className="space-y-1.5">
              {content.keyTakeaways.map((point, idx) => (
                <li key={idx} className="text-xs text-secondary flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 5. Official Source Documentation Link */}
        {content.sourceUrl && (
          <div className="pt-1 flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="text-muted text-2xs">Verified Documentation:</span>
            <a
              href={content.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-2xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              <span>{content.sourceName || 'Salesforce Official Docs'}</span>
              <ExternalLink size={11} />
            </a>
          </div>
        )}
      </div>

      {/* Completion & Assistant Footer */}
      <div onClick={(e) => e.stopPropagation()} className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handleToggle}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              isCompleted
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 hover:bg-brand-100'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle size={14} />
                <span>Marked as Understood</span>
              </>
            ) : (
              <>
                <Circle size={14} />
                <span>Mark as Read</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsAssistantOpen(true)}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1.5 hover:underline py-1 px-2 rounded-md hover:bg-brand-50/50 dark:hover:bg-brand-950/30"
          >
            <Bot size={14} />
            <span>Ask Assistant</span>
          </button>
        </div>

        <ContentFeedbackBar contentId={content.id} />
      </div>

      {/* Learning Assistant Modal */}
      <div onClick={(e) => e.stopPropagation()}>
        <LearningAssistantModal
          isOpen={isAssistantOpen}
          onClose={() => setIsAssistantOpen(false)}
          context={{
            topicId: content.category || 'salesforce_release',
            topicTitle: content.title,
            lessonId: content.id,
            lessonTitle: content.title,
          }}
        />
      </div>
    </div>
  );
};

export default UpdateActivity;
