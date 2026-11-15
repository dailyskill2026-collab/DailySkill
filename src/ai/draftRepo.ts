// src/ai/draftRepo.ts
// Repository interface for persisting AI content drafts.
// Provides a local filesystem implementation (development/Node) and a browser localStorage implementation.

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
// Browser LocalStorage implementation (for live web browser usage)
// -----------------------------------------------------------------------------
export class BrowserStorageDraftRepo implements DraftRepo {
  private storageKey = 'it-daily-ai-drafts';

  async saveDraft(draft: Draft): Promise<void> {
    try {
      const list = await this.listDrafts();
      const updated = [draft, ...list.filter((d) => d.documentId !== draft.documentId)];
      localStorage.setItem(this.storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  async getDraft(documentId: string): Promise<Draft | null> {
    const list = await this.listDrafts();
    return list.find((d) => d.documentId === documentId) || null;
  }

  async listDrafts(): Promise<Draft[]> {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return [];
  }
}

// -----------------------------------------------------------------------------
// Local filesystem implementation (writes JSON files under dev/drafts for Node/tests)
// -----------------------------------------------------------------------------
export class LocalFSDraftRepo implements DraftRepo {
  private baseDir: string = '';

  constructor() {
    if (typeof process !== 'undefined' && typeof process.cwd === 'function') {
      try {
        this.baseDir = path.resolve(process.cwd(), 'dev', 'drafts');
        fs.mkdir(this.baseDir, { recursive: true }).catch(() => {});
      } catch {
        // ignore
      }
    }
  }

  private filePath(documentId: string) {
    if (typeof process !== 'undefined' && typeof process.cwd === 'function') {
      return path.join(this.baseDir || path.resolve(process.cwd(), 'dev', 'drafts'), `${documentId}.json`);
    }
    return `${documentId}.json`;
  }

  async saveDraft(draft: Draft): Promise<void> {
    if (typeof process !== 'undefined' && typeof process.cwd === 'function') {
      const fp = this.filePath(draft.documentId);
      await fs.writeFile(fp, JSON.stringify(draft, null, 2), 'utf-8');
    }
  }

  async getDraft(documentId: string): Promise<Draft | null> {
    if (typeof process !== 'undefined' && typeof process.cwd === 'function') {
      const fp = this.filePath(documentId);
      try {
        const data = await fs.readFile(fp, 'utf-8');
        return JSON.parse(data) as Draft;
      } catch {
        return null;
      }
    }
    return null;
  }

  async listDrafts(): Promise<Draft[]> {
    if (typeof process !== 'undefined' && typeof process.cwd === 'function') {
      try {
        const files = await fs.readdir(this.baseDir);
        const drafts = await Promise.all(
          files.filter((f) => f.endsWith('.json')).map(async (file) => {
            const data = await fs.readFile(path.join(this.baseDir, file), 'utf-8');
            return JSON.parse(data) as Draft;
          })
        );
        return drafts;
      } catch {
        return [];
      }
    }
    return [];
  }
}

// -----------------------------------------------------------------------------
// Supabase adapter (stub – disabled unless env flag is set)
// -----------------------------------------------------------------------------
export class SupabaseDraftRepo implements DraftRepo {
  async saveDraft(_: Draft): Promise<void> {
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

// Factory based on environment and runtime
export function createDraftRepo(): DraftRepo {
  // If running in Node.js (e.g. during vitest tests)
  if (typeof process !== 'undefined' && Boolean(process.versions?.node)) {
    if (env.USE_SUPABASE_DRAFTS === 'true') {
      return new SupabaseDraftRepo();
    }
    return new LocalFSDraftRepo();
  }
  // Running in real browser (Vercel client)
  return new BrowserStorageDraftRepo();
}
