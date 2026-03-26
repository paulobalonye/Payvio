import Redis from "ioredis";
import { env } from "./env";

export function createRedisClient(): Redis {
  return new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });
}

// Singleton for app-wide use (lazy — only connects when first used)
let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (!_redis) {
    _redis = createRedisClient();
  }
  return _redis;
}
