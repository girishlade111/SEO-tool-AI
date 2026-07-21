import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { ReportService } from '@lade/services';
import { ReportRepository } from '@lade/database';
import { handleApiError } from '@lade/config';
import { UnauthorizedError } from '@lade/shared';

const reportRepo = new ReportRepository();
const reportService = new ReportService(reportRepo);

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    if (!projectId) throw new Error('projectId is required');

    const result = await reportService.list(projectId, {
      page: parseInt(searchParams.get('page') ?? '1'),
      limit: parseInt(searchParams.get('limit') ?? '20'),
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const body = await request.json();
    const report = await reportService.generate(body.projectId, body.name, body.type, body.config);

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
