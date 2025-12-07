import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { articleApi, Article } from "@/api/client";
import NovelEditor from "@/components/NovelEditor";

const BlogView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const a = await articleApi.getById(id);
        setArticle(a);
      } catch (err) {
        console.error(err);
        alert("Failed to load article");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading || !article) {
    return (
      <div className="max-w-4xl mx-auto py-10 text-slate-200">Loading…</div>
    );
  }

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
        <Link
          to={`/blogs/${article.id}/edit`}
          className="shrink-0 text-sm text-blue-400 hover:text-blue-300"
        >
          Edit
        </Link>
      </div>

      {/* Read-only Novel rendering */}
      <NovelEditor value={article.content} readOnly={true} />
    </div>
  );
};

export default BlogView;
