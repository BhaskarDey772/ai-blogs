import { Article, IArticle } from "../models";

interface GenerateArticleData {
  title: string;
  content: string;
}

function generateArticleData(): GenerateArticleData {
  const title = `Auto Article ${new Date().toISOString().slice(0, 10)}`;
  const content = `This article was auto-generated at ${new Date().toISOString()}.\n\nShort sample content for demonstration.`;
  return { title, content };
}

export class ArticleService {
  static async getAllArticles(): Promise<IArticle[]> {
    try {
      const articles = await Article.find().sort({ createdAt: -1 }).exec();
      return articles;
    } catch (err) {
      console.error("Error fetching articles:", err);
      throw err;
    }
  }

  static async getPublishedArticles(): Promise<IArticle[]> {
    try {
      const articles = await Article.find({ status: "published" })
        .sort({ publishedAt: -1, createdAt: -1 })
        .exec();
      return articles;
    } catch (err) {
      console.error("Error fetching published articles:", err);
      throw err;
    }
  }

  static async getArticlesForUser(userId: string): Promise<IArticle[]> {
    try {
      const articles = await Article.find({ authorId: userId })
        .sort({ createdAt: -1 })
        .exec();
      return articles;
    } catch (err) {
      console.error("Error fetching user articles:", err);
      throw err;
    }
  }

  static async getArticleById(id: string): Promise<IArticle | null> {
    try {
      const article = await Article.findById(id).exec();
      return article;
    } catch (err) {
      console.error("Error fetching article:", err);
      throw err;
    }
  }

  static async createArticle(data: Partial<IArticle>): Promise<IArticle> {
    try {
      const article = new Article(data);
      if (data.status === "published") {
        article.publishedAt = new Date();
      }
      await article.save();
      return article;
    } catch (err) {
      console.error("Error creating article:", err);
      throw err;
    }
  }

  static async generateArticle(author?: {
    id?: string;
    name?: string;
  }): Promise<IArticle> {
    // Use AI client if available; fallback to simple generator
    try {
      const prompt = `Generate a markdown blog post for date ${new Date()
        .toISOString()
        .slice(0, 10)}`;
      let content = "";
      try {
        // Dynamically import AI client to avoid hard dependency errors
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { AIClient } = require("./aiClient");
        if (AIClient && typeof AIClient.generateContent === "function") {
          content = await AIClient.generateContent(prompt);
        }
      } catch (aiErr) {
        console.warn(
          "AI client not available, using fallback generator",
          aiErr
        );
        content = generateArticleData().content;
      }

      const title = `Auto Article ${new Date().toISOString().slice(0, 10)}`;

      const articleData: Partial<IArticle> = {
        title,
        content,
        status: "published",
        authorId: author?.id,
        authorName: author?.name || "AI Bot",
        publishedAt: new Date(),
      };

      return this.createArticle(articleData);
    } catch (err) {
      console.error("Error generating article:", err);
      throw err;
    }
  }

  static async updateArticle(
    id: string,
    data: Partial<IArticle>,
    userId?: string
  ): Promise<IArticle | null> {
    try {
      const article = await Article.findById(id).exec();
      if (!article) return null;
      // Ownership check: only author can update (or if no authorId, allow)
      if (article.authorId && userId && article.authorId !== userId) {
        throw new Error("Not authorized to update this article");
      }
      Object.assign(article, data as any);
      if (data.status === "published" && !article.publishedAt) {
        article.publishedAt = new Date();
      }
      await article.save();
      return article;
    } catch (err) {
      console.error("Error updating article:", err);
      throw err;
    }
  }

  static async deleteArticleForUser(
    id: string,
    userId?: string
  ): Promise<boolean> {
    try {
      const article = await Article.findById(id).exec();
      if (!article) return false;
      if (article.authorId && userId && article.authorId !== userId) {
        throw new Error("Not authorized to delete this article");
      }
      await Article.findByIdAndDelete(id).exec();
      return true;
    } catch (err) {
      console.error("Error deleting article:", err);
      throw err;
    }
  }

  static async deleteArticle(id: string): Promise<boolean> {
    try {
      const result = await Article.findByIdAndDelete(id).exec();
      return !!result;
    } catch (err) {
      console.error("Error deleting article:", err);
      throw err;
    }
  }
}
