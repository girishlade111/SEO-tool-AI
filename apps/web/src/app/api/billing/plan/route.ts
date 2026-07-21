import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { BillingService } from '@lade/services';
import { BillingRepository } from '@lade/database';
import { handleApiError } from '@lade/config';
import { UnauthorizedError } from '@lade/shared';

const billingRepo = new BillingRepository();
const billingService = new BillingService(billingRepo);

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const { plan } = await request.json();
    const subscription = await billingService.changePlan(session.user.id, plan);
    return NextResponse.json({ subscription });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const subscription = await billingService.cancelSubscription(session.user.id);
    return NextResponse.json({ subscription });
  } catch (error) {
    return handleApiError(error);
  }
}
