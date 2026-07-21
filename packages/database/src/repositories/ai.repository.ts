import { BaseRepository } from './base.repository';
import type { PaginationParams, PaginatedResult } from './user.repository';
import type { Prisma } from '@prisma/client';

export interface CreateConversationData {
  userId: string;
  projectId?: string;
  title: string;
  model: string;
}

export interface UpdateConversationData {
  title?: string;
  messageCount?: number;
  tokenCount?: number;
}

export interface CreateMessageData {
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, unknown>;
  tokenCount?: number;
}

export interface CreateGenerationData {
  userId: string;
  projectId: string;
  type: string;
  prompt: string;
  model: string;
}

export interface UpdateGenerationData {
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  result?: string;
  inputTokens?: number;
  outputTokens?: number;
  cost?: number;
  latency?: number;
  completedAt?: Date;
}

export class AiRepository extends BaseRepository {
  createConversation(data: CreateConversationData) {
    return this.prisma.aiConversation.create({
      data: {
        userId: data.userId,
        projectId: data.projectId,
        title: data.title,
        model: data.model,
      },
    });
  }

  findConversationById(id: string) {
    return this.prisma.aiConversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 50,
        },
      },
    });
  }

  async findConversationsByUserId(userId: string, params: PaginationParams): Promise<PaginatedResult<unknown>> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 50;
    const sort = params.sort ?? 'updatedAt';
    const order = params.order ?? 'desc';

    const where: Prisma.AiConversationWhereInput = { userId };

    const [data, total] = await Promise.all([
      this.prisma.aiConversation.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { content: true, role: true, createdAt: true },
          },
        },
      }),
      this.prisma.aiConversation.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  updateConversation(id: string, data: UpdateConversationData) {
    return this.prisma.aiConversation.update({
      where: { id },
      data: {
        ...data,
        updatedAt: this.now(),
      },
    });
  }

  deleteConversation(id: string) {
    return this.prisma.aiConversation.delete({
      where: { id },
    });
  }

  addMessage(data: CreateMessageData) {
    return this.prisma.$transaction(async (tx) => {
      const message = await tx.aiMessage.create({
        data: {
          conversationId: data.conversationId,
          role: data.role as Prisma.EnumAiMessageRoleFilter['equals'],
          content: data.content,
          metadata: (data.metadata ?? {}) as Prisma.InputJsonValue,
          tokenCount: data.tokenCount ?? 0,
        },
      });

      await tx.aiConversation.update({
        where: { id: data.conversationId },
        data: {
          messageCount: { increment: 1 },
          tokenCount: { increment: data.tokenCount ?? 0 },
          updatedAt: this.now(),
        },
      });

      return message;
    });
  }

  getMessages(conversationId: string) {
    return this.prisma.aiMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  createGeneration(data: CreateGenerationData) {
    return this.prisma.aiContentGeneration.create({
      data: {
        userId: data.userId,
        projectId: data.projectId,
        type: data.type as Prisma.EnumAiGenerationTypeFilter['equals'],
        prompt: data.prompt,
        model: data.model,
      },
    });
  }

  updateGeneration(id: string, data: UpdateGenerationData) {
    return this.prisma.aiContentGeneration.update({
      where: { id },
      data: {
        ...data,
        status: data.status as Prisma.EnumAiGenerationStatusFilter['equals'] ?? undefined,
      },
    });
  }

  async findGenerationsByUserId(userId: string, params: PaginationParams): Promise<PaginatedResult<unknown>> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 50;
    const sort = params.sort ?? 'createdAt';
    const order = params.order ?? 'desc';

    const where: Prisma.AiContentGenerationWhereInput = { userId };

    const [data, total] = await Promise.all([
      this.prisma.aiContentGeneration.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.aiContentGeneration.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getUsageStats(userId: string, dateFrom: Date, dateTo: Date) {
    const generations = await this.prisma.aiContentGeneration.findMany({
      where: {
        userId,
        createdAt: { gte: dateFrom, lte: dateTo },
      },
      select: {
        inputTokens: true,
        outputTokens: true,
        cost: true,
        model: true,
        status: true,
        type: true,
      },
    });

    const totalInputTokens = generations.reduce((sum, g) => sum + g.inputTokens, 0);
    const totalOutputTokens = generations.reduce((sum, g) => sum + g.outputTokens, 0);
    const totalCost = generations.reduce((sum, g) => sum + g.cost, 0);
    const totalGenerations = generations.length;
    const completed = generations.filter(g => g.status === 'completed').length;
    const failed = generations.filter(g => g.status === 'failed').length;

    const byModel = generations.reduce<Record<string, { count: number; cost: number; tokens: number }>>((acc, g) => {
      if (!acc[g.model]) acc[g.model] = { count: 0, cost: 0, tokens: 0 };
      acc[g.model].count++;
      acc[g.model].cost += g.cost;
      acc[g.model].tokens += g.inputTokens + g.outputTokens;
      return acc;
    }, {});

    return {
      totalGenerations,
      completed,
      failed,
      totalInputTokens,
      totalOutputTokens,
      totalCost,
      byModel,
    };
  }
}
