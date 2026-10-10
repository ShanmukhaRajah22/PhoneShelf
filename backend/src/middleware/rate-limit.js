import { checkRateLimit } from "../services/rate-limit.service.js";

function rateLimit(type) {
  return async (req, res, next) => {
    try {
      const result = await checkRateLimit(type, `${req.ip}:${type}`);
      res.set("X-RateLimit-Limit", String(result.limit));
      res.set("X-RateLimit-Remaining", String(Math.max(0, result.remaining)));
      res.set("X-RateLimit-Reset", String(result.reset));

      if (!result.success) {
        const retryAfter = Math.max(
          1,
          Math.ceil((result.reset - Date.now()) / 1000),
        );
        res.set("Retry-After", String(retryAfter));
        return res.status(429).json({
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests. Please try again later.",
          },
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

export default rateLimit;
