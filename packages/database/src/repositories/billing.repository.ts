import { BaseRepository } from './base.repository';
import type { PaginationParams, PaginatedResult } from './user.repository';
import type { Prisma } from '@prisma/client';

export interface CreateSubscriptionData {
  userId: string;
  plan: string;
  status?: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  currentPeriodEnd: Date;
  maxProjects?: number;
  maxPagesPerProject?: number;
  maxKeywords?: number;
  aiCredits?: number;
  apiCallsLimit?: number;
}

export interface UpdateSubscriptionData {
  plan?: string;
  status?: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  maxProjects?: number;
  maxPagesPerProject?: number;
  maxKeywords?: number;
  aiCredits?: number;
  apiCallsLimit?: number;
}

export interface CreateInvoiceData {
  userId: string;
  subscriptionId: string;
  stripeInvoiceId?: string;
  amount: number;
  amountPaid?: number;
  tax?: number;
  currency?: string;
  invoiceUrl?: string;
  dueDate: Date;
}

export interface CreateUsageRecordData {
  userId: string;
  type: string;
  quantity?: number;
  description?: string;
}

export interface CreatePaymentMethodData {
  userId: string;
  stripePaymentMethodId: string;
  type: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault?: boolean;
}

export class BillingRepository extends BaseRepository {
  findSubscriptionByUserId(userId: string) {
    return this.prisma.subscription.findUnique({
      where: { userId },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
  }

  createSubscription(data: CreateSubscriptionData) {
    const planDefaults: Record<string, { maxProjects: number; maxPagesPerProject: number; maxKeywords: number; aiCredits: number; apiCallsLimit: number }> = {
      free: { maxProjects: 1, maxPagesPerProject: 100, maxKeywords: 50, aiCredits: 10, apiCallsLimit: 100 },
      pro: { maxProjects: 10, maxPagesPerProject: 5000, maxKeywords: 1000, aiCredits: 500, apiCallsLimit: 10000 },
      business: { maxProjects: 50, maxPagesPerProject: 50000, maxKeywords: 10000, aiCredits: 5000, apiCallsLimit: 100000 },
      enterprise: { maxProjects: -1, maxPagesPerProject: -1, maxKeywords: -1, aiCredits: -1, apiCallsLimit: -1 },
    };

    const defaults = planDefaults[data.plan] ?? planDefaults.free;

    return this.prisma.subscription.create({
      data: {
        userId: data.userId,
        plan: data.plan as Prisma.EnumPlanTypeFilter['equals'],
        status: data.status as Prisma.EnumSubscriptionStatusFilter['equals'] ?? 'active',
        stripeSubscriptionId: data.stripeSubscriptionId,
        stripeCustomerId: data.stripeCustomerId,
        currentPeriodEnd: data.currentPeriodEnd,
        maxProjects: data.maxProjects ?? defaults.maxProjects,
        maxPagesPerProject: data.maxPagesPerProject ?? defaults.maxPagesPerProject,
        maxKeywords: data.maxKeywords ?? defaults.maxKeywords,
        aiCredits: data.aiCredits ?? defaults.aiCredits,
        apiCallsLimit: data.apiCallsLimit ?? defaults.apiCallsLimit,
      },
    });
  }

  updateSubscription(id: string, data: UpdateSubscriptionData) {
    return this.prisma.subscription.update({
      where: { id },
      data: {
        ...data,
        updatedAt: this.now(),
      },
    });
  }

  cancelSubscription(id: string) {
    return this.prisma.subscription.update({
      where: { id },
      data: {
        status: 'canceled',
        canceledAt: this.now(),
        updatedAt: this.now(),
      },
    });
  }

  createInvoice(data: CreateInvoiceData) {
    return this.prisma.invoice.create({
      data: {
        userId: data.userId,
        subscriptionId: data.subscriptionId,
        stripeInvoiceId: data.stripeInvoiceId,
        amount: data.amount,
        amountPaid: data.amountPaid ?? 0,
        tax: data.tax ?? 0,
        currency: data.currency ?? 'usd',
        invoiceUrl: data.invoiceUrl,
        dueDate: data.dueDate,
      },
    });
  }

  async findInvoicesByUserId(userId: string, params: PaginationParams): Promise<PaginatedResult<unknown>> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 50;
    const sort = params.sort ?? 'createdAt';
    const order = params.order ?? 'desc';

    const where: Prisma.InvoiceWhereInput = { userId };

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.invoice.count({ where }),
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

  createUsageRecord(data: CreateUsageRecordData) {
    return this.prisma.usageRecord.create({
      data: {
        userId: data.userId,
        type: data.type as Prisma.EnumUsageTypeFilter['equals'],
        quantity: data.quantity ?? 1,
        description: data.description ?? '',
      },
    });
  }

  async getUsageByUserId(userId: string, type: string, dateFrom: Date, dateTo: Date) {
    const records = await this.prisma.usageRecord.findMany({
      where: {
        userId,
        type: type as Prisma.EnumUsageTypeFilter['equals'],
        createdAt: { gte: dateFrom, lte: dateTo },
      },
    });

    const totalQuantity = records.reduce((sum, r) => sum + r.quantity, 0);
    const totalRecords = records.length;

    return {
      type,
      totalQuantity,
      totalRecords,
      records,
    };
  }

  async getTotalUsage(userId: string, dateFrom: Date, dateTo: Date) {
    const records = await this.prisma.usageRecord.groupBy({
      by: ['type'],
      where: {
        userId,
        createdAt: { gte: dateFrom, lte: dateTo },
      },
      _sum: { quantity: true },
      _count: true,
    });

    return records.map(r => ({
      type: r.type,
      totalQuantity: r._sum.quantity ?? 0,
      totalRecords: r._count,
    }));
  }

  createPaymentMethod(data: CreatePaymentMethodData) {
    return this.prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.paymentMethod.updateMany({
          where: { userId: data.userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.paymentMethod.create({
        data: {
          userId: data.userId,
          stripePaymentMethodId: data.stripePaymentMethodId,
          type: data.type,
          brand: data.brand,
          last4: data.last4,
          expMonth: data.expMonth,
          expYear: data.expYear,
          isDefault: data.isDefault ?? false,
        },
      });
    });
  }

  findPaymentMethodsByUserId(userId: string) {
    return this.prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async setDefaultPaymentMethod(userId: string, paymentMethodId: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.paymentMethod.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });

      return tx.paymentMethod.update({
        where: { id: paymentMethodId, userId },
        data: { isDefault: true },
      });
    });
  }

  deletePaymentMethod(id: string) {
    return this.prisma.paymentMethod.delete({
      where: { id },
    });
  }
}
