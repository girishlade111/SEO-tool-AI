import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { ProjectService, PermissionsService } from '@lade/services';
import { ProjectRepository } from '@lade/database';
import { handleApiError } from '@lade/config';
import { UnauthorizedError, updateProjectSchema } from '@lade/shared';

const projectRepo = new ProjectRepository();
const permissions = new PermissionsService();
const projectService = new ProjectService(projectRepo, permissions);

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();
    const { id } = await params;
    const project = await projectService.getById(id, session.user.id, session.user.role ?? 'viewer');
    return NextResponse.json({ project });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();
    const { id } = await params;
    const body = await request.json();
    const parsed = updateProjectSchema.parse(body);
    const project = await projectService.update(id, session.user.id, session.user.role ?? 'viewer', parsed);
    return NextResponse.json({ project });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();
    const { id } = await params;
    await projectService.delete(id, session.user.id, session.user.role ?? 'viewer');
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
