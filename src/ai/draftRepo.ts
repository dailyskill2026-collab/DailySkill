// src/ai/draftRepo.ts
// Repository interface for persisting AI content drafts.
// Provides a local filesystem implementation (development) and a Supabase stub (disabled by default).

import type { Draft } from './schemas';
import { env } from '@/lib/env';
import { promises as fs } from 'fs';
import path from 'path';

export interface DraftRepo {
  saveDraft(draft: Draft): Promise<void>;
  getDraft(documentId: string): Promise<Draft | null>;
  listDrafts(): Promise<Draft[]>;
}

// -----------------------------------------------------------------------------
// Local filesystem implementation (writes JSON files under dev/drafts)
// -----------------------------------------------------------------------------
export class LocalFSDraftRepo implements DraftRepo {
  private baseDir: string;
  constructor() {
    // Use a dedicated dev folder; ensure it exists.
    this.baseDir = path.resolve(process.cwd(), 'dev', 'drafts');
    // Create directory if missing (ignore errors).
    fs.mkdir(this.baseDir, { recursive: true }).catch(() => {});
  }

  private filePath(documentId: string) {
    return path.join(this.baseDir, `${documentId}.json`);
  }

  async saveDraft(draft: Draft): Promise<void> {
    const fp = this.filePath(draft.documentId);
    await fs.writeFile(fp, JSON.stringify(draft, null, 2), 'utf-8');
  }

  async getDraft(documentId: string): Promise<Draft | null> {
    const fp = this.filePath(documentId);
    try {
      const data = await fs.readFile(fp, 'utf-8');
      return JSON.parse(data) as Draft;
    } catch (e) {
      return null;
    }
  }

  async listDrafts(): Promise<Draft[]> {
    try {
      const files = await fs.readdir(this.baseDir);
      const drafts = await Promise.all(
        files.filter((f) => f.endsWith('.json')).map(async (file) => {
          const data = await fs.readFile(path.join(this.baseDir, file), 'utf-8');
          return JSON.parse(data) as Draft;
        })
      );
      return drafts;
    } catch (e) {
      return [];
    }
  }
}

// -----------------------------------------------------------------------------
// Supabase adapter (stub – disabled unless env flag is set)
// -----------------------------------------------------------------------------
export class SupabaseDraftRepo implements DraftRepo {
  // NOTE: This is a placeholder. The real implementation would use the
  // supabase-js client to interact with a 'drafts' table. It is kept minimal
  // because the user wants it disabled until they configure Supabase.
  async saveDraft(_: Draft): Promise<void> {
    // No‑op – replace with real supabase call when enabled.
    console.warn('SupabaseDraftRepo.saveDraft called but Supabase not configured.');
  }
  async getDraft(_: string): Promise<Draft | null> {
    console.warn('SupabaseDraftRepo.getDraft called but Supabase not configured.');
    return null;
  }
  async listDrafts(): Promise<Draft[]> {
    console.warn('SupabaseDraftRepo.listDrafts called but Supabase not configured.');
    return [];
  }
}

// Factory based on env flag
export function createDraftRepo(): DraftRepo {
  if (env.USE_SUPABASE_DRAFTS === 'true') {
    return new SupabaseDraftRepo();
  }
  return new LocalFSDraftRepo();
}
