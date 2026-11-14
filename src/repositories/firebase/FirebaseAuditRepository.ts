// src/repositories/firebase/FirebaseAuditRepository.ts
import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import type { IAuditRepository, AuditLogEntry } from '../types';
import { getFirebaseServices } from '@/lib/firebase';

export class FirebaseAuditRepository implements IAuditRepository {
  private getDb() {
    const services = getFirebaseServices();
    if (!services) throw new Error('Firestore is not configured.');
    return services.db;
  }

  async logAction(entry: AuditLogEntry): Promise<void> {
    const db = this.getDb();
    const colRef = collection(db, 'publishingAuditLogs');
    await addDoc(colRef, {
      ...entry,
      timestamp: entry.timestamp || new Date().toISOString(),
    });
  }

  async getLogs(contentId?: string): Promise<AuditLogEntry[]> {
    try {
      const db = this.getDb();
      const colRef = collection(db, 'publishingAuditLogs');
      let q = query(colRef, orderBy('timestamp', 'desc'), limit(50));
      if (contentId) {
        q = query(colRef, where('contentId', '==', contentId), orderBy('timestamp', 'desc'), limit(50));
      }
      const snap = await getDocs(q);
      const logs: AuditLogEntry[] = [];
      snap.forEach((d) => logs.push({ id: d.id, ...d.data() } as AuditLogEntry));
      return logs;
    } catch {
      return [];
    }
  }
}
