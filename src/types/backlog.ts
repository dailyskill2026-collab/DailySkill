// src/types/backlog.ts
import { FeedbackCategory } from './feedback';

export type BacklogPriority = 'critical' | 'high' | 'medium' | 'low';
export type BacklogStatus = 'new' | 'planned' | 'in_progress' | 'completed' | 'rejected';
export type BacklogEffort = 'XS' | 'S' | 'M' | 'L' | 'XL';

export interface BacklogTask {
  taskId: string;
  title: string;
  description: string;
  sourceFeedbackIds: string[];
  category: FeedbackCategory;
  priority: BacklogPriority;
  status: BacklogStatus;
  estimatedEffort: BacklogEffort;
  createdAt: string;
  updatedAt: string;
}
