import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { articleApi, Article } from "@/api/client";
import { useAuth } from "@clerk/clerk-react";
import NovelEditor from "@/components/NovelEditor";
import { toast } from "sonner";

export default function PublicBlogView() {
  const { id } = useParams<{ id: string }>();
  const { isSignedIn, userId } = useAuth();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        // Public fetch
        const a = await articleApi.getPublicById(id);
        setArticle(a);
        toast.success("Blog loaded successfully");
      } catch (err) {
        console.error(err);
        toast.error("Failed to load blog");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="text-slate-200 py-10">Loading…</div>;

  if (!article)
    return <div className="text-slate-200 py-10">Blog not found</div>;

  const canEdit = isSignedIn && article.authorId === userId;

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">{article.title}</h1>
          <p className="mt-2 text-sm text-slate-400">
            {article.authorName && <>By {article.authorName} • </>}
            {new Date(article.createdAt).toLocaleString()}
          </p>
        </div>

        {canEdit && (
          <Link
            to={`/myblogs/${article.id}/edit`}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Edit
          </Link>
        )}
      </div>

      <NovelEditor value={article.content} readOnly />
    </div>
  );
}
