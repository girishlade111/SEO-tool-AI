import { NextResponse } from 'next/server';
import { AuthService } from '@lade/services';
import { UserRepository } from '@lade/database';
import { handleApiError } from '@lade/config';
import { registerSchema } from '@lade/shared';

const userRepo = new UserRepository();
const authService = new AuthService(userRepo);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.parse(body);
    const user = await authService.register(parsed.email, parsed.password, parsed.name);

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
