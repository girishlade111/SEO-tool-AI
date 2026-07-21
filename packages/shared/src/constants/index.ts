export const APP_NAME = 'Lade Stack AI SEO Copilot';
export const APP_DOMAIN = 'ladestack.com';
export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;

export const PLANS = {
  free: {
    name: 'Free',
    maxProjects: 1,
    maxPagesPerProject: 100,
    maxKeywords: 50,
    aiCredits: 10,
    apiCallsLimit: 100,
    priceMonthly: 0,
    priceYearly: 0,
  },
  pro: {
    name: 'Pro',
    maxProjects: 10,
    maxPagesPerProject: 5000,
    maxKeywords: 1000,
    aiCredits: 500,
    apiCallsLimit: 10000,
    priceMonthly: 29,
    priceYearly: 290,
  },
  business: {
    name: 'Business',
    maxProjects: 50,
    maxPagesPerProject: 50000,
    maxKeywords: 10000,
    aiCredits: 5000,
    apiCallsLimit: 100000,
    priceMonthly: 99,
    priceYearly: 990,
  },
  enterprise: {
    name: 'Enterprise',
    maxProjects: -1,
    maxPagesPerProject: -1,
    maxKeywords: -1,
    aiCredits: -1,
    apiCallsLimit: -1,
    priceMonthly: -1,
    priceYearly: -1,
  },
} as const;

export const AI_MODEL_COSTS: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 0.0000025, output: 0.00001 },
  'gpt-4o-mini': { input: 0.00000015, output: 0.0000006 },
  'claude-sonnet-4': { input: 0.000003, output: 0.000015 },
  'claude-opus-4': { input: 0.000015, output: 0.000075 },
  'gemini-2-pro': { input: 0.00000125, output: 0.000005 },
  'gemini-2-flash': { input: 0.0000001, output: 0.0000004 },
} as const;

export const SEARCH_ENGINES = ['google', 'bing', 'chatgpt', 'perplexity'] as const;

export const ISSUE_CATEGORIES = [
  'meta', 'heading', 'image', 'link', 'perf', 'schema', 'a11y', 'content', 'technical',
] as const;

export const PAGINATION_DEFAULTS = {
  page: 1,
  pageSize: 50,
  maxPageSize: 100,
} as const;

export const RATE_LIMITS = {
  general: { points: 100, duration: 60 },
  aiChat: { points: 20, duration: 60 },
  aiGeneration: { points: 50, duration: 3600 },
  pageAnalysis: { points: 10, duration: 3600 },
  crawl: { points: 3, duration: 3600 },
  login: { points: 5, duration: 900 },
  register: { points: 3, duration: 3600 },
  export_: { points: 10, duration: 3600 },
} as const;
