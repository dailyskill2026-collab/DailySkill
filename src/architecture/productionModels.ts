/**
 * Sprint 15: Production Architecture Models, RBAC & Cloud Migration Validators
 * 
 * Provides type contracts, RBAC permission checkers, infrastructure cost calculators,
 * and data migration schema validators preparing the mock MVP for production readiness.
 */

// ==========================================
// 1. RBAC & IDENTITY SPECIFICATIONS
// ==========================================

export type UserRole = 'guest' | 'learner' | 'reviewer' | 'admin';

export type SystemPermission =
  | 'read:public_content'
  | 'read:daily_journey'
  | 'write:daily_progress'
  | 'write:quiz_attempts'
  | 'read:skill_assessments'
  | 'write:skill_assessments'
  | 'write:doubt_queries'
  | 'write:feedback'
  | 'read:own_analytics'
  | 'read:review_backlog'
  | 'write:review_decision'
  | 'write:content_edit'
  | 'manage:content_publishing'
  | 'read:global_telemetry'
  | 'manage:users_and_roles';

export const ROLE_PERMISSIONS_MATRIX: Record<UserRole, SystemPermission[]> = {
  guest: [
    'read:public_content',
    'read:daily_journey',
    'read:skill_assessments',
  ],
  learner: [
    'read:public_content',
    'read:daily_journey',
    'write:daily_progress',
    'write:quiz_attempts',
    'read:skill_assessments',
    'write:skill_assessments',
    'write:doubt_queries',
    'write:feedback',
    'read:own_analytics',
  ],
  reviewer: [
    'read:public_content',
    'read:daily_journey',
    'write:daily_progress',
    'write:quiz_attempts',
    'read:skill_assessments',
    'write:skill_assessments',
    'write:doubt_queries',
    'write:feedback',
    'read:own_analytics',
    'read:review_backlog',
    'write:review_decision',
    'write:content_edit',
  ],
  admin: [
    'read:public_content',
    'read:daily_journey',
    'write:daily_progress',
    'write:quiz_attempts',
    'read:skill_assessments',
    'write:skill_assessments',
    'write:doubt_queries',
    'write:feedback',
    'read:own_analytics',
    'read:review_backlog',
    'write:review_decision',
    'write:content_edit',
    'manage:content_publishing',
    'read:global_telemetry',
    'manage:users_and_roles',
  ],
};

export function hasPermission(role: UserRole, permission: SystemPermission): boolean {
  const allowed = ROLE_PERMISSIONS_MATRIX[role] || [];
  return allowed.includes(permission);
}

// ==========================================
// 2. INFRASTRUCTURE & AI COST CALCULATOR
// ==========================================

export interface CostBreakdown {
  users: number;
  monthlyInfraUSD: number;
  monthlyAiUSD: number;
  monthlyTotalUSD: number;
  monthlyTotalINR: number;
  annualTotalINR: number;
  isWithinBudget: boolean; // Evaluates against ₹1,00,000 annual budget
}

export function calculateOperatingCost(
  users: number,
  inrConversionRate = 85.0
): CostBreakdown {
  let monthlyInfraUSD = 0;
  let monthlyAiUSD = 0;

  if (users <= 100) {
    // 100 Beta Users
    // Hosting: Free Vercel Hobby + Firebase Spark Free Tier
    // AI: ~10 Assistant queries/user/mo + 150 batch content gen items/mo
    monthlyInfraUSD = 0;
    const aiQueries = users * 10;
    const aiContentGenTokens = 200_000;
    const assistantTokens = aiQueries * 1_500;
    // Gemini 1.5 Flash: $0.075 / 1M input, $0.30 / 1M output (~$0.15 / 1M avg)
    monthlyAiUSD = ((assistantTokens + aiContentGenTokens) / 1_000_000) * 0.15;
    // Base minimum buffer
    monthlyAiUSD = Math.max(monthlyAiUSD, 2.5);
  } else if (users <= 1000) {
    // 1,000 Users
    // Hosting: Vercel Pro ($20) + Cloud DB Starter ($10)
    // AI: ~12 Assistant queries/user/mo = 12,000 queries * 1,500 tokens = 18M tokens = ~$2.70
    // Batch Content Pipeline: 300 items/mo = 1.5M tokens = ~$0.30
    monthlyInfraUSD = 30.0;
    const aiQueries = users * 12;
    const totalTokens = aiQueries * 1_500 + 1_500_000;
    monthlyAiUSD = Math.max(5.0, (totalTokens / 1_000_000) * 0.18);
  } else {
    // 10,000 Users
    // Hosting: Vercel Pro ($20 + $40 bandwidth) + Aiven PostgreSQL Startup ($50) + Redis Cache ($15)
    // AI: Cache hit rate 75% -> 25% * 120,000 queries = 30,000 calls = 45M tokens = ~$9.00
    monthlyInfraUSD = 125.0;
    const rawQueries = users * 12;
    const cachedQueries = rawQueries * 0.25; // 75% prompt & response cache hit
    const totalTokens = cachedQueries * 1_500 + 5_000_000;
    monthlyAiUSD = Math.max(15.0, (totalTokens / 1_000_000) * 0.20);
  }

  const monthlyTotalUSD = monthlyInfraUSD + monthlyAiUSD;
  const monthlyTotalINR = Math.round(monthlyTotalUSD * inrConversionRate);
  const annualTotalINR = monthlyTotalINR * 12;
  const isWithinBudget = annualTotalINR <= 100_000;

  return {
    users,
    monthlyInfraUSD: Number(monthlyInfraUSD.toFixed(2)),
    monthlyAiUSD: Number(monthlyAiUSD.toFixed(2)),
    monthlyTotalUSD: Number(monthlyTotalUSD.toFixed(2)),
    monthlyTotalINR,
    annualTotalINR,
    isWithinBudget,
  };
}

// ==========================================
// 3. CLOUD MIGRATION SCHEMA VALIDATOR
// ==========================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateEntityForCloudMigration(
  entityType: string,
  record: Record<string, any>
): ValidationResult {
  const errors: string[] = [];

  if (!record || typeof record !== 'object') {
    return { valid: false, errors: ['Record must be a non-null object'] };
  }

  // Common UUID / Key checks
  if (!record.id || typeof record.id !== 'string' || record.id.trim().length === 0) {
    errors.push(`Missing or invalid 'id' on entity ${entityType}`);
  }

  // ISO timestamp verification
  const timestampFields = ['createdAt', 'updatedAt', 'publishedAt', 'timestamp', 'date'];
  for (const field of timestampFields) {
    if (record[field] !== undefined && record[field] !== null) {
      const parsedDate = new Date(record[field]);
      if (isNaN(parsedDate.getTime())) {
        errors.push(`Invalid ISO date string on field '${field}' for entity ${entityType}`);
      }
    }
  }

  // Specific Entity Validations
  switch (entityType) {
    case 'users':
      if (!record.role || !['guest', 'learner', 'reviewer', 'admin'].includes(record.role)) {
        errors.push(`Invalid user role: ${record.role}`);
      }
      break;

    case 'daily_journey_items':
      if (!record.conceptId || typeof record.conceptId !== 'string') {
        errors.push("Missing required 'conceptId' foreign key");
      }
      if (!record.title || typeof record.title !== 'string') {
        errors.push("Missing required 'title' string");
      }
      break;

    case 'skill_assessments':
      if (!record.technology || typeof record.technology !== 'string') {
        errors.push("Missing required 'technology' property");
      }
      if (!Array.isArray(record.questions) || record.questions.length === 0) {
        errors.push("Assessment must contain a non-empty 'questions' array");
      }
      break;

    case 'feedback_submissions':
      if (!record.category || typeof record.category !== 'string') {
        errors.push("Missing required 'category' property");
      }
      break;

    case 'analytics_events':
      if (!record.eventName || typeof record.eventName !== 'string') {
        errors.push("Missing required 'eventName' property");
      }
      break;

    default:
      // Generic check passed
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
