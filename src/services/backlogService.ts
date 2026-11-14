// src/services/backlogService.ts
import { repositories } from '@/repositories';
import type { BacklogTask, BacklogPriority, BacklogStatus, BacklogEffort } from '@/types/backlog';
import type { FeedbackCategory } from '@/types/feedback';

export class BacklogService {
  private static instance: BacklogService;

  static getInstance(): BacklogService {
    if (!BacklogService.instance) {
      BacklogService.instance = new BacklogService();
    }
    return BacklogService.instance;
  }

  async createTask(data: {
    title: string;
    description: string;
    category: FeedbackCategory;
    priority?: BacklogPriority;
    estimatedEffort?: BacklogEffort;
    sourceFeedbackIds?: string[];
  }): Promise<BacklogTask> {
    const task = await repositories.backlog.createTask({
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority || 'medium',
      status: 'new',
      estimatedEffort: data.estimatedEffort || 'M',
      sourceFeedbackIds: data.sourceFeedbackIds || [],
    });

    // If source feedback IDs were provided, update those feedback records
    if (data.sourceFeedbackIds?.length) {
      for (const fbId of data.sourceFeedbackIds) {
        await repositories.feedback.linkToBacklogTask(fbId, task.taskId);
        await repositories.feedback.updateFeedbackStatus(
          fbId,
          'planned',
          'Product Backlog',
          `Linked to backlog task: ${task.title}`
        );
      }
    }

    return task;
  }

  async linkFeedbackToTask(taskId: string, feedbackId: string): Promise<BacklogTask> {
    const tasks = await repositories.backlog.getAllTasks();
    const task = tasks.find((t) => t.taskId === taskId);
    if (!task) {
      throw new Error(`Task with id ${taskId} not found.`);
    }

    if (!task.sourceFeedbackIds.includes(feedbackId)) {
      task.sourceFeedbackIds.push(feedbackId);
      await repositories.backlog.updateTask(taskId, {
        sourceFeedbackIds: task.sourceFeedbackIds,
      });
      await repositories.feedback.linkToBacklogTask(feedbackId, taskId);
    }

    return task;
  }

  async updateTaskStatus(taskId: string, status: BacklogStatus): Promise<BacklogTask> {
    return repositories.backlog.updateTask(taskId, { status });
  }

  async getAllTasks(): Promise<BacklogTask[]> {
    return repositories.backlog.getAllTasks();
  }

  async deleteTask(taskId: string): Promise<boolean> {
    return repositories.backlog.deleteTask(taskId);
  }

  async clearBacklog(): Promise<void> {
    return repositories.backlog.clearBacklog();
  }
}

export const backlogService = BacklogService.getInstance();
