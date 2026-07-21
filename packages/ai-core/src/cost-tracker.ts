import type { TokenUsage, AIModel } from './types';
import { getModelConfig } from './models';
import { logger } from '@lade/config';

export class CostTracker {
  private sessionCost: number = 0;
  private totalPromptTokens: number = 0;
  private totalCompletionTokens: number = 0;

  calculateCost(model: AIModel, promptTokens: number, completionTokens: number): TokenUsage {
    const config = getModelConfig(model);
    const inputCost = (promptTokens / 1000) * config.costPer1kInputTokens;
    const outputCost = (completionTokens / 1000) * config.costPer1kOutputTokens;
    const estimatedCost = inputCost + outputCost;

    return {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      estimatedCost,
    };
  }

  trackUsage(model: AIModel, promptTokens: number, completionTokens: number): TokenUsage {
    const usage = this.calculateCost(model, promptTokens, completionTokens);
    this.sessionCost += usage.estimatedCost;
    this.totalPromptTokens += promptTokens;
    this.totalCompletionTokens += completionTokens;
    return usage;
  }

  getSessionStats() {
    return {
      sessionCost: this.sessionCost,
      totalPromptTokens: this.totalPromptTokens,
      totalCompletionTokens: this.totalCompletionTokens,
      totalTokens: this.totalPromptTokens + this.totalCompletionTokens,
    };
  }

  reset(): void {
    this.sessionCost = 0;
    this.totalPromptTokens = 0;
    this.totalCompletionTokens = 0;
  }
}

export const costTracker = new CostTracker();
