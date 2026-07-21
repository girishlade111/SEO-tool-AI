import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { AuthService } from '@lade/services';
import { UserRepository } from '@lade/database';
import { handleApiError } from '@lade/config';
import { UnauthorizedError } from '@lade/shared';

const userRepo = new UserRepository();
const authService = new AuthService(userRepo);

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const user = await authService.getUser(session.user.id);
    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const body = await request.json();
    const user = await authService.updateProfile(session.user.id, body);
    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
