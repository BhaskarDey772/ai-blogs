import cron from "node-cron";
import { ArticleService } from "./ArticleService";

export function setupArticleJob(): void {
  // Midnight cron job: runs at 00:00 UTC
  cron.schedule("0 0 * * *", async () => {
    console.log("[CRON] Midnight job executed at", new Date().toISOString());
    try {
      const article = await ArticleService.generateArticle();
      console.log(
        "[CRON] Midnight generated article:",
        article.id,
        article.title
      );
    } catch (err) {
      console.error("[CRON] Error generating midnight article:", err);
    }
  });
}
