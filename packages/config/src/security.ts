export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function detectPromptInjection(input: string): boolean {
  const patterns = [
    /ignore\s+(all\s+)?(previous|above|below)/i,
    /forget\s+(all\s+)?(previous|above|below)/i,
    /system\s+(prompt|instruction|message)/i,
    /you\s+are\s+(now|not\s+required)/i,
    /new\s+(instruction|task|prompt)/i,
    /override/i,
    /disregard/i,
    /jailbreak/i,
    /DAN/i,
    /do\s+anything\s+now/i,
    /role\s+(play|pretend)/i,
    /acting\s+as/i,
  ];

  return patterns.some((pattern) => pattern.test(input));
}

export function generateSecureToken(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join('');
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const masked = local.length <= 3
    ? local[0] + '***'
    : local[0] + '***' + local[local.length - 1];
  return `${masked}@${domain}`;
}

export function maskString(value: string, visibleChars = 4): string {
  if (value.length <= visibleChars) return value;
  return value.slice(0, visibleChars) + '*'.repeat(value.length - visibleChars);
}

export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

export const CSP_HEADER = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    "connect-src 'self' https: wss:",
    "frame-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
};
