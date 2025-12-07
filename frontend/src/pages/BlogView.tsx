import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { articleApi, Article } from "@/api/client";
import NovelEditor from "@/components/NovelEditor";
import { parseNovelContent } from "@/lib/parseNovelContent";

export default function BlogView() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [doc, setDoc] = useState({ type: "doc", content: [] });

  useEffect(() => {
    if (!id) return;

    (async () => {
      const a = await articleApi.getById(id);
      setArticle(a);
      setDoc(parseNovelContent(a.content)); // <-- FIXED
    })();
  }, [id]);

  if (!article) return <div className="text-gray-500">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold text-gray-100">{article.title}</h1>
        <Link
          to={`/blogs/${article.id}/edit`}
          className="text-blue-400 hover:text-blue-300"
        >
          Edit
        </Link>
      </div>

      <NovelEditor value={doc} readOnly onChange={undefined} />
    </div>
  );
}
