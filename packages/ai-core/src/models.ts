import type { ModelConfig, AIModel } from './types';

export const MODEL_REGISTRY: Record<AIModel, ModelConfig> = {
  'gpt-4o': {
    model: 'gpt-4o',
    provider: 'openai',
    maxTokens: 16384,
    temperature: 0.7,
    topP: 1,
    capabilities: ['chat', 'streaming', 'function-calling', 'vision', 'structured-output'],
    contextWindow: 128000,
    costPer1kInputTokens: 0.005,
    costPer1kOutputTokens: 0.015,
  },
  'gpt-4o-mini': {
    model: 'gpt-4o-mini',
    provider: 'openai',
    maxTokens: 16384,
    temperature: 0.7,
    topP: 1,
    capabilities: ['chat', 'streaming', 'function-calling', 'vision', 'structured-output'],
    contextWindow: 128000,
    costPer1kInputTokens: 0.00015,
    costPer1kOutputTokens: 0.0006,
  },
  'claude-3.5-sonnet': {
    model: 'claude-3.5-sonnet',
    provider: 'anthropic',
    maxTokens: 8192,
    temperature: 0.7,
    topP: 1,
    capabilities: ['chat', 'streaming', 'function-calling', 'vision'],
    contextWindow: 200000,
    costPer1kInputTokens: 0.003,
    costPer1kOutputTokens: 0.015,
  },
  'claude-3.5-haiku': {
    model: 'claude-3.5-haiku',
    provider: 'anthropic',
    maxTokens: 4096,
    temperature: 0.7,
    topP: 1,
    capabilities: ['chat', 'streaming', 'function-calling', 'vision'],
    contextWindow: 200000,
    costPer1kInputTokens: 0.00025,
    costPer1kOutputTokens: 0.00125,
  },
  'perplexity-sonar': {
    model: 'perplexity-sonar',
    provider: 'perplexity',
    maxTokens: 8192,
    temperature: 0.7,
    topP: 1,
    capabilities: ['chat', 'streaming', 'web-search'],
    contextWindow: 128000,
    costPer1kInputTokens: 0.001,
    costPer1kOutputTokens: 0.001,
  },
  'custom': {
    model: 'custom',
    provider: 'custom',
    maxTokens: 4096,
    temperature: 0.7,
    topP: 1,
    capabilities: ['chat', 'streaming'],
    contextWindow: 32768,
    costPer1kInputTokens: 0,
    costPer1kOutputTokens: 0,
  },
};

export function getModelConfig(model: AIModel): ModelConfig {
  const config = MODEL_REGISTRY[model];
  if (!config) {
    throw new Error(`Unknown model: ${model}`);
  }
  return config;
}
