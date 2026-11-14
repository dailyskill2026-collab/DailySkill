# SPRINT 15 — FINAL MOCK MVP REVIEW, PRODUCTION ARCHITECTURE & INTEGRATION ROADMAP

**Document Version:** 1.0.0  
**Status:** Completed & Approved Architecture Blueprint  
**Target Startup Budget:** ₹50,000 – ₹1,00,000 ($600 – $1,200 USD)  
**Primary Stack:** React 18, TypeScript 5, Vite 5, Tailwind CSS, Vitest  

---

## 1. Executive Summary & MVP Status

The *IT Daily Upskilling App* has successfully reached 100% completion across all 15 planned mock sprints (Sprints 1 through 15). The application operates with zero external cloud dependencies, zero external network calls, and zero external costs incurred, strictly preserving 100% of the ₹50,000–₹1,00,000 startup capital.

### Milestone Verification Matrix
| Dimension | Specification | Actual Result | Verification Status |
| :--- | :--- | :--- | :--- |
| **Total Features Audited** | 21 Functional Capabilities | 21 / 21 Fully Implemented | PASS (100%) |
| **Automated Test Coverage** | $\ge 150$ Unit & Integration Tests | 161 Tests across 11 Test Suites | PASS (100% Passing) |
| **Production Build** | Vite production bundle | 1.74s build time, clean chunks | PASS (Clean Build) |
| **Network Isolation** | 100% Mock / Local Mode | Zero cloud API calls, 0 network egress | PASS (Isolated) |
| **Financial Health** | ₹50,000–₹1,00,000 Budget | ₹0 spent to date, 100% capital intact | PASS (Optimal) |

---

## 2. Comprehensive MVP Feature Audit (21 Areas)

1. **User Profile & Onboarding:** Experience levels (Fresher, 1-3y, 3-5y, 5+y), primary role, notification preferences, learning schedule.
2. **Daily Micro-Learning Journey:** 2–5 min bite-sized modules, collapsible cards, key takeaways, source citations, deep dive links.
3. **Adaptive Scenario MCQs:** Real-world enterprise scenarios, instant feedback, inline explanations, source documentation references.
4. **Streak & Habit Tracking:** Consecutive daily streaks, streak freeze logic, milestone badges, motivation banners.
5. **Spaced Repetition & Revision:** SuperMemo-2 / Leitner hybrid queue, decay scoring, targeted review intervals.
6. **Weak Topic Diagnosis:** Automatic mistake clustering, error frequency weighting, remedial concept suggestions.
7. **Explore & Discovery Feed:** Technology filters (Salesforce Admin, Dev, Architect), search with debounce, release tagging.
8. **Multi-Source Scraping Engine (Mock):** Salesforce Release Notes, Developer Blogs, Trailhead RSS feeds simulation.
9. **AI Content Generation Pipeline (Mock):** Structured prompt contracts, markdown extraction, MCQ generation with deterministic seeds.
10. **Dual-Gate Verification Pipeline:** Algorithmic verification (10 validation rules), risk scoring, human reviewer triage queue.
11. **Admin Approval & Staging Workflow:** Side-by-side markdown comparison, inline diffs, reject with rationale, scheduled publish.
12. **Content Versioning & Release Tracking:** Version tagging (Spring '24, Summer '24, Winter '25), historical change logs.
13. **Plagiarism & Duplicate Detection:** 3-gram Jaccard similarity index, threshold matching, conflict warning.
14. **Repository Pattern & Data Abstraction:** Clean `IRepository<T>` interfaces decoupling UI from storage backends.
15. **Smart Recommendation Engine:** Content affinity scoring based on user role, past errors, and release updates.
16. **AI Learning Assistant (Mock):** Grounded question matching against verified knowledge corpus, hallucination prevention fallbacks.
17. **Doubt History & Resolution:** Persistent conversation memory, bookmarking, related concept suggestions.
18. **Skill Assessments & Diagnostic Exams:** Timed multi-question exams, topic-level scoring, domain benchmarking.
19. **Skill Gap Analysis & Roadmaps:** Radar chart gap visualization, personalized 7-day remedial improvement plans.
20. **Product Feedback & Telemetry:** In-app bug/feature reporting, privacy-first local analytics, funnel drop-off analytics.
21. **Beta Testing Simulation:** Deterministic 1,000-user synthetic traffic simulation, load benchmarking under 50ms.

---

## 3. Backend Architecture Comparison: Firebase vs. Aiven PostgreSQL

```
+------------------------------------+---------------------------------------+
| Criterion                          | Option A: Firebase (Auth + Firestore) | Option B: Aiven PostgreSQL + API      |
+------------------------------------+---------------------------------------+
| Development Velocity (Weeks)       | 1-2 Weeks (Rapid Launch)              | 3-4 Weeks (Server setup required)     |
| Relational Integrity (27 Entities) | 3/5 (Denormalized, manual joins)      | 5/5 (Native Foreign Keys, ACID)       |
| Vector Embeddings (RAG Search)     | 2/5 (Requires external vector DB)     | 5/5 (Native pgvector extension)       |
| Complex Analytics & SQL Reporting  | 2/5 (Requires BigQuery export)        | 5/5 (Rich SQL, window functions)      |
| Free Tier & Low Scale Cost         | 5/5 (Free up to 50k reads/day)        | 3/5 ($10 - $19/month base instance)   |
| Vendor Lock-in                     | High (Proprietary Google SDK)         | Zero (Open-source standard SQL)       |
| Weighted Score (Out of 5.0)        | 3.60 / 5.00                           | 4.10 / 5.00                           |
+------------------------------------+---------------------------------------+
```

### Recommendation: Phased Evolution
- **Phase 1 (Private Beta, 50–200 users):** Deploy on **Firebase Auth + Firestore**. The existing dual-mode repository layer (`src/repositories/firebase/`) built in Sprint 9 enables instantaneous activation with zero cloud server overhead.
- **Phase 2 (Public Launch & Scaling, 1,000–10,000 users):** Transition persistence to **Aiven PostgreSQL + Prisma ORM + pgvector**. Because React UI components interact strictly with `IRepository<T>`, swapping from Firestore to PostgreSQL REST/tRPC endpoints requires zero changes to frontend code.

---

## 4. Production Logical Database Schema (27 Core Entities)

```
[Users] 1 -- * [LearningProfiles]
   |
   +-- 1 -- * [DailyProgress] -- * [ProgressDetails]
   |
   +-- 1 -- * [QuizAttempts]
   |
   +-- 1 -- * [Assessments] -- * [AssessmentQuestions]
   |                              |
   |                              +-- * [AssessmentSubmissions]
   +-- 1 -- * [ImprovementPlans]
   |
   +-- 1 -- * [DoubtQueries] -- * [DoubtMessages]
   |
   +-- 1 -- * [UserFeedback]
   |
   +-- 1 -- * [UserStreaks]
   |
   +-- 1 -- * [UserAchievements]

[ContentSources] 1 -- * [IngestionBatches] -- * [RawContentItems]
                                                      |
                                                      +-- 1 -- 1 [StagedDrafts]
                                                                     |
                                                                     +-- 1 -- 1 [ContentVerificationAudits]
                                                                     |
                                                                     +-- 1 -- 1 [PublishedConcepts]
                                                                                    |
                                                                                    +-- 1 -- * [ConceptMCQs]
                                                                                    |
                                                                                    +-- 1 -- * [ConceptRevisions]
                                                                                    |
                                                                                    +-- 1 -- * [KnowledgeBaseChunks] (Vector)
```

---

## 5. Security & Role-Based Access Control (RBAC)

### User Role Matrix
| Role | Public Content | Daily Journey & Quizzes | Assistant & Doubts | Review Backlog | Publishing Controls | User Management |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Guest** | Read | Read (Preview) | Denied | Denied | Denied | Denied |
| **Learner** | Read | Read / Write | Read / Write | Denied | Denied | Denied |
| **Reviewer** | Read | Read / Write | Read / Write | Read / Triage | Edit Drafts | Denied |
| **Admin** | Read | Read / Write | Read / Write | Full Access | Full Access | Full Access |

---

## 6. AI Content & Assistant Architecture

### AI Content Generation (Backend Pipeline)
- **Model:** Google Gemini 1.5 Flash (via Gemini API)
- **Schedule:** Automated cron job (Weekly or Bi-weekly release scrape)
- **Prompt Guardrails:** JSON schema output enforcement, citation verification, temperature 0.2.
- **Human-in-the-Loop:** All AI generated drafts pass through `ContentVerificationService` before entering reviewer triage. No unreviewed AI output ever reaches production users.

### AI Learning Assistant (RAG Engine)
```
User Query ---> Input Sanitation ---> Vector Similarity Search (pgvector / verified knowledge chunks)
                                               |
                                     Relevance Score >= 0.78?
                                    /                        \
                                  YES                         NO
                                  /                             \
     Construct Prompt with Grounded Context           Trigger Fallback Handler
     Model: Gemini 1.5 Flash (Temp: 0.1)             "I can only answer questions
     Include citations & deep links                   related to verified lessons."
                                  \                             /
                                   +---------> Audit Log <-----+
                                                    |
                                          Response to User
```

---

## 7. Financial & Infrastructure Projections (INR)

| Metric | Scenario A (100 Beta Users) | Scenario B (1,000 Active Users) | Scenario C (10,000 Scaling Users) |
| :--- | :--- | :--- | :--- |
| **Frontend CDN** | Vercel Free Tier (₹0) | Vercel Pro ($20 = ₹1,700/mo) | Vercel Pro + Bandwidth (₹5,100/mo) |
| **Database** | Firebase Spark Free (₹0) | Cloud Managed DB (₹850/mo) | Aiven PostgreSQL (₹4,250/mo) |
| **AI Content Gen** | ₹150 / month | ₹250 / month | ₹600 / month |
| **AI Assistant RAG** | ₹100 / month | ₹250 / month (with caching) | ₹800 / month (75% cache hit) |
| **Monthly Total** | **₹250 / month** | **₹3,050 / month** | **₹10,750 / month** |
| **Annual Total** | **₹3,000 / year** | **₹36,600 / year** | **₹1,29,000 / year** |
| **Budget Compliance**| **100% within ₹1L budget** | **100% within ₹1L budget** | **Self-funding via revenue** |

---

## 8. Sprints 16–22 Implementation Roadmap

1. **Sprint 16: Authentication & Cloud Identity:** Firebase Auth integration, Google OAuth sign-in, Guest-to-Learner account conversion.
2. **Sprint 17: Cloud Persistence Integration:** Connect live cloud Firestore/PostgreSQL, execute data migration script, test offline synch.
3. **Sprint 18: Live AI Pipeline & Grounded RAG:** Connect real Gemini 1.5 Flash API with server-side proxy gateway, prompt cache.
4. **Sprint 19: Private Beta Program (20–50 Users):** Deploy private staging on Vercel, onboard Salesforce community beta testers, collect telemetry.
5. **Sprint 20: Performance Tuning & PWA Hardening:** Lighthouse 95+ score optimization, offline caching, push notification reminders.
6. **Sprint 21: Monetization & B2B Team Pilots:** Freemium daily learning limit (3 concepts/day free), team analytics dashboard.
7. **Sprint 22: Public Launch & Multi-Technology Expansion:** Launch on Product Hunt / LinkedIn, expand to Java and AWS content tracks.
