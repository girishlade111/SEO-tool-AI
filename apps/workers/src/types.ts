export type JobType = 
  | 'page:analyze'
  | 'report:generate'
  | 'keyword:refresh'
  | 'notification:send'
  | 'billing:usage'
  | 'billing:invoice'
  | 'content:ai-optimize';

export type JobStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface Job<T = unknown> {
  id: string;
  type: JobType;
  data: T;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface JobHandler<T = unknown> {
  type: JobType;
  concurrency: number;
  handle(job: Job<T>): Promise<void>;
}

export interface WorkerStats {
  activeJobs: number;
  completedJobs: number;
  failedJobs: number;
  queuedJobs: number;
  uptime: number;
}
