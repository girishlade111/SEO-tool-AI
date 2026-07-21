import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { ProjectService, PermissionsService } from '@lade/services';
import { ProjectRepository } from '@lade/database';
import { handleApiError } from '@lade/config';
import { UnauthorizedError } from '@lade/shared';

const projectRepo = new ProjectRepository();
const permissions = new PermissionsService();
const projectService = new ProjectService(projectRepo, permissions);

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();
    const { id } = await params;
    const members = await projectService.getMembers(id, session.user.id, session.user.role ?? 'viewer');
    return NextResponse.json({ members });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();
    const { id } = await params;
    const { email, role } = await request.json();
    await projectService.addMember(id, session.user.id, session.user.role ?? 'viewer', email, role);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
