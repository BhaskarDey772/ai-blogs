import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import redis from "../services/redisClient";
import { ArticleService } from "../services";

const router = Router();

// Configuration
const HEARTBEAT_TIMEOUT = 5 * 60 * 1000; // 5 minutes - adjust based on your needs
const HEARTBEAT_CHECK_INTERVAL = 1 * 60 * 1000; // Check every 1 minute
const HEARTBEAT_KEY_PREFIX = "editor:heartbeat";
const DRAFT_KEY_PREFIX = "editor:draft";

// Key helpers
function draftKey(userId: string, articleId?: string) {
  return `${DRAFT_KEY_PREFIX}:${userId}:${articleId ?? "new"}`;
}

function heartbeatKey(userId: string) {
  return `${HEARTBEAT_KEY_PREFIX}:${userId}`;
}

// ============ HEARTBEAT MONITORING SERVICE ============
class HeartbeatMonitor {
  private checkInterval: NodeJS.Timeout | null = null;

  start() {
    if (this.checkInterval) return; // Already running

    console.log("[HEARTBEAT MONITOR] Starting heartbeat monitor service");

    this.checkInterval = setInterval(async () => {
      await this.checkAndFlushStaleHeartbeats();
    }, HEARTBEAT_CHECK_INTERVAL);
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log("[HEARTBEAT MONITOR] Stopped");
    }
  }

  private async checkAndFlushStaleHeartbeats() {
    try {
      // Get all heartbeat keys
      const heartbeatKeys = await redis.keys(`${HEARTBEAT_KEY_PREFIX}:*`);

      if (heartbeatKeys.length === 0) return;

      const now = Date.now();
      const staleUsers: string[] = [];

      // Check each user's last heartbeat
      for (const key of heartbeatKeys) {
        const lastHeartbeat = await redis.get(key);
        if (!lastHeartbeat) continue;

        const lastTimestamp = parseInt(lastHeartbeat, 10);
        const timeSinceLastHeartbeat = now - lastTimestamp;

        if (timeSinceLastHeartbeat > HEARTBEAT_TIMEOUT) {
          const userId = key.replace(`${HEARTBEAT_KEY_PREFIX}:`, "");
          staleUsers.push(userId);
          console.log(
            `[HEARTBEAT MONITOR] User ${userId} inactive for ${Math.round(timeSinceLastHeartbeat / 1000)}s - flushing drafts`
          );
        }
      }

      // Flush all stale user drafts
      for (const userId of staleUsers) {
        await this.flushUserDrafts(userId);
      }
    } catch (err) {
      console.error("[HEARTBEAT MONITOR] Error checking heartbeats:", err);
    }
  }

  private async flushUserDrafts(userId: string) {
    try {
      // Get all draft keys for this user
      const draftKeys = await redis.keys(`${DRAFT_KEY_PREFIX}:${userId}:*`);

      for (const key of draftKeys) {
        try {
          const raw = await redis.get(key);
          if (!raw) continue;

          const parsed = JSON.parse(raw) as {
            content?: string;
            title?: string;
          };

          // Extract articleId from key: editor:draft:userId:articleId
          const articleId = key.split(":").pop();

          if (articleId === "new") {
            // Create new draft article
            await ArticleService.createArticle({
              title: parsed.title ?? `Auto-saved Draft ${new Date().toISOString()}`,
              content: parsed.content ?? "",
              status: "draft",
              authorId: userId,
            } as any);
            console.log(
              `[HEARTBEAT MONITOR] Created new draft for user ${userId}`
            );
          } else {
            // Update existing article
            const updated = await ArticleService.updateArticle(
              articleId as string,
              {
                content: parsed.content,
                title: parsed.title,
              },
              userId
            );

            if (updated) {
              console.log(
                `[HEARTBEAT MONITOR] Updated article ${articleId} for user ${userId}`
              );
            }
          }

          // Clear the Redis draft after flushing
          await redis.del(key);
        } catch (err) {
          console.error(
            `[HEARTBEAT MONITOR] Error flushing draft ${key}:`,
            err
          );
        }
      }

      // Clear heartbeat key for this user
      await redis.del(heartbeatKey(userId));
    } catch (err) {
      console.error(`[HEARTBEAT MONITOR] Error flushing drafts for ${userId}:`, err);
    }
  }
}

// Initialize the monitor
const monitor = new HeartbeatMonitor();
monitor.start();

// ============ ROUTES ============

// GET current draft from Redis (if any)
router.get("/draft", authMiddleware, async (req: any, res) => {
  try {
    console.log("[EDITOR] GET /draft");
    const userId = req.user!.userId;
    const { articleId } = req.query;

    const key = draftKey(userId, articleId as string | undefined);
    const raw = await redis.get(key);

    if (!raw) return res.json({});

    const parsed = JSON.parse(raw);
    return res.json(parsed);
  } catch (err: any) {
    console.error("[EDITOR] Failed to fetch draft", err);
    return res.status(500).json({ error: "Failed to fetch draft" });
  }
});

// POST heartbeat - store transient draft in Redis + update last heartbeat timestamp
router.post("/heartbeat", authMiddleware, async (req: any, res) => {
  try {
    console.log("[EDITOR] POST /heartbeat");
    const userId = req.user!.userId;
    const { articleId, content, title } = req.body as {
      articleId?: string;
      content?: string;
      title?: string;
    };

    if (!content && !title)
      return res.status(400).json({ error: "No data provided" });

    // Store draft data
    const key = draftKey(userId, articleId);
    const payload = {
      content: content ?? undefined,
      title: title ?? undefined,
      updatedAt: new Date().toISOString(),
    };

    await redis.set(key, JSON.stringify(payload), { EX: 60 * 60 }); // 1 hour

    // Update heartbeat timestamp
    await redis.set(heartbeatKey(userId), Date.now().toString(), {
      EX: 60 * 60, // Keep for 1 hour
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("[EDITOR] Heartbeat failed", err);
    return res.status(500).json({ error: "Heartbeat failed" });
  }
});

// POST stop - flush from Redis to DB (manual stop)
router.post("/stop", authMiddleware, async (req: any, res) => {
  try {
    console.log("[EDITOR] POST /stop");
    const userId = req.user!.userId;
    const { articleId } = req.body as { articleId?: string };

    const key = draftKey(userId, articleId);
    const raw = await redis.get(key);

    if (!raw) return res.json({ ok: true, message: "No draft to flush" });

    const parsed = JSON.parse(raw) as { content?: string; title?: string };

    // If articleId provided -> update, else create
    let saved;
    if (articleId) {
      saved = await ArticleService.updateArticle(
        articleId,
        {
          content: parsed.content,
          title: parsed.title,
        },
        userId
      );

      if (!saved)
        return res.status(404).json({ error: "Article not found" });
    } else {
      // Create as draft
      saved = await ArticleService.createArticle({
        title: parsed.title ?? `Auto Article ${new Date().toISOString()}`,
        content: parsed.content ?? "",
        status: "draft",
        authorId: userId,
      } as any);
    }

    // Remove transient draft and heartbeat
    await redis.del(key);
    await redis.del(heartbeatKey(userId));

    return res.json({ ok: true, article: saved });
  } catch (err) {
    console.error("[EDITOR] Stop failed", err);
    return res.status(500).json({ error: "Failed to flush draft" });
  }
});

// Cleanup on server shutdown
process.on("SIGTERM", () => {
  monitor.stop();
});

process.on("SIGINT", () => {
  monitor.stop();
});

export default router;