// Simple in-memory rate limiter (resets on server restart)
// For production, use Vercel KV or Upstash Redis

const requests = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5; // 5 analyses per minute per IP

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  // Block unknown IPs to prevent DoS via shared bucket
  if (!ip || ip === "unknown") {
    return { allowed: false, remaining: 0 };
  }

  const now = Date.now();
  const entry = requests.get(ip);

  // Cleanup stale entries on each call (instead of setInterval leak)
  if (requests.size > 1000) {
    for (const [key, val] of requests) {
      if (now > val.resetAt) requests.delete(key);
    }
  }

  if (!entry || now > entry.resetAt) {
    requests.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count };
}
