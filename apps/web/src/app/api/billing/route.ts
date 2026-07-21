import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { BillingService } from '@lade/services';
import { BillingRepository } from '@lade/database';
import { handleApiError } from '@lade/config';
import { UnauthorizedError } from '@lade/shared';

const billingRepo = new BillingRepository();
const billingService = new BillingService(billingRepo);

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const subscription = await billingService.getSubscription(session.user.id);
    const credits = await billingService.checkAiCredits(session.user.id);
    return NextResponse.json({ subscription, credits });
  } catch (error) {
    return handleApiError(error);
  }
}
