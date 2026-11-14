// src/services/riskClassifier.ts
import type { Draft } from "../types/contentVerification";

/**
 * Simple keyword‑based risk classification.
 * Returns "LOW", "HIGH" or "BLOCKED".
 */
export function classifyRisk(draft: Draft): "LOW" | "HIGH" | "BLOCKED" {
  // Blocked if essential fields missing – let validation handle, but we add quick checks
  if (!draft.body || draft.body.trim().length === 0) return "BLOCKED";

  const highRiskKeywords = [
    "release",
    "beta",
    "ga",
    "deprecated",
    "breaking change",
    "security",
    "api change",
    "apex",
    "lwc",
    "salesforce",
    "new feature",
  ];

  const lower = draft.title.toLowerCase() + " " + draft.body.toLowerCase();
  const hasHigh = highRiskKeywords.some((kw) => lower.includes(kw));

  // If any required evidence missing (handled elsewhere) we could block, but here we just classify
  return hasHigh ? "HIGH" : "LOW";
}
