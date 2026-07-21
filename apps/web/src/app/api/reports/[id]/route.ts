import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { ReportService } from '@lade/services';
import { ReportRepository } from '@lade/database';
import { handleApiError } from '@lade/config';
import { UnauthorizedError } from '@lade/shared';

const reportRepo = new ReportRepository();
const reportService = new ReportService(reportRepo);

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();
    const { id } = await params;
    const report = await reportService.getById(id);
    return NextResponse.json({ report });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();
    const { id } = await params;
    await reportService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
