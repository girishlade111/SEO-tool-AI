import type { PromptTemplate } from '../types';

export interface PromptRenderResult {
  rendered: string;
  variableCount: number;
}

export class PromptManager {
  private templates: Map<string, PromptTemplate> = new Map();

  register(template: PromptTemplate): void {
    this.templates.set(template.id, template);
  }

  registerMany(templates: PromptTemplate[]): void {
    for (const template of templates) {
      this.register(template);
    }
  }

  get(id: string): PromptTemplate | undefined {
    return this.templates.get(id);
  }

  render(id: string, variables: Record<string, string>): PromptRenderResult {
    const template = this.get(id);
    if (!template) {
      throw new Error(`Template not found: ${id}`);
    }

    let rendered = template.template;
    const matchedVars = new Set<string>();

    for (const key of template.variables) {
      const value = variables[key];
      if (value !== undefined) {
        rendered = rendered.replaceAll(`{{${key}}}`, value);
        matchedVars.add(key);
      }
    }

    return {
      rendered,
      variableCount: matchedVars.size,
    };
  }

  findByTag(tag: string): PromptTemplate[] {
    const results: PromptTemplate[] = [];
    for (const template of this.templates.values()) {
      if (template.tags.includes(tag)) {
        results.push(template);
      }
    }
    return results;
  }

  list(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }
}

export const promptManager = new PromptManager();
