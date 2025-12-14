import { Article, IArticle } from "../models";

/* ------------------------------------------------------------------
   Utilities
------------------------------------------------------------------ */

interface GenerateArticleData {
  title: string;
  content: string;
}

function fallbackGeneratedArticle(): GenerateArticleData {
  return {
    title: `Auto Article ${new Date().toISOString().slice(0, 10)}`,
    content: `This is an auto-generated sample article created at ${new Date().toISOString()}.`,
  };
}

function validateArticleInput(title?: string, content?: string) {
  if (!title || !title.trim()) throw new Error("Title cannot be empty");
  if (!content || content.length < 5)
    throw new Error("Content too short to be a valid article");
}

/* ------------------------------------------------------------------
   ArticleService Class
------------------------------------------------------------------ */
export class ArticleService {
  /* ---------------------------- PUBLIC ARTICLES ---------------------------- */

  static async getPublishedArticles(): Promise<IArticle[]> {
    const articles = await Article.find({
      $or: [{ status: "published" }, { authorName: "AI Bot" }],
    })
      .select("-draftContent -content")
      .sort({ publishedAt: -1, createdAt: -1 })
      .exec();

    return articles.map((a) => {
      const obj = a.toObject() as any;
      obj.content = a.currentContent || "";
      return obj;
    });
  }

  static async getArticlePublished(id: string): Promise<IArticle | null> {
    const article = await Article.findOne({
      _id: id,
      status: "published",
    })
      .select("-draftContent -content")
      .sort({ publishedAt: -1, createdAt: -1 })
      .exec();

    if (!article) return null;

    const obj = article.toObject() as any;
    obj.content = article.currentContent || "";
    return obj;
  }

  /* ---------------------------- USER VISIBLE MERGED ---------------------------- */

  static async getMergedVisibleArticles(userId?: string): Promise<IArticle[]> {
    // const publicArticles = await this.getPublishedArticles();

    // if (!userId) return publicArticles;

    const own = await Article.find({
      authorId: userId,
    })
      .sort({ createdAt: -1 })
      .exec();

    const ownMapped = own.map((a) => {
      const obj = a.toObject() as any;
      obj.content = a.draftContent ?? a.currentContent ?? "";
      return obj;
    });

    return ownMapped;
  }

  /* ---------------------------- SINGLE ARTICLE LOGIC ---------------------------- */

  static async getArticleByIdExpanded(
    id: string,
    requesterId?: string
  ): Promise<IArticle | null> {
    const article = await Article.findById(id).exec();
    if (!article) return null;

    const isOwner = requesterId === article.authorId;

    // PUBLIC MODE — content only from currentContent
    if (article.status === "published" && !isOwner) {
      const obj = article.toObject() as any;
      obj.content = article.currentContent ?? "";
      delete obj.draftContent;
      return obj;
    }

    // PRIVATE MODE — owner sees draft
    if (isOwner) {
      const obj = article.toObject() as any;
      obj.content = article.draftContent ?? article.currentContent ?? "";
      return obj;
    }

    // Non-owner, not published
    return null;
  }

  /* ---------------------------- CREATE ---------------------------- */

  static async createArticle(data: Partial<IArticle>): Promise<IArticle> {
    validateArticleInput(data.title, data.content);

    const isPublish = data.status === "published";

    const payload: any = {
      ...data,
      contentFormat: data.contentFormat ?? "novel",
      publishedAt: isPublish ? new Date() : undefined,
      currentContent: isPublish ? data.content : undefined,
      draftContent: data.content,
    };

    const article = new Article(payload);
    await article.save();

    const obj = article.toObject() as any;
    obj.content = article.draftContent;
    return obj;
  }

  /* ---------------------------- UPDATE ---------------------------- */

  static async updateArticle(
    id: string,
    data: Partial<IArticle>,
    userId: string
  ): Promise<IArticle | null> {
    const article = await Article.findById(id).exec();
    if (!article) return null;

    if (article.authorId !== userId)
      throw new Error("Not authorized to update this article");

    if (data.title) validateArticleInput(data.title, data.content ?? "ok");

    const isPublishing = data.status === "published";

    // PUBLISH FLOW – always use latest draft if content missing
    if (isPublishing) {
      const publishContent =
        data.content ?? article.draftContent ?? article.currentContent ?? "";

      article.title = data.title ?? article.title;

      article.currentContent = publishContent;
      article.draftContent = publishContent;
      article.status = "published";
      article.contentFormat = data.contentFormat ?? article.contentFormat;

      if (!article.publishedAt) article.publishedAt = new Date();

      await article.save();

      const obj = article.toObject() as any;
      obj.content = publishContent;
      return obj;
    }

    // DRAFT UPDATE
    if (data.content !== undefined) {
      article.draftContent = data.content;
    }

    if (data.title) article.title = data.title;
    if (data.contentFormat) article.contentFormat = data.contentFormat;

    // if once published, keep status
    if (data.status === "draft" && article.status === "draft")
      article.status = data.status;

    await article.save();

    const obj = article.toObject() as any;
    obj.content = article.draftContent;
    return obj;
  }

  /* ---------------------------- DELETE ---------------------------- */

  static async deleteArticleForUser(
    id: string,
    userId: string
  ): Promise<boolean> {
    const article = await Article.findById(id).exec();
    if (!article) return false;

    if (article.authorId !== userId)
      throw new Error("Not authorized to delete this article");

    await Article.findByIdAndDelete(id).exec();
    return true;
  }

  static async deleteManyForUser(ids: string[], userId: string) {
    const articles = await Article.find({ _id: { $in: ids } }).exec();

    for (const a of articles) {
      if (a.authorId !== userId)
        throw new Error("You cannot delete articles you did not create");
    }

    const result = await Article.deleteMany({ _id: { $in: ids } }).exec();
    return { deleted: result.deletedCount ?? 0 };
  }

  /* ---------------------------- AI GENERATE ---------------------------- */

  static async generateArticle(author?: { id?: string; name?: string }) {
    // Build a meaningful, time-aware prompt that requests markdown output
    const today = new Date().toISOString().slice(0, 10);
    const prompt = `Produce a timely, well-structured markdown article (~700-1200 words) summarizing the most important recent technology updates as of ${today}. Cover key areas: AI/ML advances, major cloud provider announcements, developer tooling or frameworks updates, and an actionable takeaway for engineers or product builders. Start with a clear H1 title line ("# Title") followed by a 2-3 sentence summary, then 3-5 sections with headings and short paragraphs, and finish with a short conclusion and suggested further reading links (if any). Output only valid markdown.`;

    let content = "";
    try {
      // dynamic require to avoid import side-effects when not available
      const { AIClient } = require("./aiClient");
      content = await AIClient.generateContent(prompt);
    } catch (e) {
      console.warn("[AI] generateArticle fallback due to AI client error:", e);
      content = fallbackGeneratedArticle().content;
    }

    // Extract a sensible title from markdown: prefer first H1/H2, otherwise first non-empty line
    function extractTitleFromMarkdown(md: string): string {
      if (!md) return `Auto Article ${today}`;
      const lines = md.split(/\r?\n/).map((l) => l.trim());
      for (const line of lines) {
        const m = line.match(/^#{1,6}\s+(.*)/);
        if (m && m[1]) return m[1].trim();
      }
      // fallback: first non-empty line
      const first = lines.find((l) => l.length > 0);
      if (first) return first.length > 80 ? first.slice(0, 77) + "..." : first;
      return `Auto Article ${today}`;
    }

    const title = extractTitleFromMarkdown(content) || `Auto Article ${today}`;

    const articleData: Partial<IArticle> = {
      title,
      content,
      status: "published",
      contentFormat: "markdown",
      authorId: author?.id,
      authorName: author?.name || "AI Bot",
      publishedAt: new Date(),
    };

    return await this.createArticle(articleData);
  }
}
