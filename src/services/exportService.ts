// src/services/exportService.ts
import { repositories } from '@/repositories';
import { metricsService } from './metricsService';
import { journeyFunnelService } from './journeyFunnelService';

export class ExportService {
  private static instance: ExportService;

  static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  private escapeCsvCell(cell: any): string {
    if (cell === null || cell === undefined) return '';
    const str = typeof cell === 'object' ? JSON.stringify(cell) : String(cell);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  private arrayToCsv(headers: string[], rows: any[][]): string {
    const headerRow = headers.map(this.escapeCsvCell).join(',');
    const bodyRows = rows.map((r) => r.map(this.escapeCsvCell).join(',')).join('\n');
    return `${headerRow}\n${bodyRows}`;
  }

  private triggerDownload(content: string, filename: string, mimeType: string) {
    if (typeof window === 'undefined') return; // for node test environment safety
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async exportFeedbackAsCsv(includeSimulated = true): Promise<string> {
    const items = await repositories.feedback.getAllFeedback(includeSimulated);
    const headers = [
      'ID',
      'Category',
      'Rating',
      'Description',
      'Related Content',
      'Status',
      'Priority',
      'Created At',
      'User ID',
      'Is Simulated',
    ];
    const rows = items.map((f) => [
      f.id,
      f.category,
      f.rating ?? '',
      f.description,
      f.relatedContentId ?? '',
      f.status,
      f.priority,
      f.createdAt,
      f.mockUserId,
      f.isSimulated ? 'true' : 'false',
    ]);
    const csv = this.arrayToCsv(headers, rows);
    this.triggerDownload(csv, `feedback_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
    return csv;
  }

  async exportFeedbackAsJson(includeSimulated = true): Promise<string> {
    const items = await repositories.feedback.getAllFeedback(includeSimulated);
    const json = JSON.stringify(items, null, 2);
    this.triggerDownload(
      json,
      `feedback_${new Date().toISOString().split('T')[0]}.json`,
      'application/json'
    );
    return json;
  }

  async exportAnalyticsEventsAsCsv(includeSimulated = true): Promise<string> {
    const events = await repositories.analytics.getEvents({ includeSimulated });
    const headers = [
      'Event ID',
      'Event Type',
      'User ID',
      'Session ID',
      'Timestamp',
      'Screen',
      'Content ID',
      'Metadata',
      'Is Simulated',
    ];
    const rows = events.map((e) => [
      e.eventId,
      e.eventType,
      e.mockUserId,
      e.sessionId,
      e.timestamp,
      e.screen ?? '',
      e.relatedContentId ?? '',
      e.relevantMetadata ? JSON.stringify(e.relevantMetadata) : '',
      e.isSimulated ? 'true' : 'false',
    ]);
    const csv = this.arrayToCsv(headers, rows);
    this.triggerDownload(
      csv,
      `analytics_events_${new Date().toISOString().split('T')[0]}.csv`,
      'text/csv'
    );
    return csv;
  }

  async exportAnalyticsEventsAsJson(includeSimulated = true): Promise<string> {
    const events = await repositories.analytics.getEvents({ includeSimulated });
    const json = JSON.stringify(events, null, 2);
    this.triggerDownload(
      json,
      `analytics_events_${new Date().toISOString().split('T')[0]}.json`,
      'application/json'
    );
    return json;
  }

  async exportBacklogAsCsv(): Promise<string> {
    const tasks = await repositories.backlog.getAllTasks();
    const headers = [
      'Task ID',
      'Title',
      'Category',
      'Priority',
      'Status',
      'Effort',
      'Linked Feedback',
      'Created At',
    ];
    const rows = tasks.map((t) => [
      t.taskId,
      t.title,
      t.category,
      t.priority,
      t.status,
      t.estimatedEffort,
      t.sourceFeedbackIds.join(';'),
      t.createdAt,
    ]);
    const csv = this.arrayToCsv(headers, rows);
    this.triggerDownload(csv, `backlog_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
    return csv;
  }

  async exportAggregatedMetricsAsJson(includeSimulated = true): Promise<string> {
    const summary = await metricsService.getEngagementSummary({ includeSimulated });
    const cohorts = await metricsService.getRetentionCohorts(includeSimulated);
    const funnel = await journeyFunnelService.getFunnelStages({ includeSimulated });

    const payload = {
      generatedAt: new Date().toISOString(),
      summary,
      cohorts,
      funnel,
    };
    const json = JSON.stringify(payload, null, 2);
    this.triggerDownload(
      json,
      `aggregated_metrics_${new Date().toISOString().split('T')[0]}.json`,
      'application/json'
    );
    return json;
  }
}

export const exportService = ExportService.getInstance();
