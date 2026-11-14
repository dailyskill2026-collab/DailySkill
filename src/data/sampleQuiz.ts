// src/data/sampleQuiz.ts
import { QuizQuestion } from '@/types/learning';

export const sampleQuizQuestions: QuizQuestion[] = [
  {
    id: 'quiz-queueable-1',
    contentId: 'sf-practice-queueable',
    questionType: 'scenario_mcq',
    scenario: 'An insurance company creates policies in Salesforce. After a policy is created, details must be sent to an external system without delaying the user.',
    question: 'Which Apex approach is suitable for this requirement?',
    options: [
      { id: 'A', label: 'Validation Rule' },
      { id: 'B', label: 'Queueable Apex' },
      { id: 'C', label: 'Formula Field' },
      { id: 'D', label: 'Page Layout' },
    ],
    correctAnswerId: 'B',
    explanation: 'Queueable Apex supports asynchronous processing and callouts when implemented appropriately.',
    difficulty: 'medium',
  },
];
