/**
 * Fixed-window rate limiting, per instance.
 *
 * Read that qualifier before relying on this. The counters live in a `Map` in
 * process memory, and every mutating route on this site runs as a serverless
 * function — so the real budget is `max` multiplied by however many instances
 * happen to be warm, and a cold start resets it to zero. It raises the cost of
 * hammering an endpoint from one client; it is not a distributed limiter and
 * cannot become one without somewhere shared to keep the count.
 *
 * That somewhere is deliberately not added here. A Redis or KV dependency to hold
 * five integers would put a network round trip in front of every enquiry and give
 * the site a new hard dependency to fall over — worse, in aggregate, than the
 * imprecision it fixes. The right answer for a distributed limit on this stack is
 * Vercel's own edge rate limiting, configured per path in the dashboard, which
 * counts before a function is ever invoked. Use this as the floor under that.
 */
export interface RateLimit {
  /** True when the caller has exceeded the window and should be refused. */
  exceeded(key: string): boolean;
}

export function createRateLimit(windowMs: number, max: number): RateLimit {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return {
    exceeded(key: string): boolean {
      const now = Date.now();
      const entry = hits.get(key);

      if (!entry || now > entry.resetAt) {
        hits.set(key, { count: 1, resetAt: now + windowMs });

        /* Opportunistic sweep, so a stream of unique keys cannot grow the map
           without bound. Only on the cold path, and only past a size where
           iterating is still cheap. */
        if (hits.size > 500) {
          for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
        }
        return false;
      }

      entry.count += 1;
      return entry.count > max;
    },
  };
}

/**
 * The client's address, as far as it can be known.
 *
 * `x-forwarded-for` is a list appended to by each proxy, so the first entry is the
 * closest thing to the origin — and it is only trustworthy because Vercel rewrites
 * the header rather than passing a client-supplied one through. Falls back to a
 * single bucket rather than to something spoofable: an unidentifiable caller
 * sharing one budget with every other unidentifiable caller is the safe direction
 * to fail.
 */
export function clientKey(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
