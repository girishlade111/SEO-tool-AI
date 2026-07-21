interface RateLimitConfig {
  points: number;
  duration: number; // seconds
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

// In-memory store for development / no-redis fallback
const memoryStore = new Map<string, { count: number; resetAt: number }>();

let redisClient: { get: (key: string) => Promise<string | null>; set: (key: string, value: string, opts: { ex: number }) => Promise<unknown> } | null = null;

async function getRedisClient() {
  if (redisClient) return redisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    // Simple REST-based Redis client
    redisClient = {
      async get(key: string) {
        const res = await fetch(`${url}/get/${key}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json() as { result?: string };
        return data.result ?? null;
      },
      async set(key: string, value: string, opts: { ex: number }) {
        await fetch(`${url}/set/${key}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(value, null, undefined),
        });
      },
    };
    return redisClient;
  }

  return null;
}

export async function rateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const client = await getRedisClient();

  if (client) {
    // Redis-based rate limiting
    const current = await client.get(key);
    const now = Math.floor(Date.now() / 1000);

    if (current) {
      const data = JSON.parse(current) as { count: number; resetAt: number };
      if (now < data.resetAt) {
        if (data.count >= config.points) {
          return { success: false, remaining: 0, reset: data.resetAt };
        }
        data.count++;
        await client.set(key, JSON.stringify(data), { ex: config.duration });
        return { success: true, remaining: config.points - data.count, reset: data.resetAt };
      }
    }

    const resetAt = now + config.duration;
    await client.set(key, JSON.stringify({ count: 1, resetAt }), { ex: config.duration });
    return { success: true, remaining: config.points - 1, reset: resetAt };
  }

  // In-memory fallback
  const now = Math.floor(Date.now() / 1000);
  const entry = memoryStore.get(key);

  if (entry && now < entry.resetAt) {
    if (entry.count >= config.points) {
      return { success: false, remaining: 0, reset: entry.resetAt };
    }
    entry.count++;
    return { success: true, remaining: config.points - entry.count, reset: entry.resetAt };
  }

  const resetAt = now + config.duration;
  memoryStore.set(key, { count: 1, resetAt });
  return { success: true, remaining: config.points - 1, reset: resetAt };
}

export function buildRateLimitKey(prefix: string, identifier: string): string {
  return `rl:${prefix}:${identifier}`;
}
