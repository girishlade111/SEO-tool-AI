import { BaseRepository } from './base.repository';
import type { PaginationParams, PaginatedResult } from './user.repository';
import type { Prisma, $Enums } from '@prisma/client';

export interface CreateReportData {
  projectId: string;
  name: string;
  type: string;
  status?: string;
  config: Record<string, unknown>;
  schedule: string;
}

export interface UpdateReportData {
  status?: string;
  completedAt?: Date;
  fileUrl?: string;
  config?: Record<string, unknown>;
}

export class ReportRepository extends BaseRepository {
  findById(id: string) {
    return this.prisma.report.findUnique({ where: { id } });
  }

  async findByProjectId(projectId: string, params: PaginationParams): Promise<PaginatedResult<unknown>> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 50;
    const sort = params.sort ?? 'createdAt';
    const order = params.order ?? 'desc';

    const where: Prisma.ReportWhereInput = { projectId };

    const [data, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      data,
      meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  create(data: CreateReportData) {
    return this.prisma.report.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        type: data.type as $Enums.ReportType,
        status: (data.status ?? 'generating') as $Enums.ReportStatus,
        config: data.config as Prisma.InputJsonValue,
        schedule: data.schedule as $Enums.ReportSchedule,
      },
    });
  }

  delete(id: string) {
    return this.prisma.report.delete({ where: { id } });
  }

  update(id: string, data: UpdateReportData) {
    return this.prisma.report.update({
      where: { id },
      data: {
        ...data,
        status: data.status as $Enums.ReportStatus | undefined,
        config: data.config as Prisma.InputJsonValue | undefined,
      },
    });
  }
}
