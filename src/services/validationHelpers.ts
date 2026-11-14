// src/services/validationHelpers.ts
/** Simple helper functions for validation checks */

export function validateStructure(draft: any) {
  const required = [
    "title",
    "description",
    "technology",
    "category",
    "contentType",
    "difficulty",
    "releaseVersion",
    "sourceUrl",
    "sourceSection",
    "body",
    "mcqs",
  ];
  const missing = required.filter((k) => !(k in draft) || !draft[k]);
  if (missing.length === 0) {
    return { ok: true, passed: ["All required fields present"] };
  }
  return { ok: false, failed: missing.map((k) => `Missing field: ${k}`) };
}

export function validateEvidence(draft: any) {
  // In mock mode, just check that sourceUrl and sourceSection are non‑empty strings
  const failures: string[] = [];
  if (!draft.sourceUrl || typeof draft.sourceUrl !== "string") {
    failures.push("Source URL missing or invalid");
  }
  if (!draft.sourceSection || typeof draft.sourceSection !== "string") {
    failures.push("Source section missing or invalid");
  }
  if (failures.length === 0) {
    return { ok: true, passed: ["Evidence fields present"] };
  }
  return { ok: false, failed: failures };
}

export function validateMcq(draft: any) {
  const failures: string[] = [];
  const warnings: string[] = [];
  if (!Array.isArray(draft.mcqs) || draft.mcqs.length === 0) {
    failures.push("No MCQs provided");
    return { ok: false, failed: failures, warnings };
  }
  draft.mcqs.forEach((q: any, idx: number) => {
    if (!q.question || typeof q.question !== "string" || q.question.trim() === "") {
      failures.push(`MCQ #${idx + 1} missing question`);
    }
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      failures.push(`MCQ #${idx + 1} must have exactly 4 options`);
    } else {
      const uniq = new Set(q.options);
      if (uniq.size !== 4) {
        failures.push(`MCQ #${idx + 1} options contain duplicates`);
      }
    }
    if (typeof q.correctOptionIndex !== "number" || q.correctOptionIndex < 0 || q.correctOptionIndex > 3) {
      failures.push(`MCQ #${idx + 1} has invalid correctOptionIndex`);
    }
    if (!q.explanation || typeof q.explanation !== "string" || q.explanation.trim() === "") {
      failures.push(`MCQ #${idx + 1} missing explanation`);
    }
    // Simple semantic warning: if explanation does not contain the chosen option text
    if (Array.isArray(q.options) && q.correctOptionIndex >= 0 && q.correctOptionIndex < q.options.length) {
      const correctOpt = q.options[q.correctOptionIndex];
      if (!q.explanation.includes(correctOpt)) {
        warnings.push(`MCQ #${idx + 1} explanation may not reference the correct option`);
      }
    }
  });
  const ok = failures.length === 0;
  return { ok, failed: failures, warnings };
}
