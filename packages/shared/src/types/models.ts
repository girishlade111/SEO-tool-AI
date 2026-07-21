// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'inactive';

// Project types
export interface Project {
  id: string;
  name: string;
  domain: string;
  description: string | null;
  settings: ProjectSettings;
  status: ProjectStatus;
  userId: string;
  lastAnalyzedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type ProjectStatus = 'active' | 'archived' | 'deleted';

export interface ProjectSettings {
  crawlDepth: number;
  maxPages: number;
  checkInterval: 'daily' | 'weekly' | 'monthly';
  excludedPaths: string[];
  includePaths: string[];
  respectRobotsTxt: boolean;
  followRedirects: boolean;
  userAgent: string;
  throttleDelay: number;
}

export type ProjectMemberRole = 'owner' | 'editor' | 'viewer';

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectMemberRole;
  createdAt: string;
  updatedAt: string;
}

// Analysis types
export type AnalysisType = 'full' | 'quick' | 'scheduled';
export type AnalysisStatus = 'queued' | 'running' | 'completed' | 'failed';
export type AnalysisTrigger = 'manual' | 'scheduled' | 'webhook';

export interface Analysis {
  id: string;
  projectId: string;
  type: AnalysisType;
  status: AnalysisStatus;
  trigger: AnalysisTrigger;
  pagesAnalyzed: number;
  issuesFound: number;
  overallScore: number | null;
  summary: AnalysisSummary | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisSummary {
  averageScore: number;
  criticalIssues: number;
  warnings: number;
  passed: number;
  topIssues: IssueSummary[];
  scoreBreakdown: Record<string, number>;
}

export interface IssueSummary {
  code: string;
  message: string;
  count: number;
  impact: number;
}

export type IssueType = 'error' | 'warning' | 'info';
export type IssueCategory = 'meta' | 'heading' | 'image' | 'link' | 'perf' | 'schema' | 'a11y' | 'content' | 'technical';

export interface PageIssue {
  id: string;
  pageAnalysisId: string;
  type: IssueType;
  category: IssueCategory;
  code: string;
  message: string;
  selector: string | null;
  recommendation: string;
  impact: number;
  createdAt: string;
}

export interface Page {
  id: string;
  projectId: string;
  url: string;
  title: string | null;
  statusCode: number | null;
  contentType: string | null;
  wordCount: number | null;
  checksum: string | null;
  lastCrawledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PageAnalysis {
  id: string;
  pageId: string;
  analysisId: string;
  score: number;
  meta: PageMeta;
  headings: HeadingAnalysis;
  images: ImageAnalysis;
  links: LinkAnalysis;
  performance: PerformanceData;
  structuredData: StructuredDataAnalysis;
  accessibility: AccessibilityData;
  content: ContentAnalysis;
  createdAt: string;
}

export interface PageMeta {
  title: string | null;
  titleLength: number;
  description: string | null;
  descriptionLength: number;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterCard: string | null;
  canonical: string | null;
  robots: string | null;
  hasMetaTitle: boolean;
  hasMetaDescription: boolean;
  titleLengthOptimal: boolean;
  descriptionLengthOptimal: boolean;
}

export interface HeadingAnalysis {
  h1Count: number;
  h2Count: number;
  h3Count: number;
  h1Missing: boolean;
  multipleH1: boolean;
  headingStructure: boolean;
  headings: string[];
}

export interface ImageAnalysis {
  totalImages: number;
  imagesWithAlt: number;
  imagesWithoutAlt: number;
  largeImages: number;
  missingAltText: string[];
}

export interface LinkAnalysis {
  totalLinks: number;
  internalLinks: number;
  externalLinks: number;
  brokenLinks: number;
  brokenLinkUrls: string[];
  noFollowCount: number;
}

export interface PerformanceData {
  loadTime: number | null;
  ttfb: number | null;
  lcp: number | null;
  cls: number | null;
  inp: number | null;
  mobileScore: number | null;
  desktopScore: number | null;
}

export interface StructuredDataAnalysis {
  hasStructuredData: boolean;
  types: string[];
  validCount: number;
  errorCount: number;
  errors: string[];
}

export interface AccessibilityData {
  score: number;
  issues: number;
  missingAltText: number;
  lowContrast: number;
  missingLabels: number;
  missingLang: boolean;
}

export interface ContentAnalysis {
  wordCount: number;
  readabilityScore: number;
  readabilityLevel: string;
  keywordDensity: Record<string, number>;
  averageSentenceLength: number;
  paragraphCount: number;
  containsMedia: boolean;
  videoCount: number;
}

// Keyword types
export type SearchIntent = 'informational' | 'navigational' | 'commercial' | 'transactional';

export interface Keyword {
  id: string;
  projectId: string;
  keyword: string;
  intent: SearchIntent;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  competition: number;
  serpFeatures: string[];
  createdAt: string;
  updatedAt: string;
}

export interface KeywordCluster {
  id: string;
  projectId: string;
  name: string;
  keywords: string[];
  topic: string;
  totalVolume: number;
  avgDifficulty: number;
  createdAt: string;
}

export interface KeywordRanking {
  id: string;
  keywordId: string;
  position: number;
  url: string;
  searchEngine: SearchEngine;
  location: string;
  trackedAt: string;
  createdAt: string;
}

export type SearchEngine = 'google' | 'bing' | 'chatgpt' | 'perplexity';

// Content types
export type ContentType = 'blog' | 'landing' | 'product' | 'schema' | 'social' | 'meta';
export type ContentStatus = 'draft' | 'published' | 'archived';

export interface Content {
  id: string;
  projectId: string;
  type: ContentType;
  title: string;
  slug: string;
  status: ContentStatus;
  content: string;
  metaTitle: string;
  metaDescription: string;
  targetKeyword: string | null;
  seoScore: ContentSeoScore | null;
  overallScore: number | null;
  createdBy: string;
  updatedBy: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContentSeoScore {
  overall: number;
  title: number;
  description: number;
  headings: number;
  keywords: number;
  readability: number;
  links: number;
  images: number;
  structure: number;
}

export interface ContentVersion {
  id: string;
  contentId: string;
  version: number;
  content: string;
  metaTitle: string;
  metaDescription: string;
  changeNote: string | null;
  createdBy: string;
  createdAt: string;
}

// Competitor types
export interface Competitor {
  id: string;
  projectId: string;
  domain: string;
  name: string;
  metrics: CompetitorMetrics | null;
  lastAnalyzedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompetitorMetrics {
  estimatedTraffic: number;
  estimatedKeywords: number;
  domainAuthority: number;
  pageAuthority: number;
  linkingDomains: number;
  topKeywords: string[];
}

// AI types
export type AiModel = 'gpt-4o' | 'gpt-4o-mini' | 'claude-sonnet-4' | 'claude-opus-4' | 'gemini-2-pro' | 'gemini-2-flash';
export type AiProvider = 'openai' | 'anthropic' | 'google';
export type AiGenerationType = 'blog' | 'meta' | 'schema' | 'landing' | 'faq' | 'social';

export interface AiConversation {
  id: string;
  userId: string;
  projectId: string | null;
  title: string;
  model: string;
  messageCount: number;
  tokenCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AiMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: Record<string, unknown>;
  tokenCount: number;
  createdAt: string;
}

export interface AiContentGeneration {
  id: string;
  userId: string;
  projectId: string;
  type: AiGenerationType;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  prompt: string;
  result: string | null;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  latency: number | null;
  createdAt: string;
  completedAt: string | null;
}

// Billing types
export type PlanType = 'free' | 'pro' | 'business' | 'enterprise';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'expired' | 'trialing';
export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';

export interface Subscription {
  id: string;
  userId: string;
  plan: PlanType;
  status: SubscriptionStatus;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  maxProjects: number;
  maxPagesPerProject: number;
  maxKeywords: number;
  aiCredits: number;
  apiCallsLimit: number;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  userId: string;
  subscriptionId: string;
  stripeInvoiceId: string;
  status: InvoiceStatus;
  amount: number;
  amountPaid: number;
  tax: number;
  currency: string;
  invoiceUrl: string | null;
  dueDate: string;
  paidAt: string | null;
  createdAt: string;
}

export interface UsageRecord {
  id: string;
  userId: string;
  type: UsageType;
  quantity: number;
  description: string;
  createdAt: string;
}

export type UsageType = 'ai_credit' | 'api_call' | 'page_analysis' | 'report';

// Report types
export type ReportType = 'pdf' | 'csv' | 'xlsx' | 'html';
export type ReportStatus = 'generating' | 'completed' | 'failed';
export type ReportSchedule = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Report {
  id: string;
  projectId: string;
  name: string;
  type: ReportType;
  status: ReportStatus;
  config: ReportConfig;
  fileUrl: string | null;
  schedule: ReportSchedule;
  lastGeneratedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReportConfig {
  sections: string[];
  dateRange: 'last7' | 'last30' | 'last90' | 'custom';
  includeCharts: boolean;
  includeRecommendations: boolean;
  includeCompetitors: boolean;
  branding: ReportBranding;
}

export interface ReportBranding {
  logoUrl: string | null;
  primaryColor: string;
  companyName: string;
  companyWebsite: string;
}

// Notification types
export type NotificationType = 'alert' | 'report' | 'billing' | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

// Admin types
export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rules: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  projectId: string | null;
  action: string;
  entity: string;
  entityId: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

// Session
export interface Session {
  id: string;
  userId: string;
  token: string;
  ipAddress: string;
  userAgent: string;
  expiresAt: string;
  createdAt: string;
  revokedAt: string | null;
}

// API Key
export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  key: string;
  permissions: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  revokedAt: string | null;
}

// Payment Method
export interface PaymentMethod {
  id: string;
  userId: string;
  stripePaymentMethodId: string;
  type: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  createdAt: string;
}
