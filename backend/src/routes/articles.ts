import { Router } from "express";
import { ArticleService } from "../services";
import { authMiddleware, AuthRequest, optionalAuth } from "../middleware/auth";

const router = Router();

// Public: get published articles
router.get("/public", async (req, res) => {
  try {
    const articles = await ArticleService.getPublishedArticles();
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch public articles" });
  }
});

// Public or authenticated: view single article (if draft, only author can view)
router.get("/:id", optionalAuth, async (req: AuthRequest, res) => {
  try {
    const article = await ArticleService.getArticleById(req.params.id);
    if (!article) return res.status(404).json({ error: "Article not found" });

    if (article.status !== "published") {
      // If not published, only author can view
      const requesterId = req.user?.userId;
      if (!requesterId || requesterId !== article.authorId) {
        return res
          .status(403)
          .json({ error: "Not authorized to view this article" });
      }
    }

    res.json(article);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch article" });
  }
});

// Authenticated: get user's articles + public ones
router.get("/", optionalAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (userId) {
      const userArticles = await ArticleService.getArticlesForUser(userId);
      const publicArticles = await ArticleService.getPublishedArticles();
      // Merge: user's articles first, then public articles not authored by user
      const publicExcludingUser = publicArticles.filter(
        (a) => a.authorId !== userId
      );
      res.json([...userArticles, ...publicExcludingUser]);
    } else {
      const publicArticles = await ArticleService.getPublishedArticles();
      res.json(publicArticles);
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch articles" });
  }
});

// Create article (authenticated)
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, content, status } = req.body;
    if (!title || !content)
      return res.status(400).json({ error: "Title and content are required" });

    const authorId = req.user!.userId;
    const author = await ArticleService.createArticle({
      title,
      content,
      status: status || "draft",
      authorId,
      authorName: req.user!.firstName,
    });

    res.status(201).json(author);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create article" });
  }
});

// Update article (authenticated)
router.put("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const updated = await ArticleService.updateArticle(
      req.params.id,
      req.body,
      userId
    );
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update article" });
  }
});

// Delete article (authenticated)
router.delete("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const deleted = await ArticleService.deleteArticleForUser(
      req.params.id,
      userId
    );
    if (!deleted) return res.status(404).json({ error: "Article not found" });
    res.json({ message: "Article deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete article" });
  }
});

// Generate article via AI (authenticated) — will publish by default
router.post("/generate", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const authorId = req.user!.userId;
    const authorName = req.user!.firstName;
    const article = await ArticleService.generateArticle({
      id: authorId,
      name: authorName,
    });
    res.status(201).json(article);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate article" });
  }
});

export default router;
