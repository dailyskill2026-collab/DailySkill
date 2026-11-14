// src/services/contentVerification.ts
import type { Draft, ValidationResult } from "../types/contentVerification";
import { validateStructure } from "./validationHelpers";
import { validateEvidence } from "./validationHelpers";
import { validateMcq } from "./validationHelpers";
import { isDuplicate } from "./duplicateDetection";
import { classifyRisk } from "./riskClassifier";

/**
 * Perform all validation steps for a draft.
 * Returns a ValidationResult describing passed / failed checks and the next action.
 */
export function validateDraft(draft: Draft): ValidationResult {
  const passed: string[] = [];
  const failed: string[] = [];
  const warnings: string[] = [];

  // 1. Basic structure validation
  const struct = validateStructure(draft);
  if (struct.ok) passed.push(...struct.passed);
  else failed.push(...struct.failed);

  // 2. Evidence validation
  const evidence = validateEvidence(draft);
  if (evidence.ok) passed.push(...evidence.passed);
  else failed.push(...evidence.failed);

  // 3. MCQ validation
  const mcq = validateMcq(draft);
  if (mcq.ok) passed.push(...mcq.passed);
  else {
    failed.push(...mcq.failed);
    warnings.push(...mcq.warnings);
  }

  // 4. Duplicate detection
  if (isDuplicate(draft)) {
    failed.push("Duplicate content detected");
  } else {
    passed.push("No duplicate detected");
  }

  // 5. Risk classification
  const risk = classifyRisk(draft);

  // Determine overall status
  const status = failed.length === 0 && risk !== "BLOCKED" ? "PASSED" : "FAILED";

  // Suggested next action based on risk and status
  let nextAction: string;
  if (status === "PASSED" && risk === "LOW") {
    nextAction = "Can be auto‑published if flag enabled";
  } else if (risk === "HIGH") {
    nextAction = "Requires admin approval";
  } else {
    nextAction = "Blocked – fix failures";
  }

  return {
    draftId: draft.id,
    status,
    passedChecks: passed,
    failedChecks: failed,
    warnings,
    riskLevel: risk,
    nextAction,
  };
}
