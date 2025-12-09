import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { articleApi, Article } from "@/api/client";
import NovelEditor from "@/components/NovelEditor";
import { toast } from "sonner";

function extractTitleFromContent(jsonString: string): string {
  try {
    const json = JSON.parse(jsonString);
    if (!json?.content) return "Untitled";

    for (const node of json.content) {
      if (node.type === "heading" || node.type === "paragraph") {
        const textNode = node.content?.find(
          (n: any) => n.type === "text" && n.text?.trim()
        );
        if (textNode) return textNode.text.trim();
      }
    }
    return "Untitled";
  } catch {
    return "Untitled";
  }
}

export default function BlogEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const isEditing = Boolean(id);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const article = await articleApi.getById(id);
        setContent(article.content || "");
        toast.success("Article loaded successfully");
      } catch (err) {
        console.error(err);
        toast.error("Failed to load article");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSave = async (
    status: "draft" | "published",
    freshContent: string
  ) => {
    if (!freshContent) return toast.error("Content is empty");

    const title = extractTitleFromContent(freshContent);
    if (!title || title === "Untitled")
      return toast.error("Your article must contain at least one meaningful line.");

    setSaving(true);

    try {
      if (isEditing && id) {
        await articleApi.update(id, { title, content: freshContent, status });
        navigate(`/blogs/${id}`);
      } else {
        const created = await articleApi.create({
          title,
          content: freshContent,
          status,
        });
        navigate(`/blogs/${created.id}`);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-white">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-4">
      <div className="flex justify-end gap-2">
        <button
          onClick={() => handleSave("draft", content)}
          className="rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-60"
          disabled={saving}
        >
          {saving ? "Saving…" : "Save draft"}
        </button>

        <button
          onClick={() => handleSave("published", content)}
          className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-500 disabled:opacity-60"
          disabled={saving}
        >
          {saving ? "Publishing…" : "Publish"}
        </button>
      </div>

      <NovelEditor value={content} onChange={setContent} readOnly={false} />
    </div>
  );
}
