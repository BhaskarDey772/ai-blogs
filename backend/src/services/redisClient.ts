import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const redis = createClient({ url: REDIS_URL });

redis.on("error", (err) => {
  console.error("[REDIS] Client error:", err);
});

(async () => {
  try {
    await redis.connect();
    console.log("[REDIS] Connected to Redis");
  } catch (err) {
    console.error("[REDIS] Failed to connect:", err);
  }
})();

export default redis;
