import { useState, useEffect } from "react";
import {
  EditorRoot,
  EditorCommand,
  EditorCommandItem,
  EditorCommandEmpty,
  EditorContent,
  EditorCommandList,
} from "novel";
import { Save, FileText } from "lucide-react";

export default function NovelEditorPage() {
  const [content, setContent] = useState("");
  const [savedStatus, setSavedStatus] = useState("");

  // Load saved content on mount
  useEffect(() => {
    const saved = localStorage.getItem("novel-content");
    if (saved) {
      setContent(saved);
    }
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (!content) return;

    const autoSave = setTimeout(() => {
      localStorage.setItem("novel-content", content);
      setSavedStatus("Saved");
      setTimeout(() => setSavedStatus(""), 2000);
    }, 1000);

    return () => clearTimeout(autoSave);
  }, [content]);

  const handleManualSave = () => {
    localStorage.setItem("novel-content", content);
    setSavedStatus("Saved manually");
    setTimeout(() => setSavedStatus(""), 2000);
  };

  const handleExport = () => {
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-800">Novel Editor</span>
            </div>

            <div className="flex items-center gap-3">
              {savedStatus && (
                <div className="text-sm text-green-600">{savedStatus}</div>
              )}
              <button
                onClick={handleManualSave}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Container */}
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 min-h-screen">
          <EditorRoot>
            <EditorContent
              initialContent={content}
              onUpdate={({ editor }) => {
                const html = editor.getHTML();
                if (html) {
                  setContent(html);
                }
              }}
              className="novel-editor"
            />
          </EditorRoot>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        .novel-editor {
          padding: 3rem;
          min-height: 100vh;
        }

        .novel-editor .ProseMirror {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          font-size: 1rem;
          line-height: 1.6;
          color: #1f2937;
        }

        .novel-editor .ProseMirror:focus {
          outline: none;
        }

        .novel-editor .ProseMirror h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }

        .novel-editor .ProseMirror h2 {
          font-size: 2rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }

        .novel-editor .ProseMirror h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }

        .novel-editor .ProseMirror p {
          margin: 0.75rem 0;
        }

        .novel-editor .ProseMirror ul,
        .novel-editor .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 0.75rem 0;
        }

        .novel-editor .ProseMirror li {
          margin: 0.25rem 0;
        }

        .novel-editor .ProseMirror code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
        }

        .novel-editor .ProseMirror pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }

        .novel-editor .ProseMirror blockquote {
          border-left: 3px solid #d1d5db;
          padding-left: 1rem;
          color: #6b7280;
          font-style: italic;
          margin: 1rem 0;
        }

        .novel-editor .ProseMirror a {
          color: #3b82f6;
          text-decoration: underline;
        }

        .novel-editor .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
      `}</style>
    </div>
  );
}
