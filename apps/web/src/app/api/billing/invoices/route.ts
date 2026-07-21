import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { BillingService } from '@lade/services';
import { BillingRepository } from '@lade/database';
import { handleApiError } from '@lade/config';
import { UnauthorizedError } from '@lade/shared';

const billingRepo = new BillingRepository();
const billingService = new BillingService(billingRepo);

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const { searchParams } = new URL(request.url);
    const invoices = await billingService.getInvoices(session.user.id, {
      page: parseInt(searchParams.get('page') ?? '1'),
      limit: parseInt(searchParams.get('limit') ?? '20'),
    });

    return NextResponse.json(invoices);
  } catch (error) {
    return handleApiError(error);
  }
}
