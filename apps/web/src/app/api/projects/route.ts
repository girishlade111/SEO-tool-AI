import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { ProjectService, PermissionsService } from '@lade/services';
import { ProjectRepository } from '@lade/database';
import { handleApiError } from '@lade/config';
import { UnauthorizedError, createProjectSchema } from '@lade/shared';

const projectRepo = new ProjectRepository();
const permissions = new PermissionsService();
const projectService = new ProjectService(projectRepo, permissions);

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const { searchParams } = new URL(request.url);
    const params = {
      page: parseInt(searchParams.get('page') ?? '1'),
      limit: parseInt(searchParams.get('limit') ?? '20'),
      status: searchParams.get('status') ?? undefined,
    };

    const result = await projectService.list(session.user.id, params);
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
    const parsed = createProjectSchema.parse(body);
    const project = await projectService.create(session.user.id, parsed);

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
