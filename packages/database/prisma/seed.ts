import { PrismaClient } from '@prisma/client';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

function verifyPassword(password: string, hash: string): boolean {
  const [salt, key] = hash.split(':');
  const derivedKey = scryptSync(password, salt, 64);
  return timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
}

async function main() {
  console.log('Seeding database...');

  const adminPassword = hashPassword('Admin123!');
  const userPassword = hashPassword('User123!');

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ladestack.com' },
    update: {},
    create: {
      email: 'admin@ladestack.com',
      passwordHash: adminPassword,
      name: 'Admin User',
      role: 'admin',
      status: 'active',
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`Created admin user: ${adminUser.email}`);

  const testUser = await prisma.user.upsert({
    where: { email: 'user@ladestack.com' },
    update: {},
    create: {
      email: 'user@ladestack.com',
      passwordHash: userPassword,
      name: 'Test User',
      role: 'user',
      status: 'active',
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`Created test user: ${testUser.email}`);

  const project1 = await prisma.project.upsert({
    where: { id: 'project-seo-001' },
    update: {},
    create: {
      id: 'project-seo-001',
      name: 'My E-commerce Store',
      domain: 'example-store.com',
      description: 'Full SEO audit and optimization for an e-commerce store selling handmade products',
      userId: testUser.id,
      status: 'active',
      settings: {
        crawlDepth: 3,
        maxPages: 500,
        checkInterval: 'weekly',
        excludedPaths: ['/cart', '/checkout', '/account'],
        includePaths: ['/products', '/categories', '/blog'],
        respectRobotsTxt: true,
        followRedirects: true,
        userAgent: 'LadeStack-SEO-Bot/1.0',
        throttleDelay: 1000,
      },
    },
  });

  const project2 = await prisma.project.upsert({
    where: { id: 'project-saas-002' },
    update: {},
    create: {
      id: 'project-saas-002',
      name: 'SaaS Landing Pages',
      domain: 'awesome-saas.io',
      description: 'Content strategy and SEO optimization for SaaS product landing pages',
      userId: testUser.id,
      status: 'active',
      settings: {
        crawlDepth: 2,
        maxPages: 200,
        checkInterval: 'weekly',
        excludedPaths: ['/app', '/api'],
        includePaths: ['/', '/features', '/pricing', '/blog'],
        respectRobotsTxt: true,
        followRedirects: true,
        userAgent: 'LadeStack-SEO-Bot/1.0',
        throttleDelay: 500,
      },
    },
  });

  const project3 = await prisma.project.upsert({
    where: { id: 'project-blog-003' },
    update: {},
    create: {
      id: 'project-blog-003',
      name: 'Tech Blog Network',
      domain: 'techblog.example.com',
      description: 'Content optimization for a multi-author technology blog with 500+ articles',
      userId: adminUser.id,
      status: 'active',
      settings: {
        crawlDepth: 4,
        maxPages: 1000,
        checkInterval: 'daily',
        excludedPaths: ['/wp-admin'],
        includePaths: ['/articles', '/guides', '/tutorials'],
        respectRobotsTxt: true,
        followRedirects: true,
        userAgent: 'LadeStack-SEO-Bot/1.0',
        throttleDelay: 200,
      },
    },
  });

  console.log('Created 3 example projects');

  const page1 = await prisma.page.create({
    data: {
      projectId: project1.id,
      url: 'https://example-store.com',
      title: 'Handmade Products | Example Store',
      statusCode: 200,
      contentType: 'text/html',
      wordCount: 1250,
      checksum: 'a1b2c3d4e5f6',
      lastCrawledAt: new Date(),
    },
  });

  const page2 = await prisma.page.create({
    data: {
      projectId: project1.id,
      url: 'https://example-store.com/products',
      title: 'All Products | Example Store',
      statusCode: 200,
      contentType: 'text/html',
      wordCount: 850,
      checksum: 'b2c3d4e5f6a1',
      lastCrawledAt: new Date(),
    },
  });

  const page3 = await prisma.page.create({
    data: {
      projectId: project1.id,
      url: 'https://example-store.com/blog/handmade-gift-guide',
      title: 'Handmade Gift Guide for 2026 | Example Store Blog',
      statusCode: 200,
      contentType: 'text/html',
      wordCount: 2100,
      checksum: 'c3d4e5f6a1b2',
      lastCrawledAt: new Date(),
    },
  });

  console.log(`Created ${3} pages for project 1`);

  const analysis = await prisma.analysis.create({
    data: {
      projectId: project1.id,
      type: 'full',
      status: 'completed',
      trigger: 'manual',
      pagesAnalyzed: 3,
      issuesFound: 12,
      overallScore: 72,
      summary: {
        averageScore: 72,
        criticalIssues: 2,
        warnings: 6,
        passed: 4,
        topIssues: [
          { code: 'META-001', message: 'Missing meta description', count: 2, impact: 8 },
          { code: 'IMG-001', message: 'Images missing alt text', count: 5, impact: 6 },
          { code: 'HEAD-001', message: 'Multiple H1 tags', count: 1, impact: 7 },
        ],
        scoreBreakdown: {
          meta: 65,
          headings: 80,
          images: 55,
          links: 85,
          performance: 70,
          schema: 45,
          accessibility: 60,
          content: 78,
        },
      },
      completedAt: new Date(),
    },
  });
  console.log('Created sample analysis');

  const pageAnalysis1 = await prisma.pageAnalysis.create({
    data: {
      pageId: page1.id,
      analysisId: analysis.id,
      score: 75,
      meta: {
        title: 'Handmade Products | Example Store',
        titleLength: 38,
        description: null,
        descriptionLength: 0,
        ogTitle: 'Handmade Products | Example Store',
        ogDescription: 'Discover unique handmade products crafted with care',
        ogImage: 'https://example-store.com/og-image.jpg',
        twitterCard: 'summary_large_image',
        canonical: 'https://example-store.com',
        robots: 'index, follow',
        hasMetaTitle: true,
        hasMetaDescription: false,
        titleLengthOptimal: true,
        descriptionLengthOptimal: false,
      },
      headings: {
        h1Count: 2,
        h2Count: 4,
        h3Count: 8,
        h1Missing: false,
        multipleH1: true,
        headingStructure: true,
        headings: ['Welcome to Example Store', 'Featured Products', 'Shop by Category'],
      },
      images: {
        totalImages: 12,
        imagesWithAlt: 8,
        imagesWithoutAlt: 4,
        largeImages: 2,
        missingAltText: ['/images/banner.jpg', '/images/product-3.jpg'],
      },
      links: {
        totalLinks: 45,
        internalLinks: 38,
        externalLinks: 7,
        brokenLinks: 1,
        brokenLinkUrls: ['https://example-store.com/old-page'],
        noFollowCount: 3,
      },
      performance: {
        loadTime: 2.4,
        ttfb: 0.8,
        lcp: 2.1,
        cls: 0.05,
        inp: 120,
        mobileScore: 68,
        desktopScore: 85,
      },
      structuredData: {
        hasStructuredData: true,
        types: ['Organization', 'WebSite', 'Product'],
        validCount: 2,
        errorCount: 1,
        errors: ['Product schema missing price field'],
      },
      accessibility: {
        score: 60,
        issues: 8,
        missingAltText: 4,
        lowContrast: 2,
        missingLabels: 1,
        missingLang: false,
      },
      content: {
        wordCount: 1250,
        readabilityScore: 65,
        readabilityLevel: 'Standard',
        keywordDensity: { 'handmade': 0.8, 'gifts': 0.5, 'products': 1.2 },
        averageSentenceLength: 18,
        paragraphCount: 25,
        containsMedia: true,
        videoCount: 1,
      },
    },
  });

  const issues = [
    { type: 'error' as const, category: 'meta' as const, code: 'META-001', message: 'Missing meta description on homepage', selector: 'head', recommendation: 'Add a compelling meta description between 150-160 characters including target keywords', impact: 8 },
    { type: 'warning' as const, category: 'image' as const, code: 'IMG-001', message: '4 images missing alt text', selector: 'img[src="/images/banner.jpg"]', recommendation: 'Add descriptive alt text to all images for accessibility and SEO', impact: 6 },
    { type: 'warning' as const, category: 'heading' as const, code: 'HEAD-001', message: 'Multiple H1 tags found', selector: 'h1', recommendation: 'Use only one H1 tag per page for proper heading hierarchy', impact: 7 },
    { type: 'error' as const, category: 'link' as const, code: 'LINK-001', message: 'Broken link detected', selector: 'a[href="/old-page"]', recommendation: 'Fix or remove broken links to improve user experience and SEO', impact: 9 },
    { type: 'info' as const, category: 'schema' as const, code: 'SCHEMA-001', message: 'Product schema missing required fields', selector: 'script[type="application/ld+json"]', recommendation: 'Add missing price and availability fields to Product structured data', impact: 5 },
    { type: 'warning' as const, category: 'perf' as const, code: 'PERF-001', message: 'Low mobile performance score (68)', selector: 'body', recommendation: 'Optimize images, leverage browser caching, and minimize JavaScript for mobile', impact: 7 },
    { type: 'info' as const, category: 'a11y' as const, code: 'A11Y-001', message: 'Low contrast ratio on navigation links', selector: 'nav a', recommendation: 'Increase contrast ratio to at least 4.5:1 for text elements', impact: 4 },
  ];

  for (const issue of issues) {
    await prisma.pageIssue.create({
      data: {
        pageAnalysisId: pageAnalysis1.id,
        type: issue.type,
        category: issue.category,
        code: issue.code,
        message: issue.message,
        selector: issue.selector,
        recommendation: issue.recommendation,
        impact: issue.impact,
      },
    });
  }

  console.log(`Created ${issues.length} page issues`);

  const keywords = [
    { keyword: 'handmade gifts', intent: 'commercial' as const, searchVolume: 24000, difficulty: 45, cpc: 1.80, competition: 0.65 },
    { keyword: 'handmade products online', intent: 'commercial' as const, searchVolume: 18000, difficulty: 38, cpc: 1.50, competition: 0.55 },
    { keyword: 'unique gift ideas', intent: 'informational' as const, searchVolume: 32000, difficulty: 52, cpc: 2.10, competition: 0.72 },
    { keyword: 'handmade jewelry', intent: 'commercial' as const, searchVolume: 15000, difficulty: 42, cpc: 2.50, competition: 0.60 },
    { keyword: 'artisan crafts', intent: 'informational' as const, searchVolume: 8900, difficulty: 28, cpc: 1.20, competition: 0.40 },
    { keyword: 'eco friendly gifts', intent: 'commercial' as const, searchVolume: 12000, difficulty: 35, cpc: 1.90, competition: 0.50 },
    { keyword: 'buy handmade online', intent: 'transactional' as const, searchVolume: 6500, difficulty: 30, cpc: 2.30, competition: 0.45 },
    { keyword: 'handmade home decor', intent: 'commercial' as const, searchVolume: 9500, difficulty: 33, cpc: 1.70, competition: 0.48 },
    { keyword: 'what is handmade', intent: 'informational' as const, searchVolume: 4200, difficulty: 15, cpc: 0.50, competition: 0.20 },
    { keyword: 'best handmade marketplaces', intent: 'informational' as const, searchVolume: 7800, difficulty: 25, cpc: 1.00, competition: 0.35 },
  ];

  for (const kw of keywords) {
    const created = await prisma.keyword.create({
      data: {
        projectId: project1.id,
        keyword: kw.keyword,
        intent: kw.intent,
        searchVolume: kw.searchVolume,
        difficulty: kw.difficulty,
        cpc: kw.cpc,
        competition: kw.competition,
        serpFeatures: ['organic', 'featured_snippet'],
      },
    });

    await prisma.keywordRanking.create({
      data: {
        keywordId: created.id,
        position: Math.floor(Math.random() * 30) + 5,
        url: `https://example-store.com/search?q=${encodeURIComponent(kw.keyword)}`,
        searchEngine: 'google',
        location: 'US',
        trackedAt: new Date(),
      },
    });
  }
  console.log(`Created ${keywords.length} keywords with rankings`);

  const cluster = await prisma.keywordCluster.create({
    data: {
      projectId: project1.id,
      name: 'Handmade Gifts',
      keywords: ['handmade gifts', 'unique gift ideas', 'eco friendly gifts', 'artisan crafts'],
      topic: 'Handmade Gift Shopping',
      totalVolume: 76900,
      avgDifficulty: 40,
    },
  });
  console.log('Created keyword cluster');

  const content = await prisma.content.create({
    data: {
      projectId: project1.id,
      type: 'blog',
      title: 'The Ultimate Guide to Handmade Gifts in 2026',
      slug: 'ultimate-guide-handmade-gifts-2026',
      status: 'published',
      content: `# The Ultimate Guide to Handmade Gifts in 2026\n\nDiscover why handmade gifts are taking the world by storm. From personalized jewelry to custom home decor, handmade items offer a uniqueness that mass-produced gifts simply cannot match.\n\n## Why Choose Handmade?\n\nHandmade gifts come with a story. Each piece carries the care and attention of the artisan who created it, making your gift truly one-of-a-kind.\n\n### Quality and Craftsmanship\n\nWhen you buy handmade, you're investing in quality. Artisans take pride in their work, using premium materials and time-tested techniques.\n\n### Supporting Small Businesses\n\nEvery handmade purchase directly supports independent makers and their families, strengthening local economies.\n\n## Top Handmade Gift Categories\n\n1. **Handmade Jewelry** - Custom necklaces, bracelets, and rings\n2. **Home Decor** - Ceramics, candles, wall art\n3. **Apparel** - Knitted scarves, embroidered clothing\n4. **Accessories** - Leather goods, bags, belts\n\n## How to Find Quality Handmade Products\n\nLook for detailed product descriptions, customer reviews, and clear photos when shopping handmade online.\n\n## Conclusion\n\nHandmade gifts are more than presents - they're experiences wrapped in creativity and care.`,
      metaTitle: 'Ultimate Guide to Handmade Gifts 2026 | Example Store',
      metaDescription: 'Discover the best handmade gifts for 2026. From personalized jewelry to eco-friendly home decor, find unique presents that tell a story.',
      targetKeyword: 'handmade gifts',
      seoScore: {
        overall: 78,
        title: 85,
        description: 80,
        headings: 75,
        keywords: 72,
        readability: 82,
        links: 60,
        images: 50,
        structure: 90,
      },
      overallScore: 78,
      createdBy: testUser.id,
      updatedBy: testUser.id,
      publishedAt: new Date(),
    },
  });

  await prisma.contentVersion.create({
    data: {
      contentId: content.id,
      version: 1,
      content: content.content!,
      metaTitle: content.metaTitle,
      metaDescription: content.metaDescription,
      changeNote: 'Initial publication',
      createdBy: testUser.id,
    },
  });
  console.log('Created sample content with version');

  const featureFlags = [
    { name: 'ai-copilot', description: 'Enable AI copilot chat feature', enabled: true },
    { name: 'ai-content-generation', description: 'Enable AI-powered content generation', enabled: true },
    { name: 'keyword-clustering', description: 'Enable automatic keyword clustering', enabled: true },
    { name: 'competitor-analysis', description: 'Enable competitor analysis features', enabled: true },
    { name: 'scheduled-reports', description: 'Enable scheduled PDF/CSV reports', enabled: true },
    { name: 'bulk-keyword-import', description: 'Enable bulk keyword import from CSV', enabled: true },
    { name: 'advanced-analytics', description: 'Enable advanced analytics dashboard', enabled: false, rules: { minPlan: 'business' } },
    { name: 'white-label', description: 'Enable white-label reports and branding', enabled: false, rules: { minPlan: 'enterprise' } },
    { name: 'api-access', description: 'Enable external API access', enabled: true },
    { name: 'team-collaboration', description: 'Enable team member invitations and roles', enabled: true },
  ];

  for (const ff of featureFlags) {
    await prisma.featureFlag.upsert({
      where: { name: ff.name },
      update: { enabled: ff.enabled, description: ff.description, rules: ff.rules ?? null },
      create: {
        name: ff.name,
        description: ff.description,
        enabled: ff.enabled,
        rules: ff.rules ?? null,
      },
    });
  }
  console.log(`Created ${featureFlags.length} feature flags`);

  const adminFreeEnd = new Date();
  adminFreeEnd.setFullYear(adminFreeEnd.getFullYear() + 10);

  await prisma.subscription.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      plan: 'enterprise',
      status: 'active',
      currentPeriodEnd: adminFreeEnd,
      maxProjects: -1,
      maxPagesPerProject: -1,
      maxKeywords: -1,
      aiCredits: -1,
      apiCallsLimit: -1,
    },
  });

  const testSubEnd = new Date();
  testSubEnd.setMonth(testSubEnd.getMonth() + 1);

  await prisma.subscription.upsert({
    where: { userId: testUser.id },
    update: {},
    create: {
      userId: testUser.id,
      plan: 'pro',
      status: 'active',
      currentPeriodEnd: testSubEnd,
      maxProjects: 10,
      maxPagesPerProject: 5000,
      maxKeywords: 1000,
      aiCredits: 500,
      apiCallsLimit: 10000,
    },
  });

  console.log('Created subscriptions for both users');

  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'seed_database',
      entity: 'System',
      entityId: 'seed',
      before: null,
      after: { seededAt: new Date().toISOString() },
      ipAddress: '127.0.0.1',
      userAgent: 'seed-script',
    },
  });

  console.log('Created audit log entry');
  console.log('Database seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
