export type AIModel = 
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'claude-3.5-sonnet'
  | 'claude-3.5-haiku'
  | 'perplexity-sonar'
  | 'custom';

export type AIProvider = 'openai' | 'anthropic' | 'perplexity' | 'custom';

export type AICapability = 
  | 'chat'
  | 'streaming'
  | 'function-calling'
  | 'vision'
  | 'structured-output'
  | 'web-search';

export interface ModelConfig {
  model: AIModel;
  provider: AIProvider;
  maxTokens: number;
  temperature: number;
  topP: number;
  capabilities: AICapability[];
  contextWindow: number;
  costPer1kInputTokens: number;
  costPer1kOutputTokens: number;
}

export interface AIRequest {
  model: AIModel;
  messages: AIMessage[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  functions?: AIFunction[];
  responseFormat?: 'text' | 'json' | 'markdown';
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  toolCallId?: string;
}

export interface AIFunction {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface AIResponse {
  content: string;
  model: AIModel;
  provider: AIProvider;
  usage: TokenUsage;
  latencyMs: number;
  finishReason: 'stop' | 'length' | 'tool_calls' | 'error';
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

export interface AIProviderConfig {
  apiKey: string;
  baseUrl?: string;
  defaultModel?: AIModel;
  timeout?: number;
  maxRetries?: number;
}

export type StreamChunk = {
  type: 'content' | 'tool_call' | 'error' | 'done';
  content?: string;
  toolName?: string;
  toolArgs?: string;
  error?: string;
  usage?: TokenUsage;
};

export interface PromptTemplate {
  id: string;
  name: string;
  version: number;
  template: string;
  variables: string[];
  model?: AIModel;
  temperature?: number;
  maxTokens?: number;
  tags: string[];
}
