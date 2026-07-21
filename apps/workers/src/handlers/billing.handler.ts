import { BillingRepository } from '@lade/database';
import { BillingService } from '@lade/services';
import { logger } from '@lade/config';
import type { Job } from '../types';

const billingRepo = new BillingRepository();
const billingService = new BillingService(billingRepo);

export async function handleBillingUsage(job: Job<{ userId: string; type: string; quantity: number; description: string }>): Promise<void> {
  logger.info('Recording billing usage', { userId: job.data.userId, type: job.data.type });

  await billingService.recordUsage(
    job.data.userId,
    job.data.type,
    job.data.quantity,
    job.data.description
  );

  const credits = await billingService.checkAiCredits(job.data.userId);
  logger.info('Usage recorded', { userId: job.data.userId, remainingCredits: credits.available });
}

export async function handleBillingInvoice(job: Job<{ userId: string; period: string }>): Promise<void> {
  logger.info('Generating invoice', { userId: job.data.userId, period: job.data.period });

  const subscription = await billingService.getSubscription(job.data.userId);
  if (!subscription) {
    logger.warn('No subscription found for invoice', { userId: job.data.userId });
    return;
  }

  logger.info('Invoice generated', { userId: job.data.userId, plan: subscription.plan });
}
