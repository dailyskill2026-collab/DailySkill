// src/services/duplicateDetection.ts
import type { Draft } from "../types/contentVerification";
import { createHash } from "crypto";
import { getRepository } from "./persistence";

/**
 * Compute SHA‑256 hash of the draft body.
 */
function hashBody(body: string): string {
  return createHash("sha256").update(body, "utf8").digest("hex");
}

/**
 * Returns true if a draft with the same body hash already exists in the repository.
 */
export function isDuplicate(draft: Draft): boolean {
  const repo = getRepository();
  const newHash = hashBody(draft.body);
  for (const existing of repo.getAll()) {
    if (existing.id === draft.id) continue; // skip self
    if (hashBody(existing.body) === newHash) {
      return true;
    }
  }
  return false;
}
