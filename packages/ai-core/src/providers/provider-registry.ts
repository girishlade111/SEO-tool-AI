import type { AIModel, AIProviderConfig, AIRequest, AIResponse, StreamChunk } from '../types';
import type { AIProviderInterface } from './provider.interface';
import { OpenAIProvider } from './openai.provider';
import { AnthropicProvider } from './anthropic.provider';
import { getModelConfig } from '../models';
import { logger } from '@lade/config';

export class ProviderRegistry {
  private providers: Map<string, AIProviderInterface> = new Map();

  constructor() {
    this.register(new OpenAIProvider());
    this.register(new AnthropicProvider());
  }

  register(provider: AIProviderInterface): void {
    this.providers.set(provider.name, provider);
    logger.info('Provider registered', { name: provider.name });
  }

  getProvider(model: AIModel): AIProviderInterface {
    const config = getModelConfig(model);
    const provider = this.providers.get(config.provider);
    if (!provider) {
      throw new Error(`No provider found for model: ${model}`);
    }
    return provider;
  }

  initializeProvider(providerName: string, config: AIProviderConfig): void {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Unknown provider: ${providerName}`);
    }
    provider.initialize(config);
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const provider = this.getProvider(request.model);
    return provider.generate(request);
  }

  async *stream(request: AIRequest): AsyncGenerator<StreamChunk> {
    const provider = this.getProvider(request.model);
    yield* provider.stream(request);
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.values())
      .filter((p) => p.isAvailable())
      .map((p) => p.name);
  }
}

export const providerRegistry = new ProviderRegistry();
