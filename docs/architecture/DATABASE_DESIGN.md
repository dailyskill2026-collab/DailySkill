# DATABASE DOMAIN MODEL & ENTITY RELATIONSHIP SPECIFICATION

**Document Version:** 1.0.0  
**Status:** Approved for Sprint 16  
**Scope:** Production Logical Database Schema (27 Core Entities across 7 Domains)

---

## 1. Domain Model Overview

The domain model is structured into 7 cohesive functional modules:
1. **Identity & Access Management (4 Entities)**
2. **Content & Knowledge Ingestion (8 Entities)**
3. **Daily Learning, Quizzes & Spaced Repetition (6 Entities)**
4. **Skill Assessments & Gap Analysis (5 Entities)**
5. **Engagement, Gamification & Assistant (4 Entities)**
6. **Administration, Verification & Auditing (3 Entities)**

---

## 2. Detailed Entity Specifications (27 Entities)

### Module 1: Identity & Access Management

#### 1. `users`
- **Purpose:** Core identity record tracking account credentials, role, and verification status.
- **Fields:**
  - `id`: `UUID` (Primary Key, generated via `uuid_generate_v4()`)
  - `email`: `VARCHAR(255)` (NOT NULL, UNIQUE)
  - `role`: `ENUM('guest', 'learner', 'reviewer', 'admin')` (NOT NULL, DEFAULT 'learner')
  - `is_email_verified`: `BOOLEAN` (NOT NULL, DEFAULT FALSE)
  - `created_at`: `TIMESTAMPTZ` (NOT NULL, DEFAULT NOW())
  - `updated_at`: `TIMESTAMPTZ` (NOT NULL, DEFAULT NOW())
- **Constraints & Indexes:** `UNIQUE(email)`, Index on `(role)`
- **Retention:** Permanent until user initiates account deletion (GDPR/Right-to-be-Forgotten).

#### 2. `user_profiles`
- **Purpose:** Professional learning profile, target technology, and daily duration goal.
- **Fields:**
  - `user_id`: `UUID` (Primary Key, Foreign Key -> `users.id` ON DELETE CASCADE)
  - `display_name`: `VARCHAR(100)` (NOT NULL)
  - `experience_level`: `ENUM('fresher', '1-3_years', '3-5_years', '5+_years')` (NOT NULL)
  - `primary_role`: `VARCHAR(100)` (NOT NULL, e.g. "Salesforce Developer", "Admin", "Architect")
  - `target_daily_minutes`: `INTEGER` (NOT NULL, DEFAULT 5, CHECK `target_daily_minutes IN (2, 5, 10)`)
  - `created_at`: `TIMESTAMPTZ` (NOT NULL, DEFAULT NOW())
  - `updated_at`: `TIMESTAMPTZ` (NOT NULL, DEFAULT NOW())

#### 3. `user_preferences`
- **Purpose:** Granular learning preferences, notification schedules, and privacy controls.
- **Fields:**
  - `user_id`: `UUID` (Primary Key, Foreign Key -> `users.id` ON DELETE CASCADE)
  - `primary_technology`: `VARCHAR(50)` (NOT NULL, DEFAULT 'Salesforce')
  - `selected_topic_ids`: `TEXT[]` (NOT NULL, DEFAULT '{}')
  - `notification_time`: `TIME` (NULLABLE)
  - `opt_out_analytics`: `BOOLEAN` (NOT NULL, DEFAULT FALSE)
  - `theme_preference`: `ENUM('light', 'dark', 'system')` (NOT NULL, DEFAULT 'system')
  - `updated_at`: `TIMESTAMPTZ` (NOT NULL, DEFAULT NOW())

#### 4. `user_roles`
- **Purpose:** Audit history of privileged role assignments and administrative grants.
- **Fields:**
  - `id`: `UUID` (Primary Key)
  - `user_id`: `UUID` (NOT NULL, Foreign Key -> `users.id` ON DELETE CASCADE)
  - `role`: `VARCHAR(50)` (NOT NULL)
  - `granted_by`: `UUID` (NULLABLE, Foreign Key -> `users.id` ON DELETE SET NULL)
  - `granted_at`: `TIMESTAMPTZ` (NOT NULL, DEFAULT NOW())
- **Indexes:** Index on `(user_id, role)`

---

### Module 2: Content & Knowledge Ingestion

#### 5. `technologies`
- **Purpose:** Top-level technology tracks (Salesforce, Java, AWS, Python, DevOps).
- **Fields:**
  - `id`: `VARCHAR(50)` (Primary Key, e.g. 'salesforce')
  - `name`: `VARCHAR(100)` (NOT NULL)
  - `description`: `TEXT` (NOT NULL)
  - `is_active`: `BOOLEAN` (NOT NULL, DEFAULT TRUE)
  - `created_at`: `TIMESTAMPTZ` (NOT NULL, DEFAULT NOW())

#### 6. `topics`
- **Purpose:** Technical topic domains within a technology (e.g. Apex DML, Flow Automation, LWC).
- **Fields:**
  - `id`: `VARCHAR(100)` (Primary Key)
  - `technology_id`: `VARCHAR(50)` (NOT NULL, Foreign Key -> `technologies.id` ON DELETE RESTRICT)
  - `title`: `VARCHAR(150)` (NOT NULL)
  - `difficulty`: `ENUM('beginner', 'intermediate', 'advanced')` (NOT NULL)
  - `created_at`: `TIMESTAMPTZ` (NOT NULL, DEFAULT NOW())
- **Indexes:** Index on `(technology_id)`

#### 7. `learning_paths`
- **Purpose:** Curated progressive roadmaps guiding learners through structured lesson sequences.
- **Fields:**
  - `id`: `VARCHAR(100)` (Primary Key)
  - `technology_id`: `VARCHAR(50)` (NOT NULL, Foreign Key -> `technologies.id`)
  - `title`: `VARCHAR(150)` (NOT NULL)
  - `ordered_lesson_ids`: `TEXT[]` (NOT NULL)
  - `target_role`: `VARCHAR(100)` (NOT NULL)
  - `created_at`: `TIMESTAMPTZ` (NOT NULL, DEFAULT NOW())

#### 8. `lessons`
- **Purpose:** Bite-sized micro-learning units (2–5 minutes) containing core concepts and takeaways.
- **Fields:**
  - `id`: `VARCHAR(100)` (Primary Key)
  - `topic_id`: `VARCHAR(100)` (NOT NULL, Foreign Key -> `topics.id` ON DELETE RESTRICT)
  - `title`: `VARCHAR(200)` (NOT NULL)
  - `summary`: `TEXT` (NOT NULL)
  - `content_markdown`: `TEXT` (NOT NULL)
  - `estimated_minutes`: `INTEGER` (NOT NULL, CHECK `estimated_minutes BETWEEN 1 AND 15`)
  - `release_version`: `VARCHAR(50)` (NULLABLE, e.g. 'Spring 24')
  - `status`: `ENUM('draft', 'staged', 'verified', 'published', 'archived')` (NOT NULL, DEFAULT 'draft')
  - `published_at`: `TIMESTAMPTZ` (NULLABLE)
  - `created_at`: `TIMESTAMPTZ` (NOT NULL, DEFAULT NOW())
- **Indexes:** Index on `(topic_id, status)`, Index on `(status, published_at)`

#### 9. `source_documents`
- **Purpose:** Raw technical documents scraped from official feeds (Salesforce Release Notes, Blogs).
- **Fields:**
  - `id`: `VARCHAR(100)` (Primary Key)
  - `source_name`: `VARCHAR(100)` (NOT NULL)
  - `source_url`: `VARCHAR(500)` (NOT NULL)
  - `scraped_at`: `TIMESTAMPTZ` (NOT NULL, DEFAULT NOW())
  - `raw_content`: `TEXT` (NOT NULL)
  - `checksum`: `VARCHAR(64)` (NOT NULL)

#### 10. `evidence_references`
- **Purpose:** Links lessons to verified source citations to eliminate hallucinations.
- **Fields:**
  - `id`: `UUID` (Primary Key)
  - `lesson_id`: `VARCHAR(100)` (NOT NULL, Foreign Key -> `lessons.id` ON DELETE CASCADE)
  - `source_id`: `VARCHAR(100)` (NOT NULL, Foreign Key -> `source_documents.id` ON DELETE RESTRICT)
  - `citation_quote`: `TEXT` (NOT NULL)
  - `verification_status`: `ENUM('verified', 'sample', 'flagged')` (NOT NULL, DEFAULT 'verified')
  - `created_at`: `TIMESTAMPTZ` (NOT NULL, DEFAULT NOW())

#### 11. `content_versions`
- **Purpose:** Historical version tracking for published lessons.
- **Fields:**
  - `id`: `UUID` (Primary Key)
  - `lesson_id`: `VARCHAR(100)` (NOT NULL, Foreign Key -> `lessons.id` ON DELETE CASCADE)
  - `version_tag`: `VARCHAR(50)` (NOT NULL)
  - `changelog`: `TEXT` (NOT NULL)
  - `content_snapshot`: `JSONB` (NOT NULL)
  - `created_at`: `TIMESTAMPTZ` (NOT NULL, DEFAULT NOW())

#### 12. `mcq_questions`
- **Purpose:** Real-world enterprise scenario multiple-choice questions linked to lessons.
- **Fields:**
  - `id`: `VARCHAR(100)` (Primary Key)
  - `lesson_id`: `VARCHAR(100)` (NOT NULL, Foreign Key -> `lessons.id` ON DELETE CASCADE)
  - `scenario`: `TEXT` (NOT NULL)
  - `question`: `TEXT` (NOT NULL)
  - `options_json`: `JSONB` (NOT NULL, Array of `{ id: string, label: string }`)
  - `correct_answer_id`: `VARCHAR(50)` (NOT NULL)
  - `explanation`: `TEXT` (NOT NULL)
  - `difficulty`: `ENUM('easy', 'medium', 'hard')` (NOT NULL, DEFAULT 'medium')
- **Indexes:** Index on `(lesson_id)`

---

### Module 3: Daily Learning, Quizzes & Spaced Repetition

#### 13. `daily_learning_plans`
- **Purpose:** Deterministic daily micro-learning bundle tailored to user preferences and schedule.
- **Fields:**
  - `id`: `VARCHAR(100)` (Primary Key)
  - `user_id`: `UUID` (NOT NULL, Foreign Key -> `users.id` ON DELETE CASCADE)
  - `plan_date`: `DATE` (NOT NULL)
  - `activity_ids`: `TEXT[]` (NOT NULL)
  - `is_completed`: `BOOLEAN` (NOT NULL, DEFAULT FALSE)
  - `created_at`: `TIMESTAMPTZ` (NOT NULL, DEFAULT NOW())
- **Constraints:** `UNIQUE(user_id, plan_date)`

#### 14. `learning_sessions`
- **Purpose:** Active time spent on lessons for engagement analytics.
- **Fields:**
  - `id`: `UUID` (Primary Key)
  - `user_id`: `UUID` (NOT NULL, Foreign Key -> `users.id` ON DELETE CASCADE)
  - `lesson_id`: `VARCHAR(100)` (NOT NULL, Foreign Key -> `lessons.id` ON DELETE CASCADE)
  - `duration_seconds`: `INTEGER` (NOT NULL, CHECK `duration_seconds >= 0`)
  - `started_at`: `TIMESTAMPTZ` (NOT NULL)
  - `completed_at`: `TIMESTAMPTZ` (NOT NULL)

#### 15. `learning_progress`
- **Purpose:** Aggregate completion state per user per lesson.
- **Fields:**
  - `id`: `UUID` (Primary Key)
  - `user_id`: `UUID` (NOT NULL, Foreign Key -> `users.id` ON DELETE CASCADE)
  - `lesson_id`: `VARCHAR(100)` (NOT NULL, Foreign Key -> `lessons.id` ON DELETE CASCADE)
  - `status`: `ENUM('not_started', 'in_progress', 'completed')` (NOT NULL, DEFAULT 'not_started')
  - `completed_at`: `TIMESTAMPTZ` (NULLABLE)
  - `last_accessed_at`: `TIMESTAMPTZ` (NOT NULL, DEFAULT NOW())
- **Constraints:** `UNIQUE(user_id, lesson_id)`

#### 16. `quiz_attempts`
- **Purpose:** Granular history of MCQ submissions for weak topic detection.
- **Fields:**
  - `id`: `UUID` (Primary Key)
  - `user_id`: `UUID` (NOT NULL, Foreign Key -> `users.id` ON DELETE CASCADE)
  - `question_id`: `VARCHAR(100)` (NOT NULL, Foreign Key -> `mcq_questions.id` ON DELETE CASCADE)
  - `selected_option_id`: `VARCHAR(50)` (NOT NULL)
  - `is_correct`: `BOOLEAN` (NOT NULL)
  - `attempted_at`: `TIMESTAMPTZ` (NOT NULL, DEFAULT NOW())
- **Indexes:** Index on `(user_id, is_correct)`, Index on `(question_id)`

#### 17. `revision_schedules`
- **Purpose:** SuperMemo-2 / Leitner spaced repetition review schedules.
- **Fields:**
  - `id`: `UUID` (Primary Key)
  - `user_id`: `UUID` (NOT NULL, Foreign Key -> `users.id` ON DELETE CASCADE)
  - `topic_id`: `VARCHAR(100)` (NOT NULL, Foreign Key -> `topics.id` ON DELETE CASCADE)
  - `repetition_count`: `INTEGER` (NOT NULL, DEFAULT 0)
  - `ease_factor`: `FLOAT` (NOT NULL, DEFAULT 2.5)
  - `interval_days`: `INTEGER` (NOT NULL, DEFAULT 1)
  - `next_review_date`: `DATE` (NOT NULL)
  - `updated_at`: `TIMESTAMPTZ` (NOT NULL, DEFAULT NOW())
- **Constraints:** `UNIQUE(user_id, topic_id)`
- **Indexes:** Index on `(user_id, next_review_date)`

#### 18. `bookmarks`
- **Purpose:** User-saved lessons for rapid reference.
- **Fields:**
  - `user_id`: `UUID` (NOT NULL, Foreign Key -> `users.id` ON DELETE CASCADE)
  - `lesson_id`: `VARCHAR(100)` (NOT NULL, Foreign Key -> `lessons.id` ON DELETE CASCADE)
  - `created_at`: `TIMESTAMPTZ` (NOT NULL, DEFAULT NOW())
- **Constraints:** `PRIMARY KEY (user_id, lesson_id)`

---

### Module 4: Skill Assessments & Gap Analysis

#### 19. `assessments`
- **Purpose:** Diagnostic skill evaluations (Quick Diagnostic, Topic Assessment, Comprehensive Skill Check).
- **Fields:**
  - `id`: `VARCHAR(100)` (Primary Key)
  - `technology_id`: `VARCHAR(50)` (NOT NULL, Foreign Key -> `technologies.id`)
  - `type`: `ENUM('quick', 'topic', 'skill_check')` (NOT NULL)
  - `title`: `VARCHAR(200)` (NOT NULL)
  - `duration_minutes`: `INTEGER` (NOT NULL)
  - `created_at`: `TIMESTAMPTZ` (NOT NULL, DEFAULT NOW())

#### 20. `assessment_questions`
- **Purpose:** Question pool specialized for timed assessments.
- **Fields:**
  - `id`: `VARCHAR(100)` (Primary Key)
  - `assessment_id`: `VARCHAR(100)` (NOT NULL, Foreign Key -> `assessments.id` ON DELETE CASCADE)
  - `category`: `VARCHAR(50)` (NOT NULL, e.g. 'apex', 'admin', 'lwc')
  - `question_data`: `JSONB` (NOT NULL)
- **Indexes:** Index on `(assessment_id, category)`

#### 21. `assessment_attempts`
- **Purpose:** Completed assessment sessions with aggregate scores.
- **Fields:**
  - `id`: `VARCHAR(100)` (Primary Key)
  - `user_id`: `UUID` (NOT NULL, Foreign Key -> `users.id` ON DELETE CASCADE)
  - `assessment_id`: `VARCHAR(100)` (NOT NULL, Foreign Key -> `assessments.id` ON DELETE CASCADE)
  - `score_percentage`: `INTEGER` (NOT NULL)
  - `level_achieved`: `VARCHAR(50)` (NOT NULL)
  - `duration_seconds`: `INTEGER` (NOT NULL)
  - `started_at`: `TIMESTAMPTZ` (NOT NULL)
  - `completed_at`: `TIMESTAMPTZ` (NOT NULL)
- **Indexes:** Index on `(user_id, completed_at)`

#### 22. `skill_gap_reports`
- **Purpose:** Diagnostic breakdown of strengths and critical knowledge gaps.
- **Fields:**
  - `attempt_id`: `VARCHAR(100)` (Primary Key, Foreign Key -> `assessment_attempts.id` ON DELETE CASCADE)
  - `user_id`: `UUID` (NOT NULL, Foreign Key -> `users.id` ON DELETE CASCADE)
  - `strong_topics`: `TEXT[]` (NOT NULL, DEFAULT '{}')
  - `developing_topics`: `TEXT[]` (NOT NULL, DEFAULT '{}')
  - `critical_gaps`: `TEXT[]` (NOT NULL, DEFAULT '{}')
  - `created_at`: `TIMESTAMPTZ` (NOT NULL, DEFAULT NOW())

#### 23. `improvement_plans`
- **Purpose:** Structured 7-day personalized remedial schedule addressing identified gaps.
- **Fields:**
  - `id`: `VARCHAR(100)` (Primary Key)
  - `user_id`: `UUID` (NOT NULL, Foreign Key -> `users.id` ON DELETE CASCADE)
  - `attempt_id`: `VARCHAR(100)` (NOT NULL, Foreign Key -> `assessment_attempts.id` ON DELETE CASCADE)
  - `target_category`: `VARCHAR(50)` (NOT NULL)
  - `schedule_json`: `JSONB` (NOT NULL)
  - `status`: `ENUM('active', 'completed', 'abandoned')` (NOT NULL, DEFAULT 'active')
  - `created_at`: `TIMESTAMPTZ` (NOT NULL, DEFAULT NOW())

---

### Module 5: Engagement, Gamification & Assistant

#### 24. `user_streaks`
- **Purpose:** Tracks consecutive daily learning habits, longest records, and streak freezes.
- **Fields:**
  - `user_id`: `UUID` (Primary Key, Foreign Key -> `users.id` ON DELETE CASCADE)
  - `current_streak`: `INTEGER` (NOT NULL, DEFAULT 0)
  - `longest_streak`: `INTEGER` (NOT NULL, DEFAULT 0)
  - `freezes_remaining`: `INTEGER` (NOT NULL, DEFAULT 1)
  - `last_active_date`: `DATE` (NULLABLE)
  - `updated_at`: `TIMESTAMPTZ` (NOT NULL, DEFAULT NOW())

#### 25. `user_achievements`
- **Purpose:** Gamification badges unlocked upon completing milestones.
- **Fields:**
  - `id`: `UUID` (Primary Key)
  - `user_id`: `UUID` (NOT NULL, Foreign Key -> `users.id` ON DELETE CASCADE)
  - `badge_id`: `VARCHAR(100)` (NOT NULL)
  - `unlocked_at`: `TIMESTAMPTZ` (NOT NULL, DEFAULT NOW())
- **Constraints:** `UNIQUE(user_id, badge_id)`

#### 26. `assistant_conversations`
- **Purpose:** Threaded history of learner queries and doubt resolutions.
- **Fields:**
  - `id`: `VARCHAR(100)` (Primary Key)
  - `user_id`: `UUID` (NOT NULL, Foreign Key -> `users.id` ON DELETE CASCADE)
  - `topic_id`: `VARCHAR(100)` (NULLABLE, Foreign Key -> `topics.id` ON DELETE SET NULL)
  - `question_text`: `TEXT` (NOT NULL)
  - `answer_text`: `TEXT` (NOT NULL)
  - `explanation_style`: `ENUM('simple', 'real_world', 'interview')` (NOT NULL)
  - `citations_json`: `JSONB` (NOT NULL)
  - `created_at`: `TIMESTAMPTZ` (NOT NULL, DEFAULT NOW())
- **Indexes:** Index on `(user_id, created_at)`

#### 27. `knowledge_entries`
- **Purpose:** Verified knowledge base chunks with vector embeddings for AI RAG search.
- **Fields:**
  - `id`: `VARCHAR(100)` (Primary Key)
  - `topic_id`: `VARCHAR(100)` (NOT NULL, Foreign Key -> `topics.id` ON DELETE CASCADE)
  - `canonical_question`: `TEXT` (NOT NULL)
  - `simple_explanation`: `TEXT` (NOT NULL)
  - `real_world_scenario`: `JSONB` (NOT NULL)
  - `interview_answer`: `TEXT` (NOT NULL)
  - `source_citation`: `JSONB` (NOT NULL)
  - `embedding_vector`: `VECTOR(1536)` (NULLABLE in Phase 1, active in Phase 2 with pgvector)
  - `version`: `VARCHAR(50)` (NOT NULL)
  - `created_at`: `TIMESTAMPTZ` (NOT NULL, DEFAULT NOW())
- **Indexes:** HNSW / IVFFlat vector index on `(embedding_vector)` in Phase 2.

---

### Module 6 & 7: Administration, Reviews & Auditing

#### 28. `admin_reviews`
- **Purpose:** Editorial triage log recording SME approvals, rejections, and feedback on AI drafts.
- **Fields:**
  - `id`: `UUID` (Primary Key)
  - `lesson_id`: `VARCHAR(100)` (NOT NULL, Foreign Key -> `lessons.id` ON DELETE CASCADE)
  - `reviewer_id`: `UUID` (NOT NULL, Foreign Key -> `users.id` ON DELETE RESTRICT)
  - `decision`: `ENUM('approved', 'rejected', 'changes_requested')` (NOT NULL)
  - `feedback`: `TEXT` (NULLABLE)
  - `reviewed_at`: `TIMESTAMPTZ` (NOT NULL, DEFAULT NOW())

#### 29. `audit_logs`
- **Purpose:** Tamper-evident system activity and security auditing.
- **Fields:**
  - `id`: `UUID` (Primary Key)
  - `actor_id`: `UUID` (NULLABLE, Foreign Key -> `users.id` ON DELETE SET NULL)
  - `action`: `VARCHAR(100)` (NOT NULL)
  - `resource_type`: `VARCHAR(50)` (NOT NULL)
  - `resource_id`: `VARCHAR(100)` (NOT NULL)
  - `payload_snapshot`: `JSONB` (NULLABLE)
  - `ip_address`: `INET` (NULLABLE)
  - `created_at`: `TIMESTAMPTZ` (NOT NULL, DEFAULT NOW())
- **Indexes:** Index on `(action, created_at)`, Index on `(actor_id)`

---

## 3. Entity Relationship Diagram (ERD)

```
                         +-----------------------+
                         |        users          |
                         +-----------------------+
                                  | 1
           +----------------------+----------------------+-----------------------+
           | 1                    | 1                    | 1                     | 1
+---------------------+  +---------------------+  +---------------------+  +---------------------+
|    user_profiles    |  |  user_preferences   |  |     user_streaks    |  |     user_roles      |
+---------------------+  +---------------------+  +---------------------+  +---------------------+
                                  | 1
           +----------------------+----------------------+-----------------------+
           | 1                                           | 1                     | 1
+---------------------+                         +---------------------+  +---------------------+
| daily_learning_plans|                         |  learning_progress  |  | assessment_attempts |
+---------------------+                         +---------------------+  +---------------------+
                                                           | *                     | 1
                                                           | 1                     +--------+
                                                +---------------------+                     | 1
                                                |       lessons       |            +-------------------+
                                                +---------------------+            | skill_gap_reports |
                                                           | 1                     +-------------------+
                                       +-------------------+-------------------+
                                       | 1                                     | 1
                            +---------------------+                 +---------------------+
                            |    mcq_questions    |                 | evidence_references |
                            +---------------------+                 +---------------------+
                                       | 1                                     | *
                            +---------------------+                 +---------------------+
                            |    quiz_attempts    |                 |  source_documents   |
                            +---------------------+                 +---------------------+
```

---

## 4. Referential Integrity & Migration Guardrails
- **Cascade Deletions:** All personal learning data (`user_profiles`, `user_preferences`, `learning_progress`, `quiz_attempts`, `user_streaks`) cascade delete when a user is purged, adhering to global privacy mandates.
- **Restrict Deletions:** Content entities (`topics`, `technologies`, `lessons`) utilize `RESTRICT` on delete to protect integrity against orphaned student progress.
