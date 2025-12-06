import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { articleApi, Article } from "@/api/client";

const BlogView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      try {
        const a = await articleApi.getById(id);
        setArticle(a);

        // render markdown to HTML using unified/remark if available
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
            .process(a.content || "");

          setHtml(String(vfile));
        } catch (e) {
          // fallback: wrap in pre tag
          setHtml("<pre>" + (a.content || "") + "</pre>");
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, [id]);

  if (!article) return <div>Loading...</div>;

  return (
    <div className="prose max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{article.title}</h1>
        <Link
          to={`/blogs/${article.id}/edit`}
          className="text-sm text-blue-600"
        >
          Edit
        </Link>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        By {article.authorName || "Unknown"}
      </p>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};

export default BlogView;
