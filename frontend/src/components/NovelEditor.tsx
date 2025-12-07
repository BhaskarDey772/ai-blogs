"use client";

import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  type EditorInstance,
  EditorRoot,
  ImageResizer,
  type JSONContent,
  handleCommandNavigation,
  handleImageDrop,
  handleImagePaste,
} from "novel";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { defaultExtensions } from "./extensions";
import { ColorSelector } from "./selectors/color-selector";
import { LinkSelector } from "./selectors/link-selector";
import { MathSelector } from "./selectors/math-selector";
import { NodeSelector } from "./selectors/node-selector";
import { Separator } from "./ui/separator";

import GenerativeMenuSwitch from "./generative/generative-menu-switch";
import { uploadFn } from "./image-upload";
import { TextButtons } from "./selectors/text-buttons";
import { slashCommand, suggestionItems } from "./slash-command";

import hljs from "highlight.js";

const extensions = [...defaultExtensions, slashCommand];

/** Minimal valid Novel JSON */
const HARD_CODED_INITIAL: JSONContent = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Hello Novel 👋" }],
    },
    {
      type: "paragraph",
      content: [{ type: "text", text: "Start typing something…" }],
    },
  ],
};

const TailwindAdvancedEditor = ({
  value,
  onChange,
  readOnly = false,
}: {
  value?: string;
  onChange?: (content: string) => void;
  readOnly?: boolean;
}) => {
  const [initialContent, setInitialContent] = useState<JSONContent | null>(
    null
  );
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [charsCount, setCharsCount] = useState<number>(0);

  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);

  // highlight code blocks
  const highlightCodeblocks = (content: string) => {
    const doc = new DOMParser().parseFromString(content, "text/html");
    doc.querySelectorAll("pre code").forEach((el) => {
      // @ts-ignore
      hljs.highlightElement(el);
    });
    return new XMLSerializer().serializeToString(doc);
  };

  /** DEBOUNCED: console.log only */
  const debouncedUpdates = useDebouncedCallback((editor: EditorInstance) => {
    const json = editor.getJSON();
    const html = highlightCodeblocks(editor.getHTML());
    const markdown = editor.storage.markdown?.getMarkdown?.() ?? "";

    // Save to localStorage
    window.localStorage.setItem("novel-content", JSON.stringify(json));
    window.localStorage.setItem("html-content", html);
    window.localStorage.setItem("markdown", markdown);

    setCharsCount(editor.storage.characterCount.words());
    setSaveStatus("Saved");

    // Pass updated Markdown to parent (BlogEdit)
    if (!readOnly) {
      onChange?.(JSON.stringify(json));
    }
  }, 400);

  /** Instead of reading from localStorage, we set HARD-CODED content */
  useEffect(() => {
    // 1. If BlogEdit gives us JSON string from backend → use it
    if (value) {
      try {
        setInitialContent(JSON.parse(value));
        return;
      } catch (err) {
        console.error("Invalid JSON from backend:", err);
      }
    }

    // 2. Else load from localStorage
    const ls = window.localStorage.getItem("novel-content");
    if (ls) {
      try {
        setInitialContent(JSON.parse(ls));
        return;
      } catch (e) {
        console.error("Invalid JSON in localStorage");
      }
    }

    // 3. Fallback minimal doc (required for Novel)
    setInitialContent({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Start writing…" }],
        },
      ],
    });
  }, [value]);

  if (!initialContent) return null;

  return (
    <div className="relative w-full">
      {/* Status badges */}
      <div className="flex absolute right-5 top-5 z-10 mb-5 gap-2">
        <div className="rounded-full bg-dark/80 dark:bg-slate-800/80 px-3 py-1 text-sm font-medium text-slate-700 dark:text-slate-200 shadow">
          {saveStatus}
        </div>
        {charsCount > 0 && (
          <div className="rounded-full bg-dark/80 dark:bg-slate-800/80 px-3 py-1 text-sm font-medium text-slate-700 dark:text-slate-200 shadow">
            {charsCount} Words
          </div>
        )}
      </div>

      <EditorRoot>
        <EditorContent
          initialContent={initialContent}
          editable={!readOnly}
          extensions={extensions as any}
          className="relative min-h-[420px] w-full bg-dark dark:bg-slate-800 sm:rounded-lg sm:border sm:border-slate-100 dark:sm:border-slate-700 sm:shadow-card-lg"
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            handlePaste: (view, event) =>
              handleImagePaste(view, event, uploadFn),
            handleDrop: (view, event, _slice, moved) =>
              handleImageDrop(view, event, moved, uploadFn),
            attributes: {
              class:
                "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-3xl px-6 py-8 mx-auto",
            },
          }}
          onUpdate={({ editor }) => {
            setSaveStatus("Unsaved");
            debouncedUpdates(editor);
            const json = editor.getJSON();
            onChange?.(JSON.stringify(json));
          }}
          slotAfter={<ImageResizer />}
        >
          {/* Slash Commands */}
          <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
            <EditorCommandEmpty className="px-2 text-muted-foreground">
              No results
            </EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map((item) => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={(val) => item.command?.(val)}
                  key={item.title}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-background border-muted">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>

          {/* Top toolbar — hide interactive controls when readOnly */}
          {!readOnly && (
            <GenerativeMenuSwitch open={openAI} onOpenChange={setOpenAI}>
              <Separator orientation="vertical" />
              <NodeSelector open={openNode} onOpenChange={setOpenNode} />
              <Separator orientation="vertical" />
              <LinkSelector open={openLink} onOpenChange={setOpenLink} />
              <Separator orientation="vertical" />
              <MathSelector />
              <Separator orientation="vertical" />
              <TextButtons />
              <Separator orientation="vertical" />
              <ColorSelector open={openColor} onOpenChange={setOpenColor} />
            </GenerativeMenuSwitch>
          )}
        </EditorContent>
      </EditorRoot>
    </div>
  );
};

export default TailwindAdvancedEditor;
