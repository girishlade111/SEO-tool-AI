import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { providerRegistry } from '@lade/ai-core';
import { handleApiError } from '@lade/config';
import { UnauthorizedError } from '@lade/shared';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const body = await request.json();
    const response = await providerRegistry.generate({
      model: body.model ?? 'gpt-4o-mini',
      messages: body.messages ?? [],
      systemPrompt: body.systemPrompt,
      temperature: body.temperature,
      maxTokens: body.maxTokens,
      responseFormat: body.responseFormat,
    });

    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error);
  }
}
