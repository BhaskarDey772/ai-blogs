import { useEffect, useState } from "react";
import { articleApi, Article } from "@/api/client";
import { Link } from "react-router-dom";

export default function PublicBlogs() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  function extractText(json: any): string {
    if (!json) return "";
    if (Array.isArray(json)) return json.map(extractText).join(" ");
    if (json.text) return json.text + " ";
    if (json.content) return extractText(json.content);
    return "";
  }

  const preview = (content: string) => {
    try {
      const json = JSON.parse(content);
      const text = extractText(json).trim();
      return text.slice(0, 200) + (text.length > 200 ? "…" : "");
    } catch {
      return "";
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await articleApi.getPublic();
        setArticles(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return <div className="text-slate-300 py-10">Loading public blogs…</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-6">
      <h1 className="text-3xl font-bold text-white mb-4">Public Blogs</h1>

      <ul className="space-y-4">
        {articles.map((a) => (
          <li key={a.id} className="border border-slate-700 p-4 rounded-md">
            <Link
              to={`/publicblog/${a.id}`}
              className="text-xl font-semibold text-blue-400 hover:text-blue-300"
            >
              {a.title}
            </Link>
            <p className="mt-1 text-slate-400 text-sm">{preview(a.content)}</p>
            <div className="text-sm text-slate-400 mt-1">
              {a.authorName && <>By {a.authorName} • </>}
              {new Date(a.createdAt).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
