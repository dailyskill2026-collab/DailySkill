// src/screens/Today/RevisionCard.tsx
import React, { useState } from 'react';
import { LearningContent } from '@/types/learning';
import { useProgressStore } from '@/store/progressStore';
import { useNavigate } from 'react-router-dom';
import Badge from '@/components/common/Badge';
import { analytics } from '@/services/analyticsService';

interface Props {
  content: LearningContent;
}

/**
 * Very simple revision activity – asks the user to recall a fact.
 * For now we reuse the content title as the prompt and provide a static
 * true/false style question. In a real product this would be a richer
 * question set.
 */
const RevisionCard: React.FC<Props> = ({ content }) => {
  const navigate = useNavigate();
  const { setProgress, dailyProgress } = useProgressStore();

  const progress = dailyProgress[content.id];
  const [showAnswer, setShowAnswer] = useState<boolean>(!!progress && progress.status === 'completed');

  const handleShow = () => {
    // Mark as completed (no correctness needed for revision)
    setProgress({
      activityId: content.id,
      status: 'completed',
      completedAt: new Date().toISOString(),
    });
    analytics.trackRevisionCompleted(content.id, 'today');
    setShowAnswer(true);
  };

  const handleClose = () => {
    navigate('/');
  };

  const isSample = content.verificationStatus === 'sample';

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primary">Quick Revision</h3>
        {isSample && <Badge label="Sample Content" variant="sample" />}
      </div>
      <p className="text-sm text-secondary">
        {content.title}
      </p>
      {!showAnswer ? (
        <button
          onClick={handleShow}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Show Revision Prompt
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted">Recall the key points about <strong>{content.title}</strong>. Review your notes if needed.</p>
          <button
            onClick={handleClose}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
};

export default RevisionCard;
