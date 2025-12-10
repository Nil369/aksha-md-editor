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

export function MarkdownEditor({
  value,
  defaultValue = "# Hello, Markdown!\n\nStart typing...",
  onChange,
  defaultViewMode = "split",
  theme = "auto",
  height = "600px",
  className = "",
  placeholder = "Start typing...",
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
  
  const containerRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);

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
      const newRatio = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
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
                e.currentTarget.style.background = isDark ? "#4b5563" : "#d1d5db";
              }
            }}
            onMouseLeave={(e) => {
              if (!isResizing) {
                e.currentTarget.style.background = isDark ? "#374151" : "#e5e7eb";
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
              width:
                viewMode === "split" ? `${100 - splitRatio}%` : "100%",
              overflow: "hidden",
            }}
          >
            <Preview content={debouncedValue} theme={theme} />
          </div>
        )}
      </div>
    </div>
  );
}
