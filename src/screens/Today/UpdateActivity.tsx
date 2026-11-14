// src/screens/Today/UpdateActivity.tsx
import React, { useState } from 'react';
import { LearningContent } from '@/types/learning';
import Badge from '@/components/common/Badge';
import { useProgressStore } from '@/store/progressStore';
import ContentFeedbackBar from '@/components/feedback/ContentFeedbackBar';
import LearningAssistantModal from '@/components/assistant/LearningAssistantModal';
import { analytics } from '@/services/analyticsService';
import { Bot } from 'lucide-react';

interface Props {
  content: LearningContent;
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
    // Persist progress if completed
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
      className="card p-4 space-y-2"
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="text-2xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Stay Updated
          </span>
          <h3 className="text-lg font-semibold text-primary">{content.title}</h3>
        </div>
        {!isVerified && <Badge label="Sample Content" variant="sample" />}
      </div>
      <p className="text-sm text-secondary">{content.summary}</p>
      <section className="text-xs text-muted space-y-1">
        <p><strong>What’s New?</strong> {content.explanation ?? '—'}</p>
        <p><strong>Why It Matters</strong> {content.realWorldExample ?? '—'}</p>
        {content.sourceUrl && (
          <p>
            <strong>Source:</strong>{' '}
            <a href={content.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              {content.sourceName ?? content.sourceUrl}
            </a>
          </p>
        )}
      </section>

      <div onClick={(e) => e.stopPropagation()} className="space-y-2">
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setIsAssistantOpen(true)}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline"
          >
            <Bot size={13} />
            <span>Ask Assistant</span>
          </button>
        </div>
        <ContentFeedbackBar contentId={content.id} />
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <LearningAssistantModal
          isOpen={isAssistantOpen}
          onClose={() => setIsAssistantOpen(false)}
          context={{
            topicId: content.category || 'apex',
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
