// src/types/contentVerification.ts
export interface Draft {
  id: string;
  title: string;
  description: string;
  technology: string;
  category: string;
  contentType: string;
  difficulty: string;
  releaseVersion: string;
  sourceUrl: string;
  sourceSection: string;
  evidenceExcerpt?: string;
  body: string;
  mcqs: MCQ[];
}

export interface MCQ {
  question: string;
  options: string[]; // exactly 4
  correctOptionIndex: number; // 0‑based
  explanation: string;
}

export type RiskLevel = "LOW" | "HIGH" | "BLOCKED";

export type ValidationStatus = "PASSED" | "FAILED";

export interface ValidationResult {
  draftId: string;
  status: ValidationStatus;
  passedChecks: string[];
  failedChecks: string[];
  warnings: string[];
  riskLevel: RiskLevel;
  nextAction: string;
}
