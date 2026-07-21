import type { AIRequest, AIResponse, AIMessage, StreamChunk, AIProvider, AIModel } from '../types';
import type { AIProviderInterface } from './provider.interface';
import { getModelConfig } from '../models';
import { costTracker } from '../cost-tracker';
import { logger } from '@lade/config';

export class AnthropicProvider implements AIProviderInterface {
  readonly name: AIProvider = 'anthropic';
  readonly supportedModels: AIModel[] = ['claude-3.5-sonnet', 'claude-3.5-haiku'];
  private apiKey = '';
  private baseUrl = 'https://api.anthropic.com/v1';
  private timeoutMs = 60000;

  initialize(config: { apiKey: string; baseUrl?: string; timeout?: number }): void {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? this.baseUrl;
    this.timeoutMs = config.timeout ?? this.timeoutMs;
  }

  isAvailable(): boolean {
    return this.apiKey.length > 0;
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const start = Date.now();
    const config = getModelConfig(request.model);

    const body = this.buildRequestBody(request, false);
    const response = await this.fetch('/messages', body);
    const data = await response.json();

    const latencyMs = Date.now() - start;
    const usage = costTracker.trackUsage(
      request.model,
      data.usage?.input_tokens ?? 0,
      data.usage?.output_tokens ?? 0
    );

    const content = data.content?.map((c: { text: string }) => c.text).join('') ?? '';

    return {
      content,
      model: request.model,
      provider: this.name,
      usage,
      latencyMs,
      finishReason: data.stop_reason === 'end_turn' ? 'stop' : data.stop_reason ?? 'stop',
    };
  }

  async *stream(request: AIRequest): AsyncGenerator<StreamChunk> {
    const start = Date.now();
    const body = this.buildRequestBody(request, true);

    const response = await this.fetch('/messages', body);
    if (!response.body) {
      yield { type: 'error', error: 'No response body' };
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let inputTokens = 0;
    let outputTokens = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const dataStr = trimmed.slice(6);

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              outputTokens++;
              yield { type: 'content', content: parsed.delta.text };
            }
            if (parsed.type === 'message_start' && parsed.message?.usage) {
              inputTokens = parsed.message.usage.input_tokens ?? 0;
            }
            if (parsed.type === 'message_delta' && parsed.usage) {
              outputTokens = parsed.usage.output_tokens ?? outputTokens;
            }
            if (parsed.type === 'message_stop') {
              yield { type: 'done', usage: costTracker.trackUsage(request.model, inputTokens, outputTokens) };
              return;
            }
          } catch {
            // skip malformed JSON
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const response = await this.fetch('/models', undefined, 'GET');
      return response.ok;
    } catch {
      return false;
    }
  }

  private buildRequestBody(request: AIRequest, stream: boolean): Record<string, unknown> {
    const config = getModelConfig(request.model);
    const systemMessages = request.messages.filter((m) => m.role === 'system');

    return {
      model: request.model,
      messages: request.messages.filter((m) => m.role !== 'system').map((m) => ({
        role: m.role,
        content: m.content,
      })),
      system: request.systemPrompt ?? systemMessages.map((m) => m.content).join('\n'),
      max_tokens: request.maxTokens ?? config.maxTokens,
      temperature: request.temperature ?? config.temperature,
      stream,
    };
  }

  private async fetch(path: string, body?: Record<string, unknown>, method = 'POST'): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        logger.error('Anthropic API error', { status: response.status, body: errorBody });
        throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
      }

      return response;
    } finally {
      clearTimeout(timeout);
    }
  }
}
