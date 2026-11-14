// src/screens/Today/QuizCard.tsx
import React, { useState } from 'react';
import { QuizQuestion } from '@/types/learning';
import { useProgressStore } from '@/store/progressStore';
import { useNavigate } from 'react-router-dom';
import { sampleQuizQuestions } from '@/data/sampleQuiz';
import Badge from '@/components/common/Badge';

interface Props {
  contentId: string; // the LearningContent.id this quiz is linked to
}

const QuizCard: React.FC<Props> = ({ contentId }) => {
  const navigate = useNavigate();
  const { setProgress, dailyProgress } = useProgressStore();
  const quiz = sampleQuizQuestions.find((q) => q.contentId === contentId);

  const progress = dailyProgress[contentId];

  const [selected, setSelected] = useState<string | null>(progress?.selectedAnswerId || null);
  const [submitted, setSubmitted] = useState<boolean>(!!progress && progress.status === 'completed');
  const [isCorrect, setIsCorrect] = useState<boolean>(progress?.isCorrect ?? false);

  if (!quiz) {
    return <div className="card p-4 text-sm text-muted">Quiz not available.</div>;
  }

  const handleOptionClick = (id: string) => {
    if (submitted) return; // prevent changes after submit
    setSelected(id);
  };

  const handleSubmit = () => {
    if (!selected) return;
    const correct = selected === quiz.correctAnswerId;
    setIsCorrect(correct);
    setSubmitted(true);
    // Persist progress
    setProgress({
      activityId: contentId,
      status: 'completed',
      completedAt: new Date().toISOString(),
      selectedAnswerId: selected,
      isCorrect: correct,
    });
  };

  const handleClose = () => {
    // After viewing result, go back to Today screen
    navigate('/');
  };

  return (
    <div className="card p-4 space-y-3">
      <h3 className="text-lg font-semibold text-primary">Practice</h3>
      <p className="text-sm text-secondary">{quiz.scenario}</p>
      <p className="font-medium">{quiz.question}</p>
      <div className="flex flex-col gap-2">
        {quiz.options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => handleOptionClick(opt.id)}
            disabled={submitted}
            className={`p-2 border rounded text-left transition-colors ${
              selected === opt.id ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
            } ${submitted ? 'cursor-default opacity-70' : ''}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!selected}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          Submit Answer
        </button>
      )}
      {submitted && (
        <div className="mt-3 space-y-2">
          {isCorrect ? (
            <p className="text-green-600 font-medium">Correct! 🎉</p>
          ) : (
            <p className="text-rose-600 font-medium">Incorrect.</p>
          )}
          <p className="text-sm text-secondary">{quiz.explanation}</p>
          <button
            onClick={handleClose}
            className="mt-2 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizCard;
