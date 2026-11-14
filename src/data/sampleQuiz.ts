// src/data/sampleQuiz.ts
import { QuizQuestion } from '@/types/learning';

export const sampleQuizQuestions: QuizQuestion[] = [
  {
    id: 'quiz-queueable-1',
    contentId: 'sf-practice-queueable',
    questionType: 'scenario_mcq',
    scenario:
      'An insurance application approves a policy in Salesforce. A callout must immediately sync policy data with an external underwriting ledger, followed by a separate asynchronous notification job. The operation must return control to the agent in under 300ms.',
    question: 'Which Apex asynchronous architecture best satisfies both callouts and chaining requirements?',
    options: [
      { id: 'A', label: 'Use an @future(callout=true) method and call a second @future method inside it' },
      { id: 'B', label: 'Implement Queueable Apex with Database.AllowsCallouts and chain the second job inside execute()' },
      { id: 'C', label: 'Execute a synchronous HTTP callout directly in an after-insert record trigger' },
      { id: 'D', label: 'Use a Scheduled Apex job running every 5 minutes' },
    ],
    correctAnswerId: 'B',
    explanation:
      'Queueable Apex with Database.AllowsCallouts allows making external HTTP calls in the background and chaining a successor Queueable job via System.enqueueJob(). Calling @future from @future is forbidden and throws an exception.',
    difficulty: 'medium',
  },
];
