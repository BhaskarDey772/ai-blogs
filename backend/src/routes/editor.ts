import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import redis from "../services/redisClient";
import { ArticleService } from "../services";

const router = Router();

// Key helper: editor:draft:{userId}:{articleId|new}
function draftKey(userId: string, articleId?: string) {
  return `editor:draft:${userId}:${articleId ?? "new"}`;
}

// GET current draft from Redis (if any)
router.get("/draft", authMiddleware, async (req: any, res) => {
  try {
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

// POST heartbeat - store transient draft in Redis
router.post("/heartbeat", authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user!.userId;
    const { articleId, content, title } = req.body as {
      articleId?: string;
      content?: string;
      title?: string;
    };

    if (!content && !title) return res.status(400).json({ error: "No data provided" });

    const key = draftKey(userId, articleId);
    const payload = {
      content: content ?? undefined,
      title: title ?? undefined,
      updatedAt: new Date().toISOString(),
    };

    await redis.set(key, JSON.stringify(payload), {
      EX: 60 * 60, // expire in 1 hour
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("[EDITOR] Heartbeat failed", err);
    return res.status(500).json({ error: "Heartbeat failed" });
  }
});

// POST stop - flush from Redis to DB (create or update)
router.post("/stop", authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user!.userId;
    const { articleId } = req.body as { articleId?: string };
    const key = draftKey(userId, articleId);

    const raw = await redis.get(key);
    if (!raw) return res.json({ ok: true, message: "No draft to flush" });

    const parsed = JSON.parse(raw) as { content?: string; title?: string };

    // If articleId provided -> update, else create
    let saved;
    if (articleId) {
      saved = await ArticleService.updateArticle(articleId, {
        content: parsed.content,
        title: parsed.title,
      }, userId);
      if (!saved) return res.status(404).json({ error: "Article not found" });
    } else {
      // create as draft
      saved = await ArticleService.createArticle({
        title: parsed.title ?? `Auto Article ${new Date().toISOString()}`,
        content: parsed.content ?? "",
        status: "draft",
        authorId: userId,
      } as any);
    }

    // Remove transient draft
    await redis.del(key);

    return res.json({ ok: true, article: saved });
  } catch (err) {
    console.error("[EDITOR] Stop failed", err);
    return res.status(500).json({ error: "Failed to flush draft" });
  }
});

export default router;
