// src/repositories/mock/MockAuditRepository.ts
import type { IAuditRepository, AuditLogEntry } from '../types';

export class MockAuditRepository implements IAuditRepository {
  private logs: AuditLogEntry[] = [];

  async logAction(entry: AuditLogEntry): Promise<void> {
    const fullEntry: AuditLogEntry = {
      ...entry,
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      timestamp: entry.timestamp || new Date().toISOString(),
    };
    this.logs.unshift(fullEntry);
  }

  async getLogs(contentId?: string): Promise<AuditLogEntry[]> {
    if (contentId) {
      return this.logs.filter(l => l.contentId === contentId);
    }
    return [...this.logs];
  }
}
