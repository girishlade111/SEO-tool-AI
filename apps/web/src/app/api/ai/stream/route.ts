import { auth } from '@/lib/auth/auth';
import { providerRegistry } from '@lade/ai-core';
import { UnauthorizedError } from '@lade/shared';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const body = await request.json();
    const stream = await providerRegistry.stream({
      model: body.model ?? 'gpt-4o-mini',
      messages: body.messages ?? [],
      systemPrompt: body.systemPrompt,
      temperature: body.temperature,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            controller.enqueue(encoder.encode(JSON.stringify(chunk) + '\n'));
          }
        } catch (error) {
          controller.enqueue(encoder.encode(JSON.stringify({ type: 'error', error: String(error) }) + '\n'));
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ type: 'error', error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
