// src/data/betaReadinessData.ts
import type { BetaReadinessItem, MVPScopeFeature } from '@/types/contentQuality';

export const BETA_READINESS_CHECKLIST: BetaReadinessItem[] = [
  {
    id: 'beta-1',
    dimension: 'Database Architecture',
    title: 'Dual-Mode Repository & Persistence',
    status: 'partially_complete',
    notes: 'Repository interfaces and local storage engines ready (Sprint 9); live cloud instance (Firebase Firestore or PostgreSQL) pending provisioning.',
    isMockOnly: true
  },
  {
    id: 'beta-2',
    dimension: 'Identity & Authentication',
    title: 'User Authentication & Session Security',
    status: 'partially_complete',
    notes: 'Mock Auth system, role-based guardrails, and account profiles operational; production OAuth 2.0 / Firebase Auth token exchange deferred to cloud sprint.',
    isMockOnly: true
  },
  {
    id: 'beta-3',
    dimension: 'Backend Infrastructure',
    title: 'Secure Server-Side API Gateway',
    status: 'not_started',
    notes: 'App runs 100% in client sandbox; serverless functions or Express/FastAPI layer needed for secret protection before public launch.',
    isMockOnly: false
  },
  {
    id: 'beta-4',
    dimension: 'Content Ingestion',
    title: 'Automated Release Source Parser',
    status: 'partially_complete',
    notes: 'Mock document collector, topic extraction schema, and duplicate detection verified (Sprint 5); live HTML scraper to be connected with rate limits.',
    isMockOnly: true
  },
  {
    id: 'beta-5',
    dimension: 'AI Integration',
    title: 'Production LLM Orchestration',
    status: 'not_started',
    notes: 'Pre-indexed canonical matching and prompt templates ready (Sprint 12); real OpenAI/Gemini API calls disabled to prevent budget overrun.',
    isMockOnly: false
  },
  {
    id: 'beta-6',
    dimension: 'Technical Review',
    title: 'Salesforce SME Factual Verification',
    status: 'partially_complete',
    notes: 'Audit logs and admin review queues active (Sprint 7); designated Salesforce certified SMEs required for continuous real-world verification.',
    isMockOnly: true
  },
  {
    id: 'beta-7',
    dimension: 'Content Publishing',
    title: 'Role-Based Publishing Guardrails',
    status: 'complete',
    notes: 'Approval gating, risk classification, and unverified content blocks fully enforced in repository layer.',
    isMockOnly: false
  },
  {
    id: 'beta-8',
    dimension: 'Product Telemetry',
    title: 'Privacy-Preserving Local Analytics',
    status: 'complete',
    notes: 'Session tracking, drop-off funnels, and retention cohort aggregation work locally without third-party trackers (Sprint 11).',
    isMockOnly: false
  },
  {
    id: 'beta-9',
    dimension: 'User Trust & Safety',
    title: 'Educational Assessment Disclaimers',
    status: 'complete',
    notes: 'Prominent notices on all quiz, diagnostic, and gap report screens clarifying that scores are self-assessments, not official credentials.',
    isMockOnly: false
  },
  {
    id: 'beta-10',
    dimension: 'Legal & Compliance',
    title: 'Terms of Service & Privacy Policy',
    status: 'not_started',
    notes: 'Placeholder links rendered in MeScreen; formal legal agreements to be drafted before onboarding commercial external users.',
    isMockOnly: false
  },
  {
    id: 'beta-11',
    dimension: 'Data Resilience',
    title: 'Backup, Recovery & Data Migration',
    status: 'not_started',
    notes: 'Local JSON export implemented (Sprint 11); cloud database backup scheduling and retention policies pending backend setup.',
    isMockOnly: false
  },
  {
    id: 'beta-12',
    dimension: 'Financial Sustainability',
    title: 'Startup Budget Preservation (₹50k-₹1L)',
    status: 'complete',
    notes: 'Zero cloud infrastructure expenses incurred across Sprints 1–14; startup development budget fully intact.',
    isMockOnly: false
  },
  {
    id: 'beta-13',
    dimension: 'Application Delivery',
    title: 'Production Build & PWA Installability',
    status: 'partially_complete',
    notes: 'Vite build is green, bundle is minified, offline Service Worker is registered; custom production domain deployment pending.',
    isMockOnly: false
  },
  {
    id: 'beta-14',
    dimension: 'Onboarding Experience',
    title: 'Guided Persona Selection (2-5 min daily)',
    status: 'complete',
    notes: 'Role, technology, experience, and daily learning duration preferences are persisted and guide daily recommendations (Sprint 2 & 10).',
    isMockOnly: false
  }
];

export const MVP_SCOPE_FEATURES: MVPScopeFeature[] = [
  // --- MUST HAVE (Private Beta 1.0) ---
  {
    featureId: 'scope-1',
    name: 'Persona-Based Onboarding & Goal Setting',
    category: 'must_have',
    description: 'Allows learner to set role, technology (Salesforce), and daily study budget (3, 5, 10 min).',
    status: 'ready',
    targetRelease: 'Beta 1.0'
  },
  {
    featureId: 'scope-2',
    name: 'Personalized Daily Plan ("Today" Tab)',
    category: 'must_have',
    description: 'Serves exactly 1 update, 1 scenario practice MCQ, and 1 revision card per day based on role.',
    status: 'ready',
    targetRelease: 'Beta 1.0'
  },
  {
    featureId: 'scope-3',
    name: 'Scenario-Based Practice MCQs with Instant Feedback',
    category: 'must_have',
    description: 'Real-world business situations with 4 distinct options and comprehensive technical explanations.',
    status: 'ready',
    targetRelease: 'Beta 1.0'
  },
  {
    featureId: 'scope-4',
    name: 'Smart Spaced Repetition (SRS Revise Engine)',
    category: 'must_have',
    description: 'Dynamically reschedules weak topics (1, 3, 7, 14, 30 day intervals) based on attempt accuracy.',
    status: 'ready',
    targetRelease: 'Beta 1.0'
  },
  {
    featureId: 'scope-5',
    name: 'Explore Feed with Search & Offline Bookmarking',
    category: 'must_have',
    description: 'Filterable catalog of technical updates with official documentation references and bookmarks.',
    status: 'ready',
    targetRelease: 'Beta 1.0'
  },
  {
    featureId: 'scope-6',
    name: 'Skill Diagnostics & Gap Analysis Dashboard',
    category: 'must_have',
    description: 'Quick (5Q), Topic (10Q), and Skill Check (20Q) diagnostics with conservative gap ratings and action plans.',
    status: 'ready',
    targetRelease: 'Beta 1.0'
  },
  {
    featureId: 'scope-7',
    name: 'Educational Disclaimers on all Assessments',
    category: 'must_have',
    description: 'Clear notices stating that self-assessments are educational upskilling tools, not official credentials.',
    status: 'ready',
    targetRelease: 'Beta 1.0'
  },

  // --- SHOULD HAVE (Post-Beta v1.1) ---
  {
    featureId: 'scope-8',
    name: 'Live Firebase / Supabase Authentication',
    category: 'should_have',
    description: 'Enables users to sync bookmarks and streak history across mobile and desktop devices.',
    status: 'in_progress',
    targetRelease: 'v1.1'
  },
  {
    featureId: 'scope-9',
    name: 'Cloud Database Synchronization',
    category: 'should_have',
    description: 'Syncs local user progress with encrypted cloud storage while supporting offline fallback.',
    status: 'in_progress',
    targetRelease: 'v1.1'
  },
  {
    featureId: 'scope-10',
    name: 'Real AI Learning Assistant with Guardrails',
    category: 'should_have',
    description: 'Connects vetted LLM endpoints to answer technical doubts while citing verified documentation.',
    status: 'deferred',
    targetRelease: 'v1.1'
  },
  {
    featureId: 'scope-11',
    name: 'In-App & Email Push Reminders for Daily Habits',
    category: 'should_have',
    description: 'Notification service to prompt learners at their chosen preferred daily learning time.',
    status: 'deferred',
    targetRelease: 'v1.1'
  },

  // --- LATER (Enterprise / v2.0) ---
  {
    featureId: 'scope-12',
    name: 'Multi-Technology Catalog (Java, Python, AWS, DevOps)',
    category: 'later',
    description: 'Expands the daily micro-learning model to additional engineering and cloud disciplines.',
    status: 'deferred',
    targetRelease: 'v2.0'
  },
  {
    featureId: 'scope-13',
    name: 'Paid Subscriptions & Payment Gateway Integration',
    category: 'later',
    description: 'Freemium tiering with premium deep-dive exam preparation and pro certifications.',
    status: 'deferred',
    targetRelease: 'v2.0'
  },
  {
    featureId: 'scope-14',
    name: 'Automated Live Salesforce Release Note Scraper',
    category: 'later',
    description: 'Crawler that monitors Salesforce release notes and queues drafts for SME review.',
    status: 'deferred',
    targetRelease: 'v2.0'
  },
  {
    featureId: 'scope-15',
    name: 'Enterprise Team Analytics & Upskilling Dashboards',
    category: 'later',
    description: 'Manager views to monitor corporate IT team capability growth and skill gaps.',
    status: 'deferred',
    targetRelease: 'v2.0'
  }
];
