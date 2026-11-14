// src/components/feedback/FeedbackModal.tsx
import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Star, CheckCircle2, AlertCircle, History } from 'lucide-react';
import { feedbackService } from '@/services/feedbackService';
import { repositories } from '@/repositories';
import type { FeedbackCategory, UserFeedback } from '@/types/feedback';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  relatedScreen?: string;
  relatedContentId?: string;
}

export default function FeedbackModal({
  isOpen,
  onClose,
  relatedScreen = 'me',
  relatedContentId,
}: Props) {
  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');
  const [category, setCategory] = useState<FeedbackCategory>('feature_suggestion');
  const [rating, setRating] = useState<number>(5);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [myFeedback, setMyFeedback] = useState<UserFeedback[]>([]);

  const user = repositories.auth.getCurrentUser();
  const userId = user?.uid || 'guest-user';

  useEffect(() => {
    if (isOpen && activeTab === 'history') {
      loadMyFeedback();
    }
  }, [isOpen, activeTab]);

  const loadMyFeedback = async () => {
    try {
      const items = await feedbackService.getFeedbackByUser(userId);
      setMyFeedback(items);
    } catch {
      setMyFeedback([]);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMessage('Please provide a description of your feedback.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await feedbackService.submitFeedback({
        category,
        description: description.trim(),
        rating,
        relatedScreen,
        relatedContentId,
        mockUserId: userId,
      });

      setSuccessMessage('Thank you! Your feedback has been saved locally.');
      setDescription('');
      // Reload history if open
      loadMyFeedback();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-card rounded-2xl max-w-lg w-full p-6 shadow-xl border border-border-light dark:border-border-dark space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="text-brand-500" size={20} />
            <h2 className="text-lg font-bold text-primary">In-App Feedback</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-secondary hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b dark:border-gray-800 text-sm">
          <button
            onClick={() => setActiveTab('submit')}
            className={`pb-2 px-3 font-medium transition-colors border-b-2 ${
              activeTab === 'submit'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            Share Feedback
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2 px-3 font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            <History size={14} />
            My Submissions
          </button>
        </div>

        {activeTab === 'submit' ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            {successMessage && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-xl flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 rounded-xl flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block font-medium text-primary mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-surface-card text-primary focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="feature_suggestion">Feature Suggestion</option>
                <option value="bug_report">Bug Report</option>
                <option value="content_issue">Content Issue</option>
                <option value="learning_experience">Learning Experience</option>
                <option value="general_feedback">General Feedback</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-primary mb-1">Rating (Optional)</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star
                      size={20}
                      fill={star <= rating ? 'currentColor' : 'none'}
                      stroke="currentColor"
                    />
                  </button>
                ))}
                <span className="text-xs text-muted ml-2">{rating} of 5 stars</span>
              </div>
            </div>

            <div>
              <label className="block font-medium text-primary mb-1">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What can we improve or what went wrong?"
                rows={4}
                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-surface-card text-primary focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-secondary hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            {myFeedback.length === 0 ? (
              <p className="text-center py-6 text-sm text-secondary">
                You haven't submitted any feedback yet.
              </p>
            ) : (
              myFeedback.map((fb) => (
                <div
                  key={fb.id}
                  className="p-3 border rounded-xl border-border-light dark:border-border-dark space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      {fb.category.replace('_', ' ')}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full capitalize text-2xs font-medium ${
                        fb.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : fb.status === 'planned'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {fb.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-primary">{fb.description}</p>
                  <p className="text-muted text-2xs">{new Date(fb.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
