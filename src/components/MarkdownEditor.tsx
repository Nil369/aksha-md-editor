import { useCallback, useState, useRef, useEffect, useMemo } from "react";
import { Editor } from "./Editor";
import { Preview } from "./Preview";
import { EditorTabs } from "./EditorTabs";
import type { ThemeMode, ToolbarGroup, ViewMode, WordWrap } from "../types";

type MarkdownEditorProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  defaultViewMode?: ViewMode;
  theme?: ThemeMode;
  height?: string;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
  showLineNumbers?: boolean;
  enableToolbar?: boolean;
  toolbarGroups?: ToolbarGroup[];
  wordWrap?: WordWrap;
  fontSize?: number;
  minimap?: boolean;
  performanceMode?: boolean;
  onSave?: (value: string) => void;
  enableFullscreen?: boolean;
  enableResize?: boolean;
};

const val = `# Welcome to Aksha-MD-Editor 🙏

A streamlined, developer-friendly markdown editor built to help you write faster, organize better, and integrate seamlessly into modern React applications.

You can begin typing your markdown content below. The editor supports advanced formatting, tables, lists, KaTeX, syntax-highlighted code blocks, and more.

## List Examples

### Unordered Lists

* Item 1

  * Sub-item 1.1
  * Sub-item 1.2

    * Sub-sub-item 1.2.1
    * Sub-sub-item 1.2.2

### Ordered Lists

1. Step one
2. Step two

   1. Sub-step 2.1
   2. Sub-step 2.2

## Table Example

| Feature       | Description               |
| ------------- | ------------------------- |
| Live Preview  | Real-time rendered output |
| KaTeX Support | Render math expressions   |

## KaTeX Mathematics

React-MD-Editor fully supports KaTeX, enabling mathematical writing suitable for technical blogs, documentation, or study materials.

### Inline Examples

* Energy relation: $E = mc^2$
* Right-triangle relation: $c = \\sqrt{a^2 + b^2}$
* Quadratic roots: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$

### Display Mode

$$
\\int_{0}^{1} x^2 \\, dx = \\frac{1}{3}
$$

$$
S_n = \\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
$$

---

## Code Snippets

React-MD-Editor supports fenced code blocks with syntax highlighting.

### JavaScript

\`\`\`javascript
const total = (price, tax) => {
  return price + price * tax;
};
console.log(total(50, 0.1));
\`\`\`

### Python

\`\`\`python
def square(n):
    return n * n
\`\`\`

### PHP

\`\`\`php
<?php
$config = [
  'host' => 'localhost',
  'port' => 3306
];
echo "Configuration Loaded";
?>
\`\`\`

### Inline Code

Use backticks for inline expressions such as \\\`npm install react-md-editor\\\`.

---

## Text Formatting

**Bold text**
*Italic text*
***Combined formatting***

> Blockquotes
> Additional lines supported

---
## Mermaid and ECharts

Add diagrams and charts with fenced code blocks:

- mermaid

\`\`\`mermaid
flowchart TD
  A[Start] --> B{Decision}
  B -- Yes --> C[Do]
  B -- No  --> D[Skip]
\`\`\`

- echarts

\`\`\`echarts
{
  "xAxis": { "type": "category", "data": ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] },
  "yAxis": { "type": "value" },
  "series": [ { "type": "line", "data": [150,230,224,218,135,147,260] } ]
}
\`\`\`

---

<div align="center">
  <p>Made with ❤️ by Akash Halder</p>
  <p>
    <a href="https://github.com/Nil369/aksha-md-editor" style="margin-right:20px;">⭐ Star us on GitHub
    </a>
    <a href="https://aksha-md-editor-docs.akashhalder.in/" style="margin-right:10px;">📜 Visit the Docs
    </a>
  </p>
</div>

`;

/**
 * **MarkdownEditor** - A full-featured markdown editor with live preview
 *
 * This is the main component that combines the Editor and Preview components
 * into a complete markdown editing experience.
 *
 * Features:
 * - Split view, edit-only, or preview-only modes
 * - Real-time preview with syntax highlighting
 * - KaTeX math rendering
 * - Mermaid diagrams and ECharts support
 * - Resizable split view
 * - Fullscreen mode
 * - Auto-scroll synchronization
 * - Table of contents sidebar
 * - Customizable toolbar
 *
 * @param props - MarkdownEditor component props
 * @returns The rendered markdown editor component
 *
 * @example
 * ```tsx
 * <MarkdownEditor
 *   value={content}
 *   onChange={setContent}
 *   theme="dark"
 *   height="700px"
 *   defaultViewMode="split"
 * />
 * ```
 */
export function MarkdownEditor({
  value,
  defaultValue = val,
  onChange,
  defaultViewMode = "split",
  theme = "auto",
  height = "600px",
  className = "",
  placeholder = "Start Writing Your Markdown Content Here...",
  readOnly = false,
  showLineNumbers = true,
  enableToolbar = true,
  toolbarGroups,
  wordWrap = "on",
  fontSize = 14,
  minimap = false,
  performanceMode = false,
  onSave,
  enableFullscreen = true,
  enableResize = true,
}: MarkdownEditorProps) {
  const isControlled = typeof value === "string";
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [debouncedValue, setDebouncedValue] = useState(defaultValue);
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [splitRatio, setSplitRatio] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);
  const previewScrollRef = useRef<HTMLDivElement | null>(null);

  const currentValue = isControlled ? (value as string) : internalValue;

  const resolvedTheme = useMemo(() => {
    if (theme !== "auto") return theme;
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }, [theme]);

  const handleChange = useCallback(
    (next: string) => {
      if (!isControlled) {
        setInternalValue(next);
      }
      onChange?.(next);
    },
    [isControlled, onChange]
  );

  const handleDebouncedChange = useCallback((next: string) => {
    setDebouncedValue(next);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // Handle split view resizing
  useEffect(() => {
    if (!enableResize || viewMode !== "split") return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newRatio =
        ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Clamp between 20% and 80%
      if (newRatio >= 20 && newRatio <= 80) {
        setSplitRatio(newRatio);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, viewMode, enableResize]);

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    position: isFullscreen ? "fixed" : "relative",
    top: isFullscreen ? 0 : undefined,
    left: isFullscreen ? 0 : undefined,
    right: isFullscreen ? 0 : undefined,
    bottom: isFullscreen ? 0 : undefined,
    width: isFullscreen ? "100vw" : undefined,
    height: isFullscreen ? "100vh" : height,
    zIndex: isFullscreen ? 9999 : undefined,
    background: resolvedTheme === "dark" ? "#111827" : "#ffffff",
  };

  const isDark = resolvedTheme === "dark";

  return (
    <div ref={containerRef} className={className} style={containerStyle}>
      <EditorTabs
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isFullscreen={isFullscreen}
        onFullscreenToggle={enableFullscreen ? toggleFullscreen : undefined}
        theme={resolvedTheme}
        autoScroll={autoScroll}
        onToggleAutoScroll={() => setAutoScroll((prev) => !prev)}
        showSidebar={showSidebar}
        onToggleSidebar={() => setShowSidebar((prev) => !prev)}
      />

      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {(viewMode === "edit" || viewMode === "split") && (
          <div
            style={{
              height: "100%",
              width: viewMode === "split" ? `${splitRatio}%` : "100%",
              overflow: "hidden",
            }}
          >
            <Editor
              value={currentValue}
              onChange={handleChange}
              onDebouncedChange={handleDebouncedChange}
              theme={theme}
              height="100%"
              placeholder={placeholder}
              readOnly={readOnly}
              showLineNumbers={showLineNumbers}
              enableToolbar={enableToolbar}
              toolbarGroups={toolbarGroups}
              wordWrap={wordWrap}
              fontSize={fontSize}
              minimap={minimap}
              performanceMode={performanceMode}
              onSave={onSave}
              onScrollChange={(ratio) => {
                if (!autoScroll || !previewScrollRef.current) return;
                const el = previewScrollRef.current;
                const max = el.scrollHeight - el.clientHeight;
                el.scrollTop = Math.max(0, max * ratio);
              }}
            />
          </div>
        )}

        {viewMode === "split" && enableResize && (
          <div
            ref={resizerRef}
            onMouseDown={() => setIsResizing(true)}
            style={{
              width: "4px",
              cursor: "col-resize",
              background: isDark ? "#374151" : "#e5e7eb",
              flexShrink: 0,
              position: "relative",
              transition: isResizing ? "none" : "background 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (!isResizing) {
                e.currentTarget.style.background = isDark
                  ? "#4b5563"
                  : "#d1d5db";
              }
            }}
            onMouseLeave={(e) => {
              if (!isResizing) {
                e.currentTarget.style.background = isDark
                  ? "#374151"
                  : "#e5e7eb";
              }
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "20px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "2px",
              }}
            >
              <div
                style={{
                  width: "2px",
                  height: "20px",
                  background: isDark ? "#6b7280" : "#9ca3af",
                  borderRadius: "1px",
                }}
              />
              <div
                style={{
                  width: "2px",
                  height: "20px",
                  background: isDark ? "#6b7280" : "#9ca3af",
                  borderRadius: "1px",
                }}
              />
            </div>
          </div>
        )}

        {(viewMode === "preview" || viewMode === "split") && (
          <div
            style={{
              height: "100%",
              width: viewMode === "split" ? `${100 - splitRatio}%` : "100%",
              overflow: "hidden",
            }}
          >
            <Preview
              content={debouncedValue}
              theme={theme}
              onScrollContainerRef={(el) => (previewScrollRef.current = el)}
              showSidebar={showSidebar}
              onToggleSidebar={() => setShowSidebar((prev) => !prev)}
              onContentChange={(newContent) => {
                // Update the editor content when checkbox is clicked in preview
                handleChange(newContent);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
