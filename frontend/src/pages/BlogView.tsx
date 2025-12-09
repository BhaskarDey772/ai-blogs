import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { articleApi, Article } from "@/api/client";
import { useUser } from "@clerk/clerk-react";
import NovelEditor from "@/components/NovelEditor";
import { toast } from "sonner";

export default function BlogView() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const data = await articleApi.getById(id);
        setArticle(data);
        toast.success("Article loaded successfully");
      } catch (err) {
        console.error(err);
        toast.error("Failed to load article");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="text-white">Loading…</div>;
  if (!article) return <div className="text-white">Not found</div>;

  const isAuthor = user?.id === article.authorId;

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">{article.title}</h1>
          <p className="mt-2 text-sm text-slate-400">
            {article.authorName && <>By {article.authorName} • </>}
            {new Date(article.createdAt).toLocaleString()}
          </p>
        </div>

        {isAuthor && (
          <Link
            to={`/myblogs/${article.id}/edit`}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Edit
          </Link>
        )}
      </div>

      <NovelEditor value={article.content} readOnly />
    </div>
  );
}
