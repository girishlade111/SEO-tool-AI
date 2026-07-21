import { ReportRepository } from '@lade/database';
import { NotFoundError } from '@lade/shared';
import type { Report, PaginationParams, ReportType, ReportSchedule, ReportConfig } from '@lade/shared';

export class ReportService {
  constructor(private readonly reportRepo: ReportRepository) {}

  async list(projectId: string, params: PaginationParams) {
    return this.reportRepo.findByProjectId(projectId, params);
  }

  async getById(id: string): Promise<Report> {
    const report = await this.reportRepo.findById(id);
    if (!report) throw new NotFoundError('Report', id);
    return report as unknown as Report;
  }

  async generate(
    projectId: string,
    name: string,
    type: ReportType,
    config: ReportConfig
  ): Promise<Report> {
    return this.reportRepo.create({
      projectId,
      name,
      type,
      status: 'generating',
      config,
      schedule: 'none',
    }) as unknown as Report;
  }

  async schedule(projectId: string, name: string, type: ReportType, config: ReportConfig, schedule: ReportSchedule) {
    return this.reportRepo.create({
      projectId,
      name,
      type,
      status: 'completed',
      config,
      schedule,
    }) as unknown as Report;
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.reportRepo.delete(id);
  }
}
