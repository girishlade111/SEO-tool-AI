import type { AIRequest, AIResponse, StreamChunk, AIModel, AIProviderConfig } from '../types';

export interface AIProviderInterface {
  readonly name: string;
  readonly supportedModels: AIModel[];

  initialize(config: AIProviderConfig): void;
  isAvailable(): boolean;
  generate(request: AIRequest): Promise<AIResponse>;
  stream(request: AIRequest): AsyncGenerator<StreamChunk>;
  validateApiKey(): Promise<boolean>;
}
