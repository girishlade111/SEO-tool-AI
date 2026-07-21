import { logger } from '@lade/config';
import type { Job, JobType, JobStatus } from './types';

const memoryQueue: Map<string, Job> = new Map();
const runningJobs = new Set<string>();

export class JobQueue {
  private handlers: Map<JobType, { concurrency: number; handle: (job: Job) => Promise<void> }> = new Map();
  private polling = false;
  private startedAt = Date.now();

  register(type: JobType, concurrency: number, handle: (job: Job) => Promise<void>): void {
    this.handlers.set(type, { concurrency, handle });
    logger.info('Handler registered', { type, concurrency });
  }

  async enqueue<T>(type: JobType, data: T): Promise<string> {
    const id = `job:${type}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
    const job: Job<T> = {
      id,
      type,
      data,
      status: 'queued',
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date(),
    };
    memoryQueue.set(id, job);
    logger.info('Job enqueued', { id, type });
    return id;
  }

  start(): void {
    if (this.polling) return;
    this.polling = true;
    this.poll();
    logger.info('Worker polling started');
  }

  stop(): void {
    this.polling = false;
    logger.info('Worker polling stopped');
  }

  private async poll(): Promise<void> {
    if (!this.polling) return;

    for (const [type, handler] of this.handlers) {
      const runningCount = Array.from(runningJobs).filter((id) => id.startsWith(`job:${type}`)).length;
      const available = handler.concurrency - runningCount;

      if (available <= 0) continue;

      const queued = Array.from(memoryQueue.values())
        .filter((j) => j.type === type && j.status === 'queued')
        .slice(0, available);

      for (const job of queued) {
        this.processJob(job, handler.handle);
      }
    }

    setTimeout(() => this.poll(), 1000);
  }

  private async processJob(job: Job, handler: (job: Job) => Promise<void>): Promise<void> {
    job.status = 'running';
    job.startedAt = new Date();
    job.attempts++;
    runningJobs.add(job.id);

    try {
      await handler(job);
      job.status = 'completed';
      job.completedAt = new Date();
      logger.info('Job completed', { id: job.id, type: job.type });
    } catch (error) {
      job.status = 'failed';
      job.error = String(error);
      logger.error('Job failed', { id: job.id, type: job.type, error: job.error });

      if (job.attempts < job.maxAttempts) {
        job.status = 'queued';
        logger.info('Job re-queued', { id: job.id, type: job.type, attempt: job.attempts });
      }
    } finally {
      runningJobs.delete(job.id);
    }
  }

  getStats() {
    const now = Date.now();
    const all = Array.from(memoryQueue.values());

    return {
      activeJobs: runningJobs.size,
      completedJobs: all.filter((j) => j.status === 'completed').length,
      failedJobs: all.filter((j) => j.status === 'failed').length,
      queuedJobs: all.filter((j) => j.status === 'queued').length,
      uptime: Math.floor((now - this.startedAt) / 1000),
    };
  }
}

export const jobQueue = new JobQueue();
