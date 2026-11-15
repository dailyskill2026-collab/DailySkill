// ============================================================
// MOCK DATA — IT Daily Upskilling
// ⚠️  ALL CONTENT IS SAMPLE DATA — Not verified Salesforce releases
// ============================================================

import type {
  User,
  DailyActivity,
  UpdateCard,
  LearningPath,
  RevisionTopic,
  MockQuiz,
} from '@/types'

// ---- User ----
export const mockUser: User = {
  id: 'usr-001',
  name: 'Rahul Sharma',
  initials: 'RS',
  role: 'developer',
  experienceLevel: 'intermediate',
  streak: 12,
  totalLessons: 87,
  totalRevisions: 134,
  revisionScore: 73,
  pathsCompleted: 2,
  interests: ['Apex', 'LWC', 'Agentforce', 'Integration'],
  joinedDate: '2024-08-01',
  weeklyActivity: [1, 3, 2, 3, 3, 2, 1], // Sun–Sat — lessons per day
}

// ---- Daily Activities (Today screen) ----
export const mockDailyActivities: DailyActivity[] = [
  {
    id: 'act-001',
    type: 'update',
    icon: 'Zap',
    tag: 'Stay Updated',
    title: 'Apex Queueable: Chaining Jobs Best Practices',
    description:
      'Discover how to chain Queueable Apex jobs effectively to avoid governor limit errors in complex async workflows.',
    durationMinutes: 2,
    completed: false,
    color: 'bg-brand-100 dark:bg-brand-950',
  },
  {
    id: 'act-002',
    type: 'practice',
    icon: 'Code2',
    tag: 'Practice',
    title: 'Debug a Broken Trigger Scenario',
    description:
      'Walk through a real-world Apex trigger bug with recursive execution. Identify the fix using static variables.',
    durationMinutes: 2,
    completed: false,
    color: 'bg-emerald-100 dark:bg-emerald-950',
  },
  {
    id: 'act-003',
    type: 'revise',
    icon: 'RefreshCw',
    tag: 'Remember',
    title: 'Salesforce Sharing Rules — Key Concepts',
    description:
      'Quick recap of criteria-based vs. ownership-based sharing rules and when to use each.',
    durationMinutes: 1,
    completed: false,
    color: 'bg-amber-100 dark:bg-amber-950',
  },
]

// ---- Explore Feed (UpdateCards) ----
export const mockExploreCards: UpdateCard[] = [
  {
    id: 'exp-001',
    category: 'apex',
    title: 'Apex Queueable: Best Practices for Chaining Jobs',
    summary:
      'Chaining Queueable jobs is powerful but requires careful handling of governor limits. Learn the patterns that keep your async code clean and scalable.',
    readTimeMinutes: 4,
    sourceLabel: 'Salesforce Docs',
    isSampleData: true,
    isBookmarked: false,
    publishedLabel: '⚠️ Sample Content — not a real release announcement',
    tags: ['Apex', 'Async', 'Queueable'],
  },
  {
    id: 'exp-002',
    category: 'lwc',
    title: 'LWC Parent-to-Child Communication with @api',
    summary:
      'Mastering component communication in Lightning Web Components starts with the @api decorator. See real examples of property binding and method calls.',
    readTimeMinutes: 3,
    sourceLabel: 'LWC Developer Guide',
    isSampleData: true,
    isBookmarked: false,
    publishedLabel: '⚠️ Sample Content — not a real release announcement',
    tags: ['LWC', 'Components', 'Communication'],
  },
  {
    id: 'exp-003',
    category: 'integration',
    title: 'Salesforce REST Integration Patterns',
    summary:
      'Explore the four key integration patterns — Request-Reply, Fire-and-Forget, Batch, and Remote Call-In — and when to apply each in enterprise projects.',
    readTimeMinutes: 5,
    sourceLabel: 'Integration Architecture Guide',
    isSampleData: true,
    isBookmarked: false,
    publishedLabel: '⚠️ Sample Content — not a real release announcement',
    tags: ['Integration', 'REST', 'Architecture'],
  },
  {
    id: 'exp-004',
    category: 'updates',
    title: 'Platform Events: Real-Time Data in Salesforce',
    summary:
      'Platform Events enable event-driven architectures inside Salesforce. Learn how to publish and subscribe with Apex and Process Builder.',
    readTimeMinutes: 4,
    sourceLabel: 'Salesforce Developer Blog',
    isSampleData: true,
    isBookmarked: false,
    publishedLabel: '⚠️ Sample Content — not a real release announcement',
    tags: ['Platform Events', 'Event-Driven', 'Integration'],
  },
  {
    id: 'exp-005',
    category: 'agentforce',
    title: 'Agentforce Fundamentals for Salesforce Developers',
    summary:
      'Agentforce brings AI agents to the Salesforce platform. Understand what it means for developers: actions, topics, and how agents interact with your org data.',
    readTimeMinutes: 5,
    sourceLabel: 'Trailhead — Sample',
    isSampleData: true,
    isBookmarked: false,
    publishedLabel: '⚠️ Sample Content — not a real release announcement',
    tags: ['Agentforce', 'AI', 'Developer Preview'],
  },
  {
    id: 'exp-006',
    category: 'apex',
    title: 'Understanding Bulkification in Apex Triggers',
    summary:
      'Every Apex trigger should be bulkified. This guide walks through the common mistakes and how to refactor triggers to handle up to 200 records safely.',
    readTimeMinutes: 3,
    sourceLabel: 'Apex Developer Guide',
    isSampleData: true,
    isBookmarked: false,
    publishedLabel: '⚠️ Sample Content — not a real release announcement',
    tags: ['Apex', 'Triggers', 'Best Practices'],
  },
]

// ---- Learning Paths ----
export const mockLearningPaths: LearningPath[] = [
  {
    id: 'path-001',
    icon: 'Settings',
    title: 'Salesforce Administration',
    description: 'Master user management, security, and org configuration.',
    totalLessons: 24,
    completedLessons: 0,
    durationMinutes: 240,
    level: 'beginner',
    color: 'from-sky-500 to-blue-600',
    accentColor: 'text-sky-600 dark:text-sky-400',
  },
  {
    id: 'path-002',
    icon: 'Code2',
    title: 'Apex Development',
    description: 'Write efficient, scalable server-side Apex code.',
    totalLessons: 32,
    completedLessons: 0,
    durationMinutes: 320,
    level: 'intermediate',
    color: 'from-brand-500 to-brand-700',
    accentColor: 'text-brand-600 dark:text-brand-400',
  },
  {
    id: 'path-003',
    icon: 'Layout',
    title: 'Lightning Web Components',
    description: 'Build modern, reusable UI components for Salesforce.',
    totalLessons: 28,
    completedLessons: 0,
    durationMinutes: 280,
    level: 'intermediate',
    color: 'from-indigo-500 to-purple-600',
    accentColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'path-004',
    icon: 'GitMerge',
    title: 'Salesforce Integrations',
    description: 'Connect Salesforce to external systems via REST, SOAP and more.',
    totalLessons: 20,
    completedLessons: 0,
    durationMinutes: 200,
    level: 'advanced',
    color: 'from-teal-500 to-emerald-600',
    accentColor: 'text-teal-600 dark:text-teal-400',
  },
  {
    id: 'path-005',
    icon: 'Shield',
    title: 'Security and Sharing',
    description: 'Understand profiles, roles, sharing rules and OWD.',
    totalLessons: 18,
    completedLessons: 0,
    durationMinutes: 180,
    level: 'intermediate',
    color: 'from-rose-500 to-pink-600',
    accentColor: 'text-rose-600 dark:text-rose-400',
  },
  {
    id: 'path-006',
    icon: 'Workflow',
    title: 'Flows and Automation',
    description: 'Automate business processes without code using Flow Builder.',
    totalLessons: 22,
    completedLessons: 0,
    durationMinutes: 220,
    level: 'beginner',
    color: 'from-orange-400 to-amber-500',
    accentColor: 'text-orange-600 dark:text-orange-400',
  },
  {
    id: 'path-007',
    icon: 'Bot',
    title: 'Agentforce',
    description: 'Build AI-powered agents inside the Salesforce platform.',
    totalLessons: 15,
    completedLessons: 0,
    durationMinutes: 150,
    level: 'advanced',
    color: 'from-violet-500 to-purple-700',
    accentColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    id: 'path-008',
    icon: 'MessageSquare',
    title: 'Interview Preparation',
    description: 'Prepare for Salesforce developer and admin interviews with real Q&A.',
    totalLessons: 30,
    completedLessons: 0,
    durationMinutes: 150,
    level: 'intermediate',
    color: 'from-slate-500 to-gray-700',
    accentColor: 'text-slate-600 dark:text-slate-400',
  },
]

// ---- Revision Topics ----
export const mockRevisionTopics: RevisionTopic[] = [
  {
    id: 'rev-001',
    title: 'Queueable Apex',
    tag: 'Apex',
    lastReviewedLabel: '5 days ago',
    strengthPercent: 60,
    dueCount: 3,
    color: 'bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300',
  },
  {
    id: 'rev-002',
    title: 'LWC Lifecycle Hooks',
    tag: 'LWC',
    lastReviewedLabel: '3 days ago',
    strengthPercent: 45,
    dueCount: 5,
    color: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300',
  },
  {
    id: 'rev-003',
    title: 'Salesforce Sharing Rules',
    tag: 'Security',
    lastReviewedLabel: '7 days ago',
    strengthPercent: 30,
    dueCount: 7,
    color: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300',
  },
  {
    id: 'rev-004',
    title: 'REST API Authentication',
    tag: 'Integration',
    lastReviewedLabel: '2 days ago',
    strengthPercent: 72,
    dueCount: 2,
    color: 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300',
  },
]

// ---- Mock Quiz (Revise modal) ----
export const mockQuizzes: MockQuiz[] = [
  {
    id: 'quiz-001',
    topicTitle: 'Queueable Apex',
    question:
      'Which interface must a class implement to be executed as a Queueable Apex job?',
    options: [
      'Schedulable',
      'Queueable',
      'Batchable',
      'Finalizer',
    ],
    correctIndex: 1,
    explanation:
      'A class must implement the Queueable interface and define an execute(QueueableContext ctx) method to be enqueued with System.enqueueJob().',
  },
  {
    id: 'quiz-002',
    topicTitle: 'LWC Lifecycle Hooks',
    question: 'Which LWC lifecycle hook fires when the component is inserted into the DOM?',
    options: [
      'constructor()',
      'connectedCallback()',
      'renderedCallback()',
      'disconnectedCallback()',
    ],
    correctIndex: 1,
    explanation:
      'connectedCallback() fires when the component is inserted into the DOM tree. It is the right place to fetch data or subscribe to events.',
  },
  {
    id: 'quiz-003',
    topicTitle: 'Salesforce Sharing Rules',
    question: 'What is the purpose of an Ownership-based Sharing Rule?',
    options: [
      'Shares records based on field values on the record',
      'Shares records owned by a group with another group',
      'Restricts access below the OWD setting',
      'Grants access to all records in the org',
    ],
    correctIndex: 1,
    explanation:
      'Ownership-based Sharing Rules share records owned by members of a role, role + subordinates, or public group with another group, extending access beyond OWD.',
  },
]
