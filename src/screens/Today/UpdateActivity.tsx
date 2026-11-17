// src/screens/Today/UpdateActivity.tsx
import React, { useState } from 'react';
import { LearningContent } from '@/types/learning';
import Badge from '@/components/common/Badge';
import { useProgressStore } from '@/store/progressStore';
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
  ChevronRight,
} from 'lucide-react';

interface Props {
  content: LearningContent & {
    codeSnippet?: string;
    keyTakeaways?: string[];
  };
}

type TabType = 'whats_new' | 'why_matters' | 'code' | 'takeaways';

const UpdateActivity: React.FC<Props> = ({ content }) => {
  const isVerified = content.verificationStatus === 'verified';
  const { dailyProgress, setProgress } = useProgressStore();
  const progressed = dailyProgress[content.id];
  const [isCompleted, setIsCompleted] = useState<boolean>(!!(progressed?.status === 'completed'));
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  
  // Interactive tab state: user clicks a minimal button to reveal that specific section
  const [activeTab, setActiveTab] = useState<TabType>('whats_new');

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
          ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20'
          : 'border-slate-200/90 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-700 shadow-sm'
      }`}
    >
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-2xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            Stay Updated
          </span>
          {content.releaseVersion && (
            <span className="text-2xs font-semibold px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 flex items-center gap-1">
              <Sparkles size={10} className="text-sky-600 dark:text-sky-400" />
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

      {/* Main Title & Concise Lead */}
      <div className="space-y-1.5">
        <h3 className="text-lg sm:text-xl font-bold text-primary leading-tight">
          {content.title}
        </h3>
        <p className="text-xs sm:text-sm text-secondary leading-relaxed">
          {content.summary}
        </p>
      </div>

      {/* Minimal Buttons: Click button to display content dynamically on demand */}
      <div className="space-y-3 pt-1" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('whats_new')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'whats_new'
                ? 'bg-emerald-600 text-white shadow-xs scale-[1.02]'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Lightbulb size={13} className={activeTab === 'whats_new' ? 'text-amber-200' : 'text-amber-500'} />
            <span>What's New</span>
          </button>

          {content.realWorldExample && (
            <button
              type="button"
              onClick={() => setActiveTab('why_matters')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'why_matters'
                  ? 'bg-emerald-600 text-white shadow-xs scale-[1.02]'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Target size={13} className={activeTab === 'why_matters' ? 'text-teal-200' : 'text-teal-500'} />
              <span>Why It Matters</span>
            </button>
          )}

          {content.codeSnippet && (
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'code'
                  ? 'bg-emerald-600 text-white shadow-xs scale-[1.02]'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Code2 size={13} className={activeTab === 'code' ? 'text-sky-200' : 'text-sky-500'} />
              <span>Code Pattern</span>
            </button>
          )}

          {content.keyTakeaways && content.keyTakeaways.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('takeaways')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'takeaways'
                  ? 'bg-emerald-600 text-white shadow-xs scale-[1.02]'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <BookOpen size={13} className={activeTab === 'takeaways' ? 'text-emerald-200' : 'text-emerald-500'} />
              <span>Key Takeaways</span>
            </button>
          )}
        </div>

        {/* Dynamic Content Display based on clicked button */}
        <div className="animate-fade-in transition-all">
          {activeTab === 'whats_new' && content.explanation && (
            <div className="p-4 bg-gradient-to-r from-emerald-50/90 via-teal-50/80 to-sky-50/80 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-sky-950/30 border border-emerald-200/80 dark:border-emerald-900/60 rounded-2xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-300">
                <Lightbulb size={14} className="text-amber-500 shrink-0" />
                <span>What's New in this Release?</span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-950/90 dark:text-emerald-100/90 leading-relaxed">
                {content.explanation}
              </p>
            </div>
          )}

          {activeTab === 'why_matters' && content.realWorldExample && (
            <div className="p-4 bg-gradient-to-r from-teal-50/90 to-sky-50/80 dark:from-teal-950/30 dark:to-sky-950/30 border border-teal-200/80 dark:border-teal-900/60 rounded-2xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900 dark:text-teal-300">
                <Target size={14} className="text-teal-600 dark:text-teal-400 shrink-0" />
                <span>Production Impact & Architecture</span>
              </div>
              <p className="text-xs sm:text-sm text-teal-950/90 dark:text-teal-100/90 leading-relaxed">
                {content.realWorldExample}
              </p>
            </div>
          )}

          {activeTab === 'code' && content.codeSnippet && (
            <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
              <div className="px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-2xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Code2 size={13} />
                  Modern Implementation Pattern
                </span>
                <span className="text-[10px] text-slate-500 uppercase">Salesforce Apex</span>
              </div>
              <pre className="p-3 text-[11px] font-mono leading-relaxed text-slate-200 overflow-x-auto whitespace-pre">
                <code>{content.codeSnippet}</code>
              </pre>
            </div>
          )}

          {activeTab === 'takeaways' && content.keyTakeaways && content.keyTakeaways.length > 0 && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <p className="text-xs font-bold text-primary flex items-center gap-1.5">
                <BookOpen size={14} className="text-emerald-600 dark:text-emerald-400" />
                Key Technical Takeaways
              </p>
              <ul className="space-y-1.5">
                {content.keyTakeaways.map((point, idx) => (
                  <li key={idx} className="text-xs text-secondary flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Official Source Link */}
        {content.sourceUrl && (
          <div className="pt-1 flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="text-muted text-2xs">Verified Documentation:</span>
            <a
              href={content.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-2xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              <span>{content.sourceName || 'Salesforce Official Docs'}</span>
              <ExternalLink size={11} />
            </a>
          </div>
        )}
      </div>

      {/* Completion & Assistant Actions Footer */}
      <div onClick={(e) => e.stopPropagation()} className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleToggle}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              isCompleted
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle size={14} />
                <span>Marked as Understood ✓</span>
              </>
            ) : (
              <>
                <Circle size={14} />
                <span>Mark as Read</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsAssistantOpen(true)}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 hover:underline py-1.5 px-3 rounded-xl hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 transition"
          >
            <Bot size={14} />
            <span>Ask AI Assistant ✦</span>
          </button>
        </div>
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
