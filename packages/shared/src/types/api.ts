export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ValidationDetail[];
  requestId?: string;
}

export interface ValidationDetail {
  field: string;
  message: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Auth
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: import('./models').User;
}

// Project
export interface CreateProjectRequest {
  name: string;
  domain: string;
  description?: string;
  settings?: Partial<import('./models').ProjectSettings>;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  settings?: Partial<import('./models').ProjectSettings>;
}

// Analysis
export interface TriggerAnalysisRequest {
  type: import('./models').AnalysisType;
  pages?: string[];
  options?: {
    deepCrawl?: boolean;
    checkAccessibility?: boolean;
    checkPerformance?: boolean;
    checkSchema?: boolean;
  };
}

// Keywords
export interface KeywordResearchRequest {
  keywords: string[];
  location?: string;
  language?: string;
}

export interface KeywordClusterRequest {
  keywords: string[];
  clusterName: string;
}

export interface AddKeywordsRequest {
  keywords: Array<{
    keyword: string;
    intent?: import('./models').SearchIntent;
  }>;
}

// Content
export interface CreateContentRequest {
  type: import('./models').ContentType;
  title: string;
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
  targetKeyword?: string;
}

export interface UpdateContentRequest {
  title?: string;
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
  targetKeyword?: string;
  status?: import('./models').ContentStatus;
}

// AI
export interface AiChatRequest {
  conversationId?: string;
  projectId?: string;
  message: string;
  model?: import('./models').AiModel;
}

export interface AiGenerateRequest {
  type: import('./models').AiGenerationType;
  projectId: string;
  prompt: string;
  model?: import('./models').AiModel;
  options?: {
    tone?: string;
    wordCount?: number;
    language?: string;
    includeSchema?: boolean;
  };
}

// Reports
export interface GenerateReportRequest {
  name: string;
  type: import('./models').ReportType;
  config: import('./models').ReportConfig;
  schedule?: import('./models').ReportSchedule;
}

// Billing
export interface ChangePlanRequest {
  plan: import('./models').PlanType;
  paymentMethodId?: string;
}

export interface UpdateSubscriptionRequest {
  plan?: import('./models').PlanType;
}

// Admin
export interface UpdateUserRequest {
  name?: string;
  role?: import('./models').UserRole;
  status?: import('./models').UserStatus;
}

export interface UpdateFeatureFlagRequest {
  enabled?: boolean;
  rules?: Record<string, unknown>;
}

// Notifications
export interface UpdateNotificationPreferences {
  emailReports: boolean;
  emailAlerts: boolean;
  emailBilling: boolean;
  inAppAll: boolean;
}

// Webhook payloads (from Stripe)
export interface StripeWebhookPayload {
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}
