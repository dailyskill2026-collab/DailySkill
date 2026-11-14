// src/screens/Today/UpdateActivity.tsx
import React, { useState } from 'react';
import { LearningContent } from '@/types/learning';
import Badge from '@/components/common/Badge';
import { useProgressStore } from '@/store/progressStore';

interface Props {
  content: LearningContent;
}

const UpdateActivity: React.FC<Props> = ({ content }) => {
  const isVerified = content.verificationStatus === 'verified';
  const { dailyProgress, setProgress } = useProgressStore();
  const progressed = dailyProgress[content.id];
  const [isCompleted, setIsCompleted] = useState<boolean>(!!(progressed?.status === 'completed'));

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
    } else {
      // optional: remove progress – for test simplicity we just leave it as is
    }
  };

  return (
    <div
      role="button"
      aria-label={`Apex Queueable: ${content.title}`}
      aria-pressed={isCompleted}
      onClick={handleToggle}
      className="card p-4 space-y-2"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primary">{content.title}</h3>
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
    </div>
  );
};

export default UpdateActivity;
