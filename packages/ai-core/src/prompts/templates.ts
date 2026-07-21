import { promptManager } from './prompt-manager';
import type { PromptTemplate } from '../types';

const seoTemplates: PromptTemplate[] = [
  {
    id: 'seo:page-analysis',
    name: 'Page SEO Analysis',
    version: 1,
    template: `You are an expert SEO analyst. Analyze the following page content and provide a comprehensive SEO analysis.

Title: {{title}}
URL: {{url}}
Content: {{content}}

Provide analysis of:
1. Title tag optimization (length, keyword presence, branding)
2. Meta description quality
3. Heading structure (H1-H6 hierarchy)
4. Keyword usage and density
5. Content quality and readability
6. Internal and external linking
7. Image alt text usage
8. Overall recommendations

Format your response as structured JSON with sections: score (0-100), titleAnalysis, metaAnalysis, headingAnalysis, keywordAnalysis, contentQuality, linkingAnalysis, imageAnalysis, recommendations.`,
    variables: ['title', 'url', 'content'],
    tags: ['seo', 'analysis', 'page'],
  },
  {
    id: 'seo:keyword-research',
    name: 'Keyword Research & Analysis',
    version: 1,
    template: `You are an expert keyword researcher. Analyze these keywords for SEO optimization.

Project Domain: {{domain}}
Keywords: {{keywords}}
Target Audience: {{audience}}

For each keyword, provide:
1. Search intent (informational, navigational, commercial, transactional)
2. Related long-tail variations
3. Content type recommendations
4. SERP feature opportunities

Format as JSON array with fields: keyword, intent, variations[], contentTypes[], serpFeatures[], difficulty (1-100).`,
    variables: ['domain', 'keywords', 'audience'],
    tags: ['seo', 'keywords', 'research'],
  },
  {
    id: 'seo:content-optimization',
    name: 'Content SEO Optimization',
    version: 1,
    template: `You are an expert SEO content strategist. Optimize the following content for the target keyword.

Target Keyword: {{keyword}}
Current Content: {{content}}
Content Type: {{type}}
Word Count: {{wordCount}}

Provide:
1. Optimized meta title (50-60 chars)
2. Optimized meta description (150-160 chars)
3. Keyword placement suggestions
4. Content structure improvements
5. Internal linking opportunities
6. Readability improvements
7. Schema markup recommendations

Format as JSON with fields: metaTitle, metaDescription, keywordPlacements, structureImprovements[], linkingOpportunities[], readabilityScore, schemaRecommendations.`,
    variables: ['keyword', 'content', 'type', 'wordCount'],
    tags: ['seo', 'content', 'optimization'],
  },
  {
    id: 'seo:competitor-analysis',
    name: 'Competitor SEO Analysis',
    version: 1,
    template: `You are an expert competitive intelligence analyst. Compare the SEO profiles of these URLs.

Target URL: {{targetUrl}}
Competitor URLs: {{competitorUrls}}

Analyze:
1. Keyword overlap and gaps
2. Content quality comparison
3. Technical SEO comparison
4. Backlink profile comparison (if available)
5. SERP feature presence
6. Recommended actions

Format as JSON with fields: keywordOverlap, contentComparison, technicalComparison, serpFeatures, actionItems[].`,
    variables: ['targetUrl', 'competitorUrls'],
    tags: ['seo', 'competitor', 'analysis'],
  },
  {
    id: 'chat:seo-advisor',
    name: 'SEO Advisor Chat',
    version: 1,
    template: `You are an expert SEO advisor for the Lade Stack platform. Answer the user's SEO-related question concisely and provide actionable advice. If the question is about specific data from their project, ask them to reference it. Keep responses practical and data-driven.

Project Context (if available):
- Domain: {{domain}}
- Project Name: {{projectName}}

Question: {{question}}

Provide a clear, structured answer with actionable steps where applicable.`,
    variables: ['domain', 'projectName', 'question'],
    tags: ['chat', 'seo', 'advisor'],
  },
  {
    id: 'analysis:report',
    name: 'SEO Report Generation',
    version: 1,
    template: `You are an expert SEO reporting analyst. Generate a comprehensive SEO report based on the following analysis data.

Project: {{projectName}}
Domain: {{domain}}
Period: {{period}}
Key Findings: {{findings}}
Issues: {{issues}}
Metrics: {{metrics}}

Generate:
1. Executive summary
2. Score overview
3. Critical issues (top 5)
4. Recommendations by priority
5. Action plan

Format as JSON with fields: executiveSummary, overallScore, scoreBreakdown, criticalIssues[], recommendations[], actionPlan[].`,
    variables: ['projectName', 'domain', 'period', 'findings', 'issues', 'metrics'],
    tags: ['analysis', 'report', 'seo'],
  },
];

export function registerPrompts(): void {
  promptManager.registerMany(seoTemplates);
}
