# Architecture Decision Record (ADR-001)

## Title: Backend Architecture Strategy — Phased Evolution from Firebase Beta to Aiven PostgreSQL Scale

- **Status:** Approved
- **Deciders:** Full-Stack Architect, Product Manager, Security Engineer, QA Lead
- **Date:** 2026-11-15
- **Budget Target:** ₹50,000 – ₹1,00,000 ($600 – $1,200 USD) startup capital

---

## 1. Context and Problem Statement

The *IT Daily Upskilling App* is an AI-powered micro-learning product designed for busy working professionals, starting with the Salesforce ecosystem.

To transition from the current 100% Mock MVP to a production-ready application, we must select an infrastructure and persistence architecture that satisfies four strict criteria:
1. **Capital Preservation:** Must operate comfortably within the ₹50,000–₹1,00,000 development budget.
2. **Speed to Market:** Must enable rapid launch of a closed Private Beta with 20–50 actual Salesforce learners.
3. **Data Integrity & Scalability:** Must support a 27-entity relational domain model with strict referential integrity, complex progress metrics, and spaced repetition queries.
4. **AI & Vector Integration:** Must accommodate future Retrieval-Augmented Generation (RAG) vector embeddings for the AI Learning Assistant without exorbitant vector database add-ons.

---

## 2. Options Considered

### Option A: Firebase Platform (Authentication + Cloud Firestore + Cloud Functions)
- **Architecture:** Fully managed Backend-as-a-Service (BaaS) utilizing Firebase Auth, NoSQL Cloud Firestore, and serverless Cloud Functions.
- **Evaluation Score:** 3.60 / 5.00
- **Pros:**
  - Zero server maintenance, DevOps, or Docker overhead.
  - Generous Spark free tier (50,000 document reads, 20,000 writes/day free), enabling a $0 Private Beta.
  - Native client-side SDKs with built-in offline synchronization and Google OAuth.
- **Cons:**
  - NoSQL document model requires extreme denormalization across 27 relational entities.
  - Document-read pricing becomes unpredictable during complex analytical queries.
  - Lacks native vector similarity search; requires costly external vector services (Pinecone, Chroma).

### Option B: Aiven Managed PostgreSQL + Custom Node.js/Fastify Backend + Managed Auth
- **Architecture:** Managed Cloud PostgreSQL on Aiven paired with a stateless Node.js/Fastify API service and managed authentication (Clerk/Auth0/Firebase Auth).
- **Evaluation Score:** 4.10 / 5.00
- **Pros:**
  - True ACID relational integrity across all 27 domain entities with foreign keys and cascade rules.
  - Native `pgvector` extension allows storing and indexing lesson embeddings directly inside the database at zero extra cost.
  - Standard SQL allows rich window functions for streak tracking, spaced repetition decay, and admin analytics.
  - Zero vendor lock-in.
- **Cons:**
  - Minimum base server cost (~$19/month on Aiven), consuming ~$230/year (approx. ₹19,500/year) even with minimal traffic.
  - Requires maintaining custom API gateway infrastructure and handling server deployments.

---

## 3. Decision Outcome: Phased Hybrid Transition

We have approved a **Configuration-Driven Phased Transition Strategy**:

### Phase 1: Private Beta (Months 1–3, 20–200 Users)
- **Backend Provider:** `DATA_PROVIDER=firebase` (Firebase Auth + Cloud Firestore).
- **Rationale:** Leverages the pre-built dual-mode repository layer (`src/repositories/firebase/`) created in Sprint 9. Total infrastructure cost during this phase is **₹0/month**, strictly preserving capital while gathering real user retention telemetry.

### Phase 2: Public Launch & Scaling (Months 4+, 1,000–10,000+ Users)
- **Backend Provider:** `DATA_PROVIDER=api` (Aiven Managed PostgreSQL + Prisma ORM + pgvector).
- **Rationale:** Migrate storage to Aiven PostgreSQL to unlock native vector search for the AI Assistant, full relational integrity, and high-volume SQL analytics.
- **Zero Frontend Disruption:** Because all UI components consume data exclusively through the `IRepository<T>` interface abstraction, switching from Firestore to the REST/tRPC API requires **zero modifications to React components or hooks**.

### Sprint 16 Default
- `DATA_PROVIDER=mock` remains the active default in all local and test environments. No external network connections are initialized.

---

## 4. Architectural Safeguards
1. **No Silent Fallbacks:** If a production provider (`firebase` or `api`) encounters a network or authentication failure, it must reject with a structured error rather than silently falling back to mock fixtures.
2. **Zero Credentials in Bundles:** All secrets must reside exclusively in backend environment variables, never bundled into client-side code.
3. **Repository Decoupling:** Business services must remain completely agnostic of whether data originates from LocalStorage, Firestore, or PostgreSQL.
