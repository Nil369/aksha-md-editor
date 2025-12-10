import { memo, useEffect, useMemo, useState } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import type { ThemeMode } from "../types";
import "katex/dist/katex.css";
import "../../styles.css";

type PreviewProps = {
  content: string;
  theme?: ThemeMode;
  className?: string;
};

const Skeleton = ({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) => (
  <div
    className={className}
    style={{
      backgroundColor: "rgba(156, 163, 175, 0.2)",
      borderRadius: "4px",
      animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      ...style,
    }}
  />
);

export const Preview = memo(function Preview({
  content,
  theme = "auto",
  className = "",
}: PreviewProps) {
  const [html, setHtml] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const resolvedTheme = useMemo(() => {
    if (theme !== "auto") return theme;
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }, [theme]);

  // Dynamic theme loading for highlight.js
  useEffect(() => {
    if (typeof document === "undefined") return;
    
    // Load highlight.js theme
    const highlightLink = document.createElement("link");
    highlightLink.rel = "stylesheet";
    highlightLink.href =
      resolvedTheme === "dark"
        ? "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"
        : "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css";
    document.head.appendChild(highlightLink);

    return () => {
      if (document.head.contains(highlightLink)) {
        document.head.removeChild(highlightLink);
      }
    };
  }, [resolvedTheme]);

  useEffect(() => {
    const controller = new AbortController();
    
    const render = async () => {
      if (!content) {
        setHtml("");
        setIsProcessing(false);
        return;
      }

      setIsProcessing(true);
      
      try {
        const file = await unified()
          .use(remarkParse)
          .use(remarkGfm)
          .use(remarkMath)
          .use(remarkRehype, { allowDangerousHtml: true })
          .use(rehypeKatex)
          .use(rehypeHighlight)
          .use(rehypeStringify, { allowDangerousHtml: true })
          .process(content);
          
        if (!controller.signal.aborted) {
          setHtml(String(file));
          setIsProcessing(false);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setHtml(
            `<div style="color:#ef4444;padding:12px;border:1px solid #fecdd3;border-radius:8px;background:#fef2f2;">Preview rendering error: ${String(
              error
            )}</div>`
          );
          setIsProcessing(false);
        }
      }
    };

    const timer = setTimeout(() => {
      render();
    }, 100);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [content]);

  const isDark = resolvedTheme === "dark";

  if (!content) {
    return (
      <div
        className={`preview-pane ${className}`}
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isDark ? "#111827" : "#ffffff",
        }}
      >
        <div
          style={{
            textAlign: "center",
            color: isDark ? "#9ca3af" : "#6b7280",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📝</div>
          <p style={{ fontSize: "18px", fontWeight: 500, marginBottom: "8px" }}>
            No content to preview
          </p>
          <p style={{ fontSize: "14px" }}>
            Start typing in the editor to see the preview
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`preview-pane ${className}`}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "16px",
          background: isDark ? "#111827" : "#ffffff",
        }}
      >
        {isProcessing || !html ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Skeleton style={{ height: "32px", width: "75%", margin: "0 auto" }} />
            <Skeleton style={{ height: "16px", width: "100%" }} />
            <Skeleton style={{ height: "16px", width: "85%" }} />
            <Skeleton style={{ height: "16px", width: "80%" }} />
            <div style={{ marginTop: "24px" }}>
              <Skeleton style={{ height: "24px", width: "50%" }} />
              <div style={{ marginTop: "8px" }}>
                <Skeleton style={{ height: "16px", width: "100%" }} />
                <Skeleton style={{ height: "16px", width: "90%", marginTop: "8px" }} />
                <Skeleton style={{ height: "16px", width: "80%", marginTop: "8px" }} />
              </div>
            </div>
            <div style={{ marginTop: "24px" }}>
              <Skeleton style={{ height: "24px", width: "65%" }} />
              <Skeleton style={{ height: "128px", width: "100%", marginTop: "8px" }} />
            </div>
          </div>
        ) : (
          <div
            className={`markdown-body ${isDark ? 'dark' : ''}`}
            data-theme={resolvedTheme}
            data-color-mode={resolvedTheme}
            style={{ 
              wordBreak: "break-word", 
              overflowWrap: "break-word",
              color: isDark ? "#e2e8f0" : "#0f172a"
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>

      <div
        style={{
          padding: "8px 16px",
          fontSize: "12px",
          borderTop: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
          background: isDark ? "#1f2937" : "#f9fafb",
          color: isDark ? "#9ca3af" : "#6b7280",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>
          <strong>Status</strong>
        </span>
        {isProcessing && <span>Processing...</span>}
        {!isProcessing && html && (
          <span style={{ color: "#10b981" }}>✓ Ready</span>
        )}
      </div>
    </div>
  );
});
