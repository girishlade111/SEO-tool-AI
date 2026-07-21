import type { AIRequest, AIResponse, AIMessage, StreamChunk, AIProvider, AIModel } from '../types';
import type { AIProviderInterface } from './provider.interface';
import { getModelConfig } from '../models';
import { costTracker } from '../cost-tracker';
import { logger } from '@lade/config';

export class OpenAIProvider implements AIProviderInterface {
  readonly name: AIProvider = 'openai';
  readonly supportedModels: AIModel[] = ['gpt-4o', 'gpt-4o-mini'];
  private apiKey = '';
  private baseUrl = 'https://api.openai.com/v1';
  private timeoutMs = 30000;

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
    const response = await this.fetch('/chat/completions', body);
    const data = await response.json();

    const latencyMs = Date.now() - start;
    const usage = costTracker.trackUsage(
      request.model,
      data.usage?.prompt_tokens ?? 0,
      data.usage?.completion_tokens ?? 0
    );

    return {
      content: data.choices?.[0]?.message?.content ?? '',
      model: request.model,
      provider: this.name,
      usage,
      latencyMs,
      finishReason: data.choices?.[0]?.finish_reason ?? 'stop',
    };
  }

  async *stream(request: AIRequest): AsyncGenerator<StreamChunk> {
    const start = Date.now();
    const config = getModelConfig(request.model);
    const body = this.buildRequestBody(request, true);

    const response = await this.fetch('/chat/completions', body);
    if (!response.body) {
      yield { type: 'error', error: 'No response body' };
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let promptTokens = 0;
    let completionTokens = 0;

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
          const data = trimmed.slice(6);
          if (data === '[DONE]') {
            yield { type: 'done', usage: costTracker.trackUsage(request.model, promptTokens, completionTokens) };
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta;
            if (delta?.content) {
              completionTokens++;
              yield { type: 'content', content: delta.content };
            }
            if (parsed.usage) {
              promptTokens = parsed.usage.prompt_tokens ?? promptTokens;
              completionTokens = parsed.usage.completion_tokens ?? completionTokens;
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
    const messages: AIMessage[] = [];

    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }

    messages.push(...request.messages);

    return {
      model: request.model,
      messages,
      temperature: request.temperature ?? config.temperature,
      max_tokens: request.maxTokens ?? config.maxTokens,
      top_p: config.topP,
      stream,
      response_format: request.responseFormat === 'json' ? { type: 'json_object' } : undefined,
      tools: request.functions?.map((fn) => ({
        type: 'function',
        function: { name: fn.name, description: fn.description, parameters: fn.parameters },
      })),
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
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        logger.error('OpenAI API error', { status: response.status, body: errorBody });
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      return response;
    } finally {
      clearTimeout(timeout);
    }
  }
}
