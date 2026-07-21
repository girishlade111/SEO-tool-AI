import type { PrismaClient } from '@prisma/client';
import { prisma } from '../client';

export class BaseRepository {
  protected readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  protected now(): Date {
    return new Date();
  }

  protected softDeleteFilter(includeDeleted = false): { deletedAt: Date | null } | undefined {
    if (includeDeleted) return undefined;
    return { deletedAt: null };
  }
}
