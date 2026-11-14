// src/repositories/mock/MockBacklogRepository.ts
import type { IBacklogRepository } from '../types';
import type { BacklogTask } from '@/types/backlog';

const BACKLOG_STORAGE_KEY = 'ds_product_backlog';

export class MockBacklogRepository implements IBacklogRepository {
  private tasks: BacklogTask[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem(BACKLOG_STORAGE_KEY);
      if (raw) {
        this.tasks = JSON.parse(raw);
      }
    } catch {
      this.tasks = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(BACKLOG_STORAGE_KEY, JSON.stringify(this.tasks));
    } catch {
      // ignore
    }
  }

  async createTask(
    task: Omit<BacklogTask, 'taskId' | 'createdAt' | 'updatedAt'>
  ): Promise<BacklogTask> {
    if (!task.title?.trim()) {
      throw new Error('Task title is required.');
    }

    this.loadFromStorage();
    // Duplicate prevention: avoid creating task with same normalized title
    const exists = this.tasks.some(
      (t) => t.title.trim().toLowerCase() === task.title.trim().toLowerCase()
    );
    if (exists) {
      throw new Error(`A backlog task with title "${task.title}" already exists.`);
    }

    const newTask: BacklogTask = {
      ...task,
      taskId: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sourceFeedbackIds: task.sourceFeedbackIds || [],
    };

    this.tasks.unshift(newTask);
    this.saveToStorage();
    return newTask;
  }

  async getAllTasks(): Promise<BacklogTask[]> {
    this.loadFromStorage();
    return [...this.tasks];
  }

  async updateTask(taskId: string, updates: Partial<BacklogTask>): Promise<BacklogTask> {
    this.loadFromStorage();
    const task = this.tasks.find((t) => t.taskId === taskId);
    if (!task) {
      throw new Error(`Backlog task with id ${taskId} not found.`);
    }

    Object.assign(task, updates, { updatedAt: new Date().toISOString() });
    this.saveToStorage();
    return { ...task };
  }

  async deleteTask(taskId: string): Promise<boolean> {
    this.loadFromStorage();
    const idx = this.tasks.findIndex((t) => t.taskId === taskId);
    if (idx === -1) return false;
    this.tasks.splice(idx, 1);
    this.saveToStorage();
    return true;
  }

  async clearBacklog(): Promise<void> {
    this.tasks = [];
    this.saveToStorage();
  }
}
