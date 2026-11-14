# BACKEND API CONTRACT SPECIFICATION

**Protocol:** HTTPS / RESTful JSON  
**Base URL:** `/api/v1` (Future Phase 2 Backend)  
**Standard Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`
- `X-Idempotency-Key: <UUID>` (for write endpoints)

---

## 1. Global Response Standards

### Success Envelope
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalCount": 142,
    "hasNextPage": true
  }
}
```

### Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "ERR_VALIDATION",
    "message": "Invalid experience level provided",
    "details": [
      { "field": "experienceLevel", "issue": "Must be one of fresher, 1-3_years, 3-5_years, 5+_years" }
    ],
    "requestId": "req_84bf10a3"
  }
}
```

---

## 2. API Endpoint Specifications

### 1. `GET /api/me`
- **Purpose:** Retrieves the current authenticated user's account, profile, streak, and preferences.
- **Auth / Role:** Required (`Learner`, `Reviewer`, `Admin`)
- **Query Params:** None
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "id": "usr_9912a",
      "email": "dev@example.com",
      "role": "learner",
      "profile": {
        "displayName": "Alex Rivera",
        "experienceLevel": "3-5_years",
        "primaryRole": "Salesforce Developer",
        "targetDailyMinutes": 5
      },
      "streak": {
        "currentStreak": 7,
        "longestStreak": 14,
        "freezesRemaining": 1
      }
    }
  }
  ```
- **Error Codes:** `401 Unauthorized`

---

### 2. `PATCH /api/me/preferences`
- **Purpose:** Updates target technology, daily minutes, or notification preferences.
- **Auth / Role:** Required (`Learner`, `Reviewer`, `Admin`)
- **Request Body:**
  ```json
  {
    "targetDailyMinutes": 10,
    "primaryTechnology": "Salesforce",
    "optOutAnalytics": false
  }
  ```
- **Validation Rules:**
  - `targetDailyMinutes` must be in `[2, 5, 10]`.
  - `primaryTechnology` must be a valid registered technology ID.
- **Response (`200 OK`):** Updated user profile object.
- **Error Codes:** `400 Validation Error`, `401 Unauthorized`

---

### 3. `GET /api/lessons`
- **Purpose:** Paginated search and filtering of published micro-learning lessons.
- **Auth / Role:** Optional (Public read access)
- **Query Params:**
  - `technology` (string, optional)
  - `topicId` (string, optional)
  - `query` (string, optional, debounced search)
  - `page` (integer, default 1)
  - `pageSize` (integer, default 20, max 50)
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "les_apex_dml_01",
        "topicId": "top_apex",
        "title": "Apex DML Bulkification Best Practices",
        "summary": "Master governor-limit-friendly record manipulation in loops.",
        "estimatedMinutes": 3,
        "releaseVersion": "Spring 24",
        "status": "published"
      }
    ],
    "meta": { "page": 1, "pageSize": 20, "totalCount": 85, "hasNextPage": true }
  }
  ```
- **Error Codes:** `400 Invalid Query Params`

---

### 4. `GET /api/lessons/:id`
- **Purpose:** Full lesson content including markdown, source citations, and associated MCQ.
- **Auth / Role:** Optional (Public read access)
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "id": "les_apex_dml_01",
      "title": "Apex DML Bulkification Best Practices",
      "contentMarkdown": "# Apex DML Bulkification...",
      "citations": [
        {
          "sourceName": "Salesforce Apex Developer Guide",
          "url": "https://developer.salesforce.com/docs/...",
          "status": "verified"
        }
      ],
      "mcq": {
        "id": "q_apex_01",
        "scenario": "You need to update 5,000 Contact records from an incoming webhook...",
        "question": "Which approach avoids governor limit System.LimitException: Too many DML statements?",
        "options": [
          { "id": "opt_a", "label": "Execute update contact inside the for-each loop." },
          { "id": "opt_b", "label": "Add modified contacts to a List<Contact> and update once outside loop." }
        ]
      }
    }
  }
  ```
- **Error Codes:** `404 Lesson Not Found`

---

### 5. `GET /api/learning/today`
- **Purpose:** Retrieves or computes the user's deterministic daily 3-activity learning journey.
- **Auth / Role:** Required (`Learner`, `Reviewer`, `Admin`)
- **Query Params:** `date` (YYYY-MM-DD, defaults to user's local date)
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "planDate": "2026-11-15",
      "isCompleted": false,
      "activities": [
        { "id": "les_apex_dml_01", "type": "concept", "estimatedMinutes": 3 },
        { "id": "q_apex_01", "type": "quiz", "estimatedMinutes": 2 },
        { "id": "top_flows_rev", "type": "revision", "estimatedMinutes": 2 }
      ]
    }
  }
  ```

---

### 6. `POST /api/learning/progress`
- **Purpose:** Records completion of an individual lesson or activity.
- **Auth / Role:** Required (`Learner`)
- **Idempotency:** Supported via `X-Idempotency-Key`
- **Request Body:**
  ```json
  {
    "lessonId": "les_apex_dml_01",
    "durationSeconds": 185,
    "status": "completed"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "lessonId": "les_apex_dml_01",
      "status": "completed",
      "completedAt": "2026-11-15T00:15:30Z",
      "streakUpdated": true,
      "currentStreak": 8
    }
  }
  ```

---

### 7. `POST /api/quiz/attempts`
- **Purpose:** Submits an answer for an MCQ question and returns instantaneous evaluation with explanations.
- **Auth / Role:** Required (`Learner`)
- **Request Body:**
  ```json
  {
    "questionId": "q_apex_01",
    "selectedOptionId": "opt_b"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "isCorrect": true,
      "correctOptionId": "opt_b",
      "explanation": "Bulkifying collections outside the loop ensures 1 DML call is consumed instead of N.",
      "spacedRepetitionInterval": 3
    }
  }
  ```

---

### 8. `GET /api/revision`
- **Purpose:** Fetches spaced repetition items due for review according to SuperMemo-2 scheduling.
- **Auth / Role:** Required (`Learner`)
- **Response (`200 OK`):** Array of due topics with ease factors and repetition counts.

---

### 9. `GET /api/assessments`
- **Purpose:** Lists available diagnostic exams (Quick Diagnostic, Topic Assessment, Comprehensive Skill Check).
- **Auth / Role:** Required (`Learner`, `Reviewer`, `Admin`)
- **Response (`200 OK`):** List of assessment configurations and past attempt scores.

---

### 10. `POST /api/assessments/:id/attempts`
- **Purpose:** Submits complete assessment answer sheet, computes score percentage, generates skill gap report, and creates personalized 7-day improvement plan.
- **Auth / Role:** Required (`Learner`)
- **Request Body:**
  ```json
  {
    "durationSeconds": 480,
    "answers": {
      "q_apex_101": "opt_c",
      "q_admin_202": "opt_a"
    }
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "success": true,
    "data": {
      "attemptId": "att_88f910a",
      "scorePercentage": 85,
      "levelAchieved": "Proficient",
      "gapReport": {
        "strongTopics": ["Apex DML", "SOQL Limits"],
        "criticalGaps": ["LWC Wire Service"]
      },
      "improvementPlanId": "plan_910b2"
    }
  }
  ```

---

### 11. `GET /api/analytics/summary`
- **Purpose:** Aggregates privacy-safe learning metrics (DAU, streak health, topic drop-offs).
- **Auth / Role:** Required (`Admin`)
- **Response (`200 OK`):** Funnel conversion ratios, cohort retention, and system error rates.
- **Error Codes:** `403 Forbidden` (non-admins)

---

### 12. `GET /api/admin/content`
- **Purpose:** SME content review backlog for AI-generated drafts.
- **Auth / Role:** Required (`Reviewer`, `Admin`)
- **Response (`200 OK`):** List of unreviewed drafts with automated verification risk scores.

---

### 13. `POST /api/admin/content/:id/review`
- **Purpose:** Records SME approval or rejection with editorial feedback.
- **Auth / Role:** Required (`Reviewer`, `Admin`)
- **Request Body:**
  ```json
  {
    "decision": "approved",
    "feedback": "Technical citations match Spring 24 release notes perfectly."
  }
  ```
- **Response (`200 OK`):** Status transitioned to `verified` or `published`.
- **Error Codes:** `403 Forbidden`, `404 Draft Not Found`
