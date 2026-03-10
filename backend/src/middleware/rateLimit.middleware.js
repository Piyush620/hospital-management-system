const buckets = new Map();

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || "unknown";
};

const createRateLimiter = (options = {}) => {
  const windowMs = Number(options.windowMs || process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
  const max = Number(options.max || process.env.RATE_LIMIT_MAX || 300);
  const message = options.message || "Too many requests, please try again later.";

  return (req, res, next) => {
    const key = `${req.method}:${req.baseUrl || ""}:${req.path}:${getClientIp(req)}`;
    const now = Date.now();
    const record = buckets.get(key);

    if (!record || now > record.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    record.count += 1;
    const remaining = Math.max(max - record.count, 0);
    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetAt / 1000));

    if (record.count > max) {
      return res.status(429).json({
        success: false,
        message
      });
    }

    return next();
  };
};

module.exports = createRateLimiter;
