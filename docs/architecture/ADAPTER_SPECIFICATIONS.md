# BACKEND ADAPTER SPECIFICATION: FIREBASE VS. AIVEN POSTGRESQL

**Document Version:** 1.0.0  
**Status:** Approved for Sprint 16 Integration Readiness

---

## 1. Firebase Adapter Specification (Phase 1: Private Beta)

### 1.1 Architecture & Components
- **Identity:** Firebase Authentication (Email/Password + Google OAuth).
- **Primary Persistence:** Google Cloud Firestore (Native NoSQL Mode).
- **Client Library:** `@firebase/firestore`, `@firebase/auth`.
- **Repository Implementation:** Pre-configured in `src/repositories/firebase/` (created in Sprint 9).

### 1.2 Firestore Collection Hierarchy
```
/users/{userId}
  - profile: Map
  - preferences: Map
  - streak: Map
  /dailyProgress/{lessonId} (Subcollection)
  /quizAttempts/{attemptId} (Subcollection)
  /revisionSchedules/{topicId} (Subcollection)

/lessons/{lessonId}
  - title: String
  - contentMarkdown: String
  - citations: Array<Map>
  - mcq: Map

/assessments/{assessmentId}
  /questions/{questionId} (Subcollection)

/analyticsEvents/{eventId}
/userFeedback/{feedbackId}
```

### 1.3 Security Rules Specification
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Learners can only read and write their own progress
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Published lessons are readable by any authenticated user
    match /lessons/{lessonId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.role in ['reviewer', 'admin'];
    }

    // Feedback can be created by authenticated users
    match /userFeedback/{feedbackId} {
      allow create: if request.auth != null;
      allow read, update: if request.auth.token.role == 'admin';
    }
  }
}
```

### 1.4 Cost & Scaling Constraints
- **Free Tier (Spark):** 50k reads/day, 20k writes/day, 1GB stored data.
- **Beta Fit:** For 50 beta learners doing 3 lessons/day, daily writes $\approx 50 \times 10 = 500$ writes/day (2.5% of quota). Cost is **$0.00 / month**.

---

## 2. Aiven PostgreSQL Adapter Specification (Phase 2: Production Scale)

### 2.1 Architecture & Components
- **Hosting:** Aiven for PostgreSQL (Managed Startup-4 or Hobby tier).
- **ORM / Query Builder:** Prisma ORM or Kysely with TypeScript types.
- **Connection Pooling:** Built-in PgBouncer pooling (transaction pooling mode) to handle serverless spikes.
- **Vector Search Extension:** `pgvector` enabled for semantic chunk retrieval in the AI Learning Assistant.

### 2.2 Prisma Schema Mapping (Core Excerpt)
```prisma
datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [pgvector(map: "vector")]
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

enum Role {
  GUEST
  LEARNER
  REVIEWER
  ADMIN
}

model User {
  id           String    @id @default(uuid()) @db.Uuid
  email        String    @unique @db.VarChar(255)
  role         Role      @default(LEARNER)
  createdAt    DateTime  @default(now()) @db.Timestamptz
  updatedAt    DateTime  @updatedAt @db.Timestamptz

  profile      UserProfile?
  preferences  UserPreferences?
  streak       UserStreak?
  progress     LearningProgress[]
  quizAttempts QuizAttempt[]
}

model KnowledgeEntry {
  id             String                 @id @db.VarChar(100)
  topicId        String                 @db.VarChar(100)
  canonicalQuery String                 @db.Text
  answerMarkdown String                 @db.Text
  embedding      Unsupported("vector")?
  version        String                 @db.VarChar(50)
  createdAt      DateTime               @default(now()) @db.Timestamptz

  @@index([embedding])
}
```

### 2.3 Row-Level Security (RLS) & Connection Policy
- Secure backend API uses a privileged connection pool (`service_role`).
- All queries pass the validated `request.userId` via parameterized SQL queries (`WHERE user_id = $1`), ensuring complete tenant data isolation.

### 2.4 Backup & Disaster Recovery
- Automated continuous point-in-time recovery (PITR) with daily WAL backups provided out-of-the-box by Aiven.
- Zero-downtime schema migrations via `prisma migrate deploy` in the CI/CD pipeline.
