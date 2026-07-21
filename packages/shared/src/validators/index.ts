import { z } from 'zod';

// Auth validators
export const registerSchema = z.object({
  email: z.string().email('Invalid email format').max(255),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  name: z.string().min(1, 'Name is required').max(100),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128),
});

// Project validators
export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(200),
  domain: z
    .string()
    .min(1, 'Domain is required')
    .max(500)
    .regex(
      /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w\-./?%&=]*)?$/,
      'Invalid domain format'
    ),
  description: z.string().max(2000).optional(),
  settings: z
    .object({
      crawlDepth: z.number().int().min(1).max(10).optional(),
      maxPages: z.number().int().min(1).max(100000).optional(),
      checkInterval: z.enum(['daily', 'weekly', 'monthly']).optional(),
      excludedPaths: z.array(z.string()).optional(),
      includePaths: z.array(z.string()).optional(),
      respectRobotsTxt: z.boolean().optional(),
      followRedirects: z.boolean().optional(),
      userAgent: z.string().optional(),
      throttleDelay: z.number().int().min(0).max(10000).optional(),
    })
    .optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  settings: z
    .object({
      crawlDepth: z.number().int().min(1).max(10).optional(),
      maxPages: z.number().int().min(1).max(100000).optional(),
      checkInterval: z.enum(['daily', 'weekly', 'monthly']).optional(),
      excludedPaths: z.array(z.string()).optional(),
      includePaths: z.array(z.string()).optional(),
      respectRobotsTxt: z.boolean().optional(),
      followRedirects: z.boolean().optional(),
      userAgent: z.string().optional(),
      throttleDelay: z.number().int().min(0).max(10000).optional(),
    })
    .optional(),
});

export const addProjectMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['owner', 'editor', 'viewer']),
});

export const updateProjectMemberSchema = z.object({
  role: z.enum(['owner', 'editor', 'viewer']),
});

// Analysis validators
export const triggerAnalysisSchema = z.object({
  type: z.enum(['full', 'quick', 'scheduled']),
  pages: z.array(z.string().url()).max(100).optional(),
  options: z
    .object({
      deepCrawl: z.boolean().optional(),
      checkAccessibility: z.boolean().optional(),
      checkPerformance: z.boolean().optional(),
      checkSchema: z.boolean().optional(),
    })
    .optional(),
});

// Keyword validators
export const keywordResearchSchema = z.object({
  keywords: z.array(z.string().min(1)).min(1).max(100),
  location: z.string().max(10).optional(),
  language: z.string().max(10).optional(),
});

export const keywordClusterSchema = z.object({
  keywords: z.array(z.string().min(1)).min(2),
  clusterName: z.string().min(1).max(200),
});

export const addKeywordsSchema = z.object({
  keywords: z
    .array(
      z.object({
        keyword: z.string().min(1),
        intent: z
          .enum(['informational', 'navigational', 'commercial', 'transactional'])
          .optional(),
      })
    )
    .min(1)
    .max(500),
});

// Content validators
export const createContentSchema = z.object({
  type: z.enum(['blog', 'landing', 'product', 'schema', 'social', 'meta']),
  title: z.string().min(1).max(500),
  content: z.string().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  targetKeyword: z.string().max(200).optional(),
});

export const updateContentSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  content: z.string().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  targetKeyword: z.string().max(200).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

// AI validators
export const aiChatSchema = z.object({
  conversationId: z.string().optional(),
  projectId: z.string().optional(),
  message: z.string().min(1).max(10000),
  model: z
    .enum([
      'gpt-4o',
      'gpt-4o-mini',
      'claude-sonnet-4',
      'claude-opus-4',
      'gemini-2-pro',
      'gemini-2-flash',
    ])
    .optional(),
});

export const aiGenerateSchema = z.object({
  type: z.enum(['blog', 'meta', 'schema', 'landing', 'faq', 'social']),
  projectId: z.string().min(1),
  prompt: z.string().min(1).max(5000),
  model: z
    .enum([
      'gpt-4o',
      'gpt-4o-mini',
      'claude-sonnet-4',
      'claude-opus-4',
      'gemini-2-pro',
      'gemini-2-flash',
    ])
    .optional(),
  options: z
    .object({
      tone: z.string().optional(),
      wordCount: z.number().int().min(100).max(10000).optional(),
      language: z.string().optional(),
      includeSchema: z.boolean().optional(),
    })
    .optional(),
});

// Report validators
export const generateReportSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(['pdf', 'csv', 'xlsx', 'html']),
  config: z.object({
    sections: z.array(z.string()).min(1),
    dateRange: z.enum(['last7', 'last30', 'last90', 'custom']),
    includeCharts: z.boolean(),
    includeRecommendations: z.boolean(),
    includeCompetitors: z.boolean(),
    branding: z.object({
      logoUrl: z.string().url().nullable(),
      primaryColor: z.string(),
      companyName: z.string().max(200),
      companyWebsite: z.string().url(),
    }),
  }),
  schedule: z.enum(['none', 'daily', 'weekly', 'monthly']).optional(),
});

// Billing validators
export const changePlanSchema = z.object({
  plan: z.enum(['free', 'pro', 'business', 'enterprise']),
  paymentMethodId: z.string().optional(),
});

// Admin validators
export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.enum(['user', 'admin']).optional(),
  status: z.enum(['active', 'suspended', 'inactive']).optional(),
});

export const updateFeatureFlagSchema = z.object({
  enabled: z.boolean().optional(),
  rules: z.record(z.unknown()).optional(),
});

// Notification preferences
export const notificationPreferencesSchema = z.object({
  emailReports: z.boolean(),
  emailAlerts: z.boolean(),
  emailBilling: z.boolean(),
  inAppAll: z.boolean(),
});

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

// Settings update
export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
});

export const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
});
