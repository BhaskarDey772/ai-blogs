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
import { useEffect, useState, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";
import { marked } from "marked";
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
import { Editor } from "@tiptap/core";

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
      content: [{ type: "text", text: "Start typing something…/" }],
    },
  ],
};

import { editorApi } from "@/api/client";
import extractTitleFromContent from "@/lib/titleExtractor";

const TailwindAdvancedEditor = ({
  value,
  onChange,
  readOnly = false,
  articleId,
}: {
  value?: string;
  onChange?: (content: string) => void;
  readOnly?: boolean;
  articleId?: string | undefined;
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

  const highlightCodeblocks = (content: string) => {
    const doc = new DOMParser().parseFromString(content, "text/html");
    doc.querySelectorAll("pre code").forEach((el) => {
      // @ts-ignore
      hljs.highlightElement(el);
    });
    return new XMLSerializer().serializeToString(doc);
  };

  const debouncedUpdates = useDebouncedCallback((editor: EditorInstance) => {
    const json = editor.getJSON();
    setCharsCount(editor.storage.characterCount.words());
    setSaveStatus("Saved");

    if (!readOnly) {
      onChange?.(JSON.stringify(json));
    }
  }, 400);

  const latestDraftRef = useRef<string | null>(null);
  const heartbeatTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;

    async function resolveInitial() {
      if (value && value.trim().length > 0) {
        try {
          const json = JSON.parse(value);
          if (!mounted) return;
          setInitialContent(json);
          return;
        } catch (err) {
          const html = marked(value);
          const editor = new Editor({
            extensions: defaultExtensions as any,
            content: html,
          });

          const json = editor.getJSON();
          editor.destroy();
          if (!mounted) return;
          setInitialContent(json);
          return;
        }
      }

      // No server value — try server-side draft if editing/creating
      if (!readOnly) {
        try {
          const draft = await editorApi.getDraft(articleId);
          if (draft && (draft.content || draft.title)) {
            if (draft.content) {
              try {
                const parsed = JSON.parse(draft.content);
                if (!mounted) return;
                setInitialContent(parsed as JSONContent);
                return;
              } catch (e) {
                // Not JSON — ignore
              }
            }
          }
        } catch (e) {
          console.warn("Failed to load draft from server", e);
        }
      }

      // Fallback default
      if (!mounted) return;
      setInitialContent(HARD_CODED_INITIAL);
    }

    resolveInitial();

    return () => {
      mounted = false;
    };
  }, [value, readOnly, articleId]);

  // Heartbeat: send transient drafts to backend periodically
  useEffect(() => {
    if (readOnly) return;

    const sendHeartbeat = async () => {
      const content = latestDraftRef.current;
      if (!content) return;
      try {
        const title = extractTitleFromContent(content);
        await editorApi.heartbeat(articleId, content as string, title);
        setSaveStatus("Saved (draft)");
      } catch (e) {
        setSaveStatus("Error saving draft");
      }
    };

    // every 5s
    heartbeatTimerRef.current = window.setInterval(sendHeartbeat, 5000);

    // on unload/cleanup flush to DB
    const handleStop = async () => {
      try {
        await editorApi.stop(articleId);
      } catch (e) {
        console.warn("Failed to flush draft on stop", e);
      }
    };

    window.addEventListener("beforeunload", handleStop);

    return () => {
      if (heartbeatTimerRef.current) window.clearInterval(heartbeatTimerRef.current);
      window.removeEventListener("beforeunload", handleStop);
      // flush once on unmount
      (async () => {
        try {
          await editorApi.stop(articleId);
        } catch (e) {
          console.warn("Failed to flush draft on unmount", e);
        }
      })();
    };
  }, [readOnly, articleId]);

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
          className="relative min-h-[420px] w-full bg-slate-900 text-white sm:rounded-lg sm:border sm:border-slate-700 sm:shadow-card-lg"
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
                "prose prose-invert prose-headings:text-white prose-p:text-slate-200 prose-strong:text-white max-w-3xl focus:outline-none px-6 py-8",
            },
          }}
          onUpdate={({ editor }) => {
            setSaveStatus("Unsaved");
            debouncedUpdates(editor);
            const json = editor.getJSON();
            const asString = JSON.stringify(json);
            latestDraftRef.current = asString;
            onChange?.(asString);
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
