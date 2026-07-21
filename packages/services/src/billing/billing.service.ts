import { BillingRepository } from '@lade/database';
import { NotFoundError } from '@lade/shared';
import type { Subscription, PlanType, PaginationParams } from '@lade/shared';
import { PLANS } from '@lade/shared';

export class BillingService {
  constructor(private readonly billingRepo: BillingRepository) {}

  async getSubscription(userId: string): Promise<Subscription | null> {
    const result = await this.billingRepo.findSubscriptionByUserId(userId);
    return result as unknown as Subscription | null;
  }

  async changePlan(userId: string, plan: PlanType): Promise<Subscription> {
    const current = await this.billingRepo.findSubscriptionByUserId(userId);

    if (current) {
      const result = await this.billingRepo.updateSubscription(current.id, {
        plan,
        maxProjects: PLANS[plan].maxProjects,
        maxPagesPerProject: PLANS[plan].maxPagesPerProject,
        maxKeywords: PLANS[plan].maxKeywords,
        aiCredits: PLANS[plan].aiCredits,
        apiCallsLimit: PLANS[plan].apiCallsLimit,
      });
      return result as unknown as Subscription;
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const result = await this.billingRepo.createSubscription({
      userId,
      plan,
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      maxProjects: PLANS[plan].maxProjects,
      maxPagesPerProject: PLANS[plan].maxPagesPerProject,
      maxKeywords: PLANS[plan].maxKeywords,
      aiCredits: PLANS[plan].aiCredits,
      apiCallsLimit: PLANS[plan].apiCallsLimit,
    });
    return result as unknown as Subscription;
  }

  async cancelSubscription(userId: string): Promise<Subscription> {
    const sub = await this.billingRepo.findSubscriptionByUserId(userId);
    if (!sub) throw new NotFoundError('Subscription');
    const result = await this.billingRepo.cancelSubscription(sub.id);
    return result as unknown as Subscription;
  }

  async getInvoices(userId: string, params: PaginationParams) {
    return this.billingRepo.findInvoicesByUserId(userId, params);
  }

  async recordUsage(userId: string, type: string, quantity: number, description: string) {
    return this.billingRepo.createUsageRecord({ userId, type, quantity, description });
  }

  async checkAiCredits(userId: string): Promise<{ available: number; used: number; limit: number }> {
    const sub = await this.billingRepo.findSubscriptionByUserId(userId);
    if (!sub) return { available: 0, used: 0, limit: 0 };

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const usage = await this.billingRepo.getTotalUsage(userId, 'ai_credit', startOfMonth, new Date());
    return {
      available: sub.aiCredits - usage,
      used: usage,
      limit: sub.aiCredits,
    };
  }
}
