import { useEffect, useState } from "react";
import { articleApi, Article } from "@/api/client";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

function extractText(json: any): string {
  if (!json) return "";
  if (Array.isArray(json)) return json.map(extractText).join(" ");
  if (json.text) return json.text + " ";
  if (json.content) return extractText(json.content);
  return "";
}

export default function ArticlePage() {
  const { isSignedIn } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      const data = isSignedIn
        ? await articleApi.getAll()
        : await articleApi.getPublic();
      setArticles(data);
    })();
  }, [isSignedIn]);

  const preview = (content: string) => {
    try {
      const json = JSON.parse(content);
      const text = extractText(json).trim();
      return text.slice(0, 200) + (text.length > 200 ? "…" : "");
    } catch {
      return "";
    }
  };

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const deleteSelected = async () => {
    const ids = Object.keys(selected).filter((id) => selected[id]);
    if (!ids.length) return alert("No blogs selected");
    if (!confirm(`Delete ${ids.length} blogs?`)) return;

    await articleApi.bulkDelete(ids);
    setArticles((prev) => prev.filter((a) => !ids.includes(a.id)));
    setSelected({});
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold text-gray-100">Your Blogs</h1>

        {isSignedIn && (
          <div className="flex gap-3">
            <Link
              to="/blogs/new"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              New Blog
            </Link>

            <button
              onClick={deleteSelected}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {articles.map((a) => (
          <div
            key={a.id}
            className="p-4 bg-slate-900 border border-gray-700 rounded-xl flex gap-4"
          >
            {isSignedIn && (
              <input
                type="checkbox"
                checked={!!selected[a.id]}
                onChange={() => toggle(a.id)}
                className="mt-2 accent-blue-500"
              />
            )}

            <div className="flex-1">
              <Link
                to={`/blogs/${a.id}`}
                className="text-xl font-semibold text-blue-400 hover:text-blue-300"
              >
                {a.title}
              </Link>

              <p className="mt-1 text-gray-400 text-sm">{preview(a.content)}</p>
            </div>

            {isSignedIn && (
              <div className="flex flex-col text-sm gap-2">
                <Link
                  to={`/blogs/${a.id}/edit`}
                  className="text-blue-400 hover:text-blue-300"
                >
                  Edit
                </Link>

                <button
                  onClick={async () => {
                    if (!confirm("Delete this article?")) return;
                    await articleApi.delete(a.id);
                    setArticles((prev) => prev.filter((x) => x.id !== a.id));
                  }}
                  className="text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
