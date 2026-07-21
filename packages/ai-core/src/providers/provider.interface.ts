import type { AIRequest, AIResponse, StreamChunk, AIModel, AIProvider, AIProviderConfig } from '../types';

export interface AIProviderInterface {
  readonly name: AIProvider;
  readonly supportedModels: AIModel[];

  initialize(config: AIProviderConfig): void;
  isAvailable(): boolean;
  generate(request: AIRequest): Promise<AIResponse>;
  stream(request: AIRequest): AsyncGenerator<StreamChunk>;
  validateApiKey(): Promise<boolean>;
}
