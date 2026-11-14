// src/components/feedback/ContentFeedbackBar.tsx
import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Flag, Check, AlertCircle } from 'lucide-react';
import { feedbackService } from '@/services/feedbackService';
import type { ContentIssueType } from '@/types/feedback';

interface Props {
  contentId: string;
  contentVersion?: string;
  className?: string;
}

export default function ContentFeedbackBar({ contentId, contentVersion = 'v1.0', className = '' }: Props) {
  const [voted, setVoted] = useState<'helpful' | 'not_helpful' | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [issueType, setIssueType] = useState<ContentIssueType>('confusing_explanation');
  const [comment, setComment] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = async (vote: 'helpful' | 'not_helpful') => {
    if (voted) return;
    setVoted(vote);
    try {
      await feedbackService.submitContentQualityFeedback({
        contentId,
        contentVersion,
        vote,
      });
    } catch {
      // ignore
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await feedbackService.submitContentQualityFeedback({
        contentId,
        contentVersion,
        issueType,
        comment,
      });
      setReportSubmitted(true);
      setTimeout(() => {
        setIsReportOpen(false);
        setReportSubmitted(false);
        setComment('');
      }, 1500);
    } catch {
      // ignore
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`border-t border-border-light dark:border-border-dark pt-3 mt-4 ${className}`}>
      <div className="flex items-center justify-between text-xs text-secondary">
        <span className="font-medium">Was this lesson helpful?</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleVote('helpful')}
            disabled={voted !== null}
            aria-label="Vote helpful"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors ${
              voted === 'helpful'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}
          >
            <ThumbsUp size={13} />
            <span>Helpful</span>
          </button>

          <button
            onClick={() => handleVote('not_helpful')}
            disabled={voted !== null}
            aria-label="Vote not helpful"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors ${
              voted === 'not_helpful'
                ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-600 dark:text-rose-400 font-semibold'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}
          >
            <ThumbsDown size={13} />
            <span>Not Helpful</span>
          </button>

          <button
            onClick={() => setIsReportOpen(!isReportOpen)}
            aria-label="Report content issue"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-1 text-muted hover:text-primary"
          >
            <Flag size={13} />
            <span>Report</span>
          </button>
        </div>
      </div>

      {/* Inline Report dialog */}
      {isReportOpen && (
        <form
          onSubmit={handleReportSubmit}
          className="mt-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-2.5 text-xs animate-fade-in"
        >
          {reportSubmitted ? (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 py-1">
              <Check size={14} />
              <span>Issue reported for mock admin review. Thank you!</span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between font-semibold text-primary">
                <span>Report Content Issue</span>
                <span className="text-2xs text-muted">ID: {contentId}</span>
              </div>

              <div>
                <label className="block text-secondary mb-1">Issue Category</label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value as ContentIssueType)}
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-surface-card text-primary outline-none"
                >
                  <option value="incorrect_information">Incorrect Information</option>
                  <option value="outdated_content">Outdated Content</option>
                  <option value="confusing_explanation">Confusing Explanation</option>
                  <option value="wrong_mcq_answer">Wrong MCQ Answer</option>
                  <option value="broken_reference">Broken Reference</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-secondary mb-1">Additional details (Optional)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Explain why this content needs review..."
                  rows={2}
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-surface-card text-primary outline-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReportOpen(false)}
                  className="px-3 py-1 rounded-lg text-secondary hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  );
}
