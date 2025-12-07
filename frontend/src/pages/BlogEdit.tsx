import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { articleApi, Article } from "@/api/client";
import NovelEditor from "@/components/NovelEditor";

const BlogEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const isEditing = Boolean(id);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState<string>(""); // stringified Novel JSON
  const [loading, setLoading] = useState<boolean>(!!id);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const article: Article = await articleApi.getById(id);
        setTitle(article.title);
        console.debug("BlogEdit: loaded title:", article.title);
        setContent(article.content || "");
      } catch (err) {
        console.error(err);
        alert("Failed to load article");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSave = async (
    status: "draft" | "published",
    freshTitle: string,
    freshContent: string
  ) => {
    if (!freshTitle.trim()) return alert("Title is required");
    if (!freshContent) return alert("Content is empty");

    console.log("Saving with:", freshTitle, freshContent, status);
    setSaving(true);

    try {
      if (isEditing && id) {
        await articleApi.update(id, {
          title: freshTitle,
          content: freshContent,
          status,
        });
        navigate(`/blogs/${id}`);
      } else {
        const created = await articleApi.create({
          title: freshTitle,
          content: freshContent,
          status,
        });
        navigate(`/blogs/${created.id}`);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 text-slate-200">Loading…</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-lg font-semibold text-slate-100 placeholder:text-slate-500"
          value={title}
          onChange={(e) => {
            console.debug("BlogEdit: title input change ->", e.target.value);
            setTitle(e.target.value);
          }}
          placeholder="Article title"
        />

        <div className="flex gap-2 sm:ml-auto">
          <button
            type="button"
            onClick={() => handleSave("draft", title, content)}
            disabled={saving}
            className="rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 hover:bg-slate-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save draft"}
          </button>
          <button
            type="button"
            onClick={() => handleSave("published", title, content)}
            disabled={saving}
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {saving ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>

      <NovelEditor value={content} onChange={setContent} readOnly={false} />
    </div>
  );
};

export default BlogEdit;
