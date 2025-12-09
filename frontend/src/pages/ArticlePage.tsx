import { useEffect, useState } from "react";
import { articleApi, Article } from "@/api/client";
import { Link } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { toast } from "sonner";

function extractText(json: any): string {
  if (!json) return "";
  if (Array.isArray(json)) return json.map(extractText).join(" ");
  if (json.text) return json.text + " ";
  if (json.content) return extractText(json.content);
  return "";
}

export default function ArticlePage() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  const [articles, setArticles] = useState<Article[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) return;

    (async () => {
      try {
        const data = await articleApi.getAll();
        setArticles(data);
        toast.success("Blogs loaded successfully");
      } catch (err) {
        console.error(err);
        toast.error("Failed to load articles");
      } finally {
        setLoading(false);
      }
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
    if (!ids.length) return toast.error("No blogs selected");
    if (!confirm(`Delete ${ids.length} blogs?`)) return;

    try {
      await articleApi.bulkDelete(ids);
      setArticles((prev) => prev.filter((a) => !ids.includes(a.id)));
      setSelected({});
      toast.success("Selected blogs deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete selected blogs");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-100">My Blogs</h1>

        {isSignedIn && (
          <div className="flex gap-3">
            <Link
              to="/myblogs/new"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow hover:bg-blue-500 transition"
            >
              + New Blog
            </Link>

            <button
              onClick={deleteSelected}
              className="px-4 py-2 rounded-lg text-red-600 text-sm font-semibold shadow hover:bg-red-500 hover:text-white transition"
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {loading && <p className="text-slate-400 text-sm">Loading…</p>}

      <div className="space-y-4">
        {articles.map((a) => {
          const isAuthor = user?.id === a.authorId;

          return (
            <div
              key={a.id}
              className="p-5 bg-slate-900 border border-slate-700 rounded-xl flex gap-4 shadow hover:shadow-lg transition"
            >
              {isAuthor && (
                <input
                  type="checkbox"
                  checked={!!selected[a.id]}
                  onChange={() => toggle(a.id)}
                  className="mt-1 scale-110 accent-blue-500"
                />
              )}

              <div className="flex-1">
                <Link
                  to={`/blogs/${a.id}`}
                  className="text-xl font-semibold text-blue-400 hover:text-blue-300 transition"
                >
                  {a.title}
                </Link>

                <p className="mt-1 text-slate-400 text-sm">
                  {preview(a.content)}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {new Date(a.createdAt).toLocaleString()}
                </p>
              </div>

              {isAuthor && (
                <div className="flex flex-col text-sm gap-2">
                  <Link
                    to={`/myblogs/${a.id}/edit`}
                    className="px-3 py-1 rounded-md text-blue-400 border border-blue-500 hover:bg-blue-500/20 hover:text-blue-300 transition font-medium"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={async () => {
                      if (!confirm("Delete this article?")) return;

                      try {
                        await articleApi.delete(a.id);
                        setArticles((prev) =>
                          prev.filter((x) => x.id !== a.id)
                        );
                        toast.success("Article deleted");
                      } catch (err) {
                        console.error(err);
                        toast.error("Failed to delete article");
                      }
                    }}
                    className="px-3 py-1 rounded-md text-red-400 border border-red-500 hover:bg-red-500/20 hover:text-red-300 transition font-medium"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
