import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { articleApi } from "@/api/client";

type PreviewProps = { markdown: string };

const PreviewMarkdown: React.FC<PreviewProps> = ({ markdown }) => {
  const [html, setHtml] = useState<string>("<div>Loading preview...</div>");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [
          { unified },
          remarkParse,
          remarkRehype,
          rehypeStringify,
          rehypeSanitize,
        ] = await Promise.all([
          import("unified"),
          import("remark-parse"),
          import("remark-rehype"),
          import("rehype-stringify"),
          import("rehype-sanitize"),
        ]);

        const vfile = await (unified as any)()
          .use((remarkParse as any).default)
          .use((remarkRehype as any).default)
          .use((rehypeSanitize as any).default)
          .use((rehypeStringify as any).default)
          .process(markdown || "");

        if (mounted) setHtml(String(vfile));
      } catch (e) {
        if (mounted) setHtml(`<pre>${markdown}</pre>`);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [markdown]);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

const BlogEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(
    "# New Post\n\nStart writing in markdown..."
  );
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [NovelComponent, setNovelComponent] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const a = await articleApi.getById(id);
        setTitle(a.title);
        setContent(a.content);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [id]);

  // Try dynamically importing the `novel` editor and detect the component export.
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod: any = await import("novel");
        const Comp =
          mod.default ||
          mod.Novel ||
          mod.Editor ||
          mod.NovelEditor ||
          mod.Component;
        if (mounted && Comp) setNovelComponent(() => Comp);
      } catch (err) {
        // not available or failed — keep fallback editor
        console.warn("Novel import failed or not present:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const applyWrap = (before: string, after: string = before) => {
    const ta = document.getElementById(
      "md-editor"
    ) as HTMLTextAreaElement | null;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.slice(start, end) || "";
    const newText =
      content.slice(0, start) + before + selected + after + content.slice(end);
    setContent(newText);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(
        start + before.length,
        start + before.length + selected.length
      );
    }, 0);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (id) {
        await articleApi.update(id, { title, content });
        navigate(`/blogs/${id}`);
      } else {
        const created = await articleApi.create({ title, content });
        navigate(`/blogs/${created.id}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4">
        <input
          className="w-full border rounded p-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        />
      </div>

      <div className="mb-4">
        {NovelComponent ? (
          // Use Novel editor component when available. We don't assume exact props;
          // try common props: value + onChange (string) or onChange({ html | markdown })
          // Render via createElement to avoid TS issues with unknown props.
          // @ts-ignore
          React.createElement(NovelComponent as any, {
            value: content,
            onChange: (v: any) => {
              if (typeof v === "string") setContent(v);
              else if (v?.markdown) setContent(v.markdown);
              else if (v?.html) setContent(v.html);
              else if (v?.target?.value) setContent(v.target.value);
            },
            style: { minHeight: "24rem" },
          })
        ) : (
          <>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                className="btn"
                onClick={() => applyWrap("**")}
              >
                Bold
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => applyWrap("*")}
              >
                Italic
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => applyWrap("# ", "")}
              >
                H1
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => applyWrap("## ", "")}
              >
                H2
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => applyWrap("- ", "")}
              >
                List
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => applyWrap("```\n", "\n```")}
              >
                Code
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setPreview((p) => !p)}
              >
                {preview ? "Editor" : "Preview"}
              </button>
            </div>

            {!preview ? (
              <textarea
                id="md-editor"
                className="w-full h-96 border rounded p-2 font-mono"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            ) : (
              <div className="prose max-w-full border rounded p-4">
                <PreviewMarkdown markdown={content} />
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex gap-2">
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default BlogEdit;
