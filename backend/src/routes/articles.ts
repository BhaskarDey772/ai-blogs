import { Router } from "express";
import { ArticleService } from "../services";
import { authMiddleware, AuthRequest, optionalAuth } from "../middleware/auth";

const router = Router();

/* -------------------------------------------------------
   PUBLIC: Fetch published articles
------------------------------------------------------- */
router.get("/public", async (req, res) => {
  try {
    const page = parseInt((req.query.page as string) || "1", 10) || 1;
    const limit = parseInt((req.query.limit as string) || "10", 10) || 10;

    const result = await ArticleService.getPublishedArticles(page, limit);
    return res.json({
      items: result.items,
      total: result.total,
      page,
      limit,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch public articles" });
  }
});

/* -------------------------------------------------------
   PUBLIC OR AUTH: Get single article
   - Published → everyone
   - Draft/unpublished → only author
------------------------------------------------------- */
router.get("/:id", optionalAuth, async (req: AuthRequest, res) => {
  try {
    const requesterId = req.user?.userId;
    const article = await ArticleService.getArticleByIdExpanded(
      req.params.id,
      requesterId
    );

    if (!article) return res.status(404).json({ error: "Not found" });
    return res.json(article);
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: err.message || "Failed to fetch article" });
  }
});

router.get("/public/:id", async (req, res) => {
  try {
    const article = await ArticleService.getArticlePublished(req.params.id);

    if (!article) return res.status(404).json({ error: "Not found" });
    return res.json(article);
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: err.message || "Failed to fetch article" });
  }
});

/* -------------------------------------------------------
   AUTH: Get all articles visible to the user
   - Own drafts/unpublished
   - All published articles
------------------------------------------------------- */
router.get("/", optionalAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    const page = parseInt((req.query.page as string) || "1", 10) || 1;
    const limit = parseInt((req.query.limit as string) || "10", 10) || 10;

    const result = await ArticleService.getMergedVisibleArticles(
      userId,
      page,
      limit
    );

    return res.json({ items: result.items, total: result.total, page, limit });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch articles" });
  }
});

/* -------------------------------------------------------
   AUTH: Create new article
------------------------------------------------------- */
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, content, status, contentFormat } = req.body;

    const article = await ArticleService.createArticle({
      title,
      content,
      status: status || "draft",
      contentFormat: contentFormat || "novel",
      authorId: req.user!.userId,
      authorName: req.user!.firstName,
    });

    return res.status(201).json(article);
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: err.message || "Failed to create article" });
  }
});

/* -------------------------------------------------------
   AUTH: Update article
------------------------------------------------------- */
router.put("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const updated = await ArticleService.updateArticle(
      req.params.id,
      req.body,
      req.user!.userId
    );

    if (!updated) return res.status(404).json({ error: "Not found" });
    return res.json(updated);
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: err.message || "Failed to update article" });
  }
});

/* -------------------------------------------------------
   AUTH: Delete single
------------------------------------------------------- */
router.delete("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const ok = await ArticleService.deleteArticleForUser(
      req.params.id,
      req.user!.userId
    );

    if (!ok) return res.status(404).json({ error: "Not found" });
    return res.json({ message: "Article deleted" });
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: err.message || "Failed to delete article" });
  }
});

/* -------------------------------------------------------
   AUTH: Bulk delete
------------------------------------------------------- */
router.post("/bulk-delete", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const ids = req.body.ids;
    if (!Array.isArray(ids) || ids.length === 0)
      return res.status(400).json({ error: "No ids provided" });

    const result = await ArticleService.deleteManyForUser(
      ids,
      req.user!.userId
    );

    return res.json({ deleted: result.deleted });
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: err.message || "Failed to bulk delete" });
  }
});

/* -------------------------------------------------------
   AUTH: AI auto generate
------------------------------------------------------- */
router.post("/generate", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const article = await ArticleService.generateArticle({
      id: req.user!.userId,
      name: req.user!.firstName,
    });

    return res.status(201).json(article);
  } catch (err) {
    return res.status(500).json({ error: "Failed to generate article" });
  }
});

export default router;
