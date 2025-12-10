import { useCallback, useMemo, useRef, memo, useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";
import type { ThemeMode, ToolbarGroup, WordWrap } from "../types";
import {
  Bold,
  Italic,
  Underline,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  List,
  ListOrdered,
  Undo2,
  Redo2,
  Heading,
  Quote,
  Code2,
  Table,
  ChevronDown,
  Palette,
  Highlighter,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Search,
  HelpCircle,
} from "lucide-react";

type EditorProps = {
  value: string;
  onChange: (value: string) => void;
  onDebouncedChange?: (value: string) => void;
  theme?: ThemeMode;
  height?: string;
  showLineNumbers?: boolean;
  wordWrap?: WordWrap;
  fontSize?: number;
  minimap?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  enableToolbar?: boolean;
  performanceMode?: boolean;
  toolbarGroups?: ToolbarGroup[];
  onSave?: (value: string) => void;
  className?: string;
};

const ALL_GROUPS: ToolbarGroup[] = [
  "undo-redo",
  "formatting",
  "lists",
  "insert",
];

export const Editor = memo(function Editor({
  value,
  onChange,
  onDebouncedChange,
  theme = "auto",
  height = "100%",
  showLineNumbers = true,
  wordWrap = "on",
  fontSize = 14,
  minimap = false,
  readOnly = false,
  placeholder,
  enableToolbar = true,
  performanceMode = false,
  toolbarGroups = ALL_GROUPS,
  onSave,
  className = "",
}: EditorProps) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [showAlignMenu, setShowAlignMenu] = useState(false);

  const resolvedTheme = useMemo(() => {
    if (theme !== "auto") return theme;
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }, [theme]);

  const editorOptions: Monaco.editor.IStandaloneEditorConstructionOptions =
    useMemo(
      () => ({
        readOnly,
        minimap: { enabled: minimap },
        automaticLayout: true,
        lineNumbers: showLineNumbers ? "on" : "off",
        wordWrap:
          wordWrap === "wordWrapColumn" ? "wordWrapColumn" : (wordWrap as any),
        fontSize,
        scrollBeyondLastLine: !performanceMode,
        smoothScrolling: !performanceMode,
        renderWhitespace: "selection",
        cursorBlinking: "smooth",
      }),
      [readOnly, minimap, showLineNumbers, wordWrap, fontSize, performanceMode]
    );

  const applyWrap = useCallback((prefix: string, suffix: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    const selection = editor.getSelection();
    const model = editor.getModel();
    const text = model?.getValueInRange(selection) ?? "";
    editor.executeEdits("", [
      {
        range: selection,
        text: `${prefix}${text}${suffix}`,
      },
    ]);
    editor.focus();
  }, []);

  const insertText = useCallback((text: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    const selection = editor.getSelection();
    editor.executeEdits("", [
      {
        range: selection,
        text,
      },
    ]);
    editor.focus();
  }, []);

  const toggleList = useCallback((ordered: boolean) => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;
    const selection = editor.getSelection();
    const model = editor.getModel();
    const start = selection.startLineNumber;
    const end = selection.endLineNumber;
    const edits: any[] = [];
    let counter = 1;
    for (let line = start; line <= end; line++) {
      const lineContent = model.getLineContent(line);
      const trimmed = lineContent.trim();
      if (!trimmed) continue;
      const match = ordered
        ? lineContent.match(/^(\s*)\d+\.\s(.*)/)
        : lineContent.match(/^(\s*)[-*+]\s(.*)/);
      if (match) {
        edits.push({
          range: new monaco.Range(line, 1, line, lineContent.length + 1),
          text: `${match[1]}${match[2]}`,
        });
      } else {
        const indent = lineContent.match(/^(\s*)(.*)/);
        const leading = indent ? indent[1] : "";
        const text = indent ? indent[2] : lineContent;
        const marker = ordered ? `${counter}. ` : "- ";
        edits.push({
          range: new monaco.Range(line, 1, line, lineContent.length + 1),
          text: `${leading}${marker}${text}`,
        });
        if (ordered) counter += 1;
      }
    }
    if (edits.length) {
      editor.executeEdits("", edits);
      editor.focus();
    }
  }, []);

  const insertHeading = useCallback((level: number) => {
    const editor = editorRef.current;
    if (!editor) return;
    const selection = editor.getSelection();
    const model = editor.getModel();
    const lineNumber = selection.startLineNumber;
    const lineContent = model.getLineContent(lineNumber);
    const prefix = "#".repeat(level) + " ";

    // Remove existing heading if present
    const cleaned = lineContent.replace(/^#+\s*/, "");
    const newText = prefix + cleaned;

    const monaco = monacoRef.current;
    editor.executeEdits("", [
      {
        range: new monaco.Range(lineNumber, 1, lineNumber, lineContent.length + 1),
        text: newText,
      },
    ]);
    editor.focus();
    setShowHeadingMenu(false);
  }, []);

  const applyColor = useCallback((color: string) => {
    applyWrap(`<span style="color: ${color}">`, "</span>");
    setShowColorMenu(false);
  }, [applyWrap]);

  const applyHighlight = useCallback((color: string) => {
    applyWrap(`<mark style="background-color: ${color}">`, "</mark>");
    setShowHighlightMenu(false);
  }, [applyWrap]);

  const applyAlignment = useCallback((align: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    const selection = editor.getSelection();
    const model = editor.getModel();
    const text = model?.getValueInRange(selection) ?? "";
    const wrapped = `<div style="text-align: ${align}">\n\n${text}\n\n</div>`;
    editor.executeEdits("", [
      {
        range: selection,
        text: wrapped,
      },
    ]);
    editor.focus();
    setShowAlignMenu(false);
  }, []);

  const handleMount = useCallback(
    (editor: any, monaco: any) => {
      editorRef.current = editor;
      monacoRef.current = monaco;
      editor.focus();

      // Add keyboard shortcuts
      editor.addAction({
        id: "md-bold",
        label: "Bold",
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB],
        run: () => applyWrap("**", "**"),
      });

      editor.addAction({
        id: "md-italic",
        label: "Italic",
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI],
        run: () => applyWrap("*", "*"),
      });

      editor.addAction({
        id: "md-underline",
        label: "Underline",
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyU],
        run: () => applyWrap("<u>", "</u>"),
      });

      editor.addAction({
        id: "md-inline-code",
        label: "Inline code",
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Backquote],
        run: () => applyWrap("`", "`"),
      });

      editor.addAction({
        id: "md-code-block",
        label: "Code block",
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyK],
        run: () => applyWrap("```\n", "\n```"),
      });

      editor.addAction({
        id: "md-link",
        label: "Insert link",
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK],
        run: () => applyWrap("[", "](url)"),
      });

      editor.addAction({
        id: "md-image",
        label: "Insert image",
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyI],
        run: () => applyWrap("![alt text](", ")"),
      });

      editor.addAction({
        id: "md-blockquote",
        label: "Blockquote",
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyQ],
        run: () => {
          const selection = editor.getSelection();
          const text = editor.getModel().getValueInRange(selection);
          const lines = text.split("\n");
          const replacement = lines.map((line: string) => `> ${line}`).join("\n");
          editor.executeEdits("", [{ range: selection, text: replacement }]);
        },
      });

      editor.addAction({
        id: "md-table",
        label: "Insert table",
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyT],
        run: () => insertText("\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n"),
      });

      editor.addAction({
        id: "md-save",
        label: "Save",
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
        run: () => {
          if (onSave) {
            onSave(editor.getValue());
          }
        },
      });
    },
    [applyWrap, insertText, onSave]
  );

  const onChangeHandler = useCallback(
    (val?: string) => {
      const newValue = val ?? "";
      onChange(newValue);

      if (onDebouncedChange) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
          onDebouncedChange(newValue);
        }, 300);
      }
    },
    [onChange, onDebouncedChange]
  );

  const isDark = resolvedTheme === "dark";

  const buttonStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px",
    borderRadius: "4px",
    border: "none",
    background: "transparent",
    color: isDark ? "#d1d5db" : "#374151",
    cursor: "pointer",
    transition: "all 0.2s ease",
  };

  const separatorStyle = {
    width: "1px",
    height: "24px",
    background: isDark ? "#4b5563" : "#d1d5db",
    margin: "0 4px",
  };

  const dropdownStyle = {
    position: "absolute" as const,
    top: "100%",
    left: 0,
    marginTop: "4px",
    background: isDark ? "#1f2937" : "#ffffff",
    border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
    borderRadius: "6px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    zIndex: 1000,
    minWidth: "150px",
  };

  const dropdownItemStyle = {
    padding: "8px 12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: isDark ? "#d1d5db" : "#374151",
    transition: "background 0.15s ease",
  };

  return (
    <div className={`markdown-editor ${className}`} style={{ height, display: "flex", flexDirection: "column" }}>
      {enableToolbar && (
        <div
          className="toolbar"
          role="toolbar"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2px",
            padding: "8px",
            borderBottom: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
            background: isDark ? "#1f2937" : "#f9fafb",
            flexWrap: "wrap",
            position: "relative",
          }}
        >
          {/* Undo/Redo */}
          {toolbarGroups.includes("undo-redo") && (
            <>
              <button
                type="button"
                onClick={() => editorRef.current?.trigger("keyboard", "undo", null)}
                title="Undo (Ctrl+Z)"
                style={buttonStyle}
                onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "#374151" : "#e5e7eb")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Undo2 size={18} />
              </button>
              <button
                type="button"
                onClick={() => editorRef.current?.trigger("keyboard", "redo", null)}
                title="Redo (Ctrl+Y)"
                style={buttonStyle}
                onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "#374151" : "#e5e7eb")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Redo2 size={18} />
              </button>
              <div style={separatorStyle} aria-hidden />
            </>
          )}

          {/* Headings */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setShowHeadingMenu(!showHeadingMenu)}
              title="Headings"
              style={{ ...buttonStyle, gap: "4px" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "#374151" : "#e5e7eb")}
              onMouseLeave={(e) => (e.currentTarget.style.background = showHeadingMenu ? (isDark ? "#374151" : "#e5e7eb") : "transparent")}
            >
              <Heading size={18} />
              <ChevronDown size={14} />
            </button>
            {showHeadingMenu && (
              <div style={dropdownStyle}>
                {[1, 2, 3, 4, 5, 6].map((level) => (
                  <div
                    key={level}
                    onClick={() => insertHeading(level)}
                    style={dropdownItemStyle}
                    onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "#374151" : "#f3f4f6")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <Type size={16} />
                    <span>Heading {level}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={separatorStyle} aria-hidden />

          {/* Formatting */}
          {toolbarGroups.includes("formatting") && (
            <>
              <button
                type="button"
                onClick={() => applyWrap("**", "**")}
                title="Bold (Ctrl+B)"
                style={buttonStyle}
                onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "#374151" : "#e5e7eb")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Bold size={18} />
              </button>
              <button
                type="button"
                onClick={() => applyWrap("*", "*")}
                title="Italic (Ctrl+I)"
                style={buttonStyle}
                onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "#374151" : "#e5e7eb")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Italic size={18} />
              </button>
              <button
                type="button"
                onClick={() => applyWrap("<u>", "</u>")}
                title="Underline (Ctrl+U)"
                style={buttonStyle}
                onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "#374151" : "#e5e7eb")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Underline size={18} />
              </button>
              <button
                type="button"
                onClick={() => applyWrap("`", "`")}
                title="Inline Code (Ctrl+`)"
                style={buttonStyle}
                onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "#374151" : "#e5e7eb")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Code size={18} />
              </button>
              <button
                type="button"
                onClick={() => applyWrap("```\n", "\n```")}
                title="Code Block (Ctrl+Shift+K)"
                style={buttonStyle}
                onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "#374151" : "#e5e7eb")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Code2 size={18} />
              </button>
              <div style={separatorStyle} aria-hidden />
            </>
          )}

          {/* Insert */}
          {toolbarGroups.includes("insert") && (
            <>
              <button
                type="button"
                onClick={() => applyWrap("[", "](url)")}
                title="Insert Link (Ctrl+K)"
                style={buttonStyle}
                onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "#374151" : "#e5e7eb")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <LinkIcon size={18} />
              </button>
              <button
                type="button"
                onClick={() => applyWrap("![alt text](", ")")}
                title="Insert Image (Ctrl+Shift+I)"
                style={buttonStyle}
                onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "#374151" : "#e5e7eb")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <ImageIcon size={18} />
              </button>
              <button
                type="button"
                onClick={() => insertText("\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n")}
                title="Insert Table (Ctrl+Shift+T)"
                style={buttonStyle}
                onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "#374151" : "#e5e7eb")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Table size={18} />
              </button>
              <button
                type="button"
                onClick={() => {
                  const editor = editorRef.current;
                  if (!editor) return;
                  const selection = editor.getSelection();
                  const text = editor.getModel().getValueInRange(selection);
                  const lines = text.split("\n");
                  const replacement = lines.map((line: string) => `> ${line}`).join("\n");
                  editor.executeEdits("", [{ range: selection, text: replacement }]);
                }}
                title="Blockquote (Ctrl+Shift+Q)"
                style={buttonStyle}
                onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "#374151" : "#e5e7eb")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Quote size={18} />
              </button>
              <div style={separatorStyle} aria-hidden />
            </>
          )}

          {/* Color & Highlight */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setShowColorMenu(!showColorMenu)}
              title="Text Color"
              style={{ ...buttonStyle, gap: "4px" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "#374151" : "#e5e7eb")}
              onMouseLeave={(e) => (e.currentTarget.style.background = showColorMenu ? (isDark ? "#374151" : "#e5e7eb") : "transparent")}
            >
              <Palette size={18} />
              <ChevronDown size={14} />
            </button>
            {showColorMenu && (
              <div style={{ ...dropdownStyle, padding: "12px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                  {["red", "blue", "green", "orange", "purple", "pink", "yellow", "cyan"].map((color) => (
                    <button
                      key={color}
                      onClick={() => applyColor(color)}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "4px",
                        border: `2px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                        background: color,
                        cursor: "pointer",
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setShowHighlightMenu(!showHighlightMenu)}
              title="Highlight"
              style={{ ...buttonStyle, gap: "4px" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "#374151" : "#e5e7eb")}
              onMouseLeave={(e) => (e.currentTarget.style.background = showHighlightMenu ? (isDark ? "#374151" : "#e5e7eb") : "transparent")}
            >
              <Highlighter size={18} />
              <ChevronDown size={14} />
            </button>
            {showHighlightMenu && (
              <div style={{ ...dropdownStyle, padding: "12px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                  {["yellow", "lightgreen", "lightblue", "pink", "plum"].map((color) => (
                    <button
                      key={color}
                      onClick={() => applyHighlight(color)}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "4px",
                        border: `2px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                        background: color,
                        cursor: "pointer",
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={separatorStyle} aria-hidden />

          {/* Alignment */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setShowAlignMenu(!showAlignMenu)}
              title="Text Alignment"
              style={{ ...buttonStyle, gap: "4px" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "#374151" : "#e5e7eb")}
              onMouseLeave={(e) => (e.currentTarget.style.background = showAlignMenu ? (isDark ? "#374151" : "#e5e7eb") : "transparent")}
            >
              <AlignLeft size={18} />
              <ChevronDown size={14} />
            </button>
            {showAlignMenu && (
              <div style={dropdownStyle}>
                {[
                  { align: "left", icon: AlignLeft, label: "Left" },
                  { align: "center", icon: AlignCenter, label: "Center" },
                  { align: "right", icon: AlignRight, label: "Right" },
                ].map(({ align, icon: Icon, label }) => (
                  <div
                    key={align}
                    onClick={() => applyAlignment(align)}
                    style={dropdownItemStyle}
                    onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "#374151" : "#f3f4f6")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lists */}
          {toolbarGroups.includes("lists") && (
            <>
              <button
                type="button"
                onClick={() => toggleList(false)}
                title="Bullet List"
                style={buttonStyle}
                onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "#374151" : "#e5e7eb")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <List size={18} />
              </button>
              <button
                type="button"
                onClick={() => toggleList(true)}
                title="Numbered List"
                style={buttonStyle}
                onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "#374151" : "#e5e7eb")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <ListOrdered size={18} />
              </button>
              <div style={separatorStyle} aria-hidden />
            </>
          )}

          {/* Search & Help */}
          <button
            type="button"
            onClick={() => editorRef.current?.trigger("keyboard", "actions.find", null)}
            title="Find (Ctrl+F)"
            style={buttonStyle}
            onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "#374151" : "#e5e7eb")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Search size={18} />
          </button>
          <button
            type="button"
            onClick={() => window.open("https://www.markdownguide.org/", "_blank")}
            title="Markdown Guide"
            style={buttonStyle}
            onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "#374151" : "#e5e7eb")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <HelpCircle size={18} />
          </button>
        </div>
      )}

      <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
        {!value && placeholder && (
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              pointerEvents: "none",
              color: "#94a3b8",
              fontSize: "14px",
              zIndex: 1,
            }}
          >
            {placeholder}
          </div>
        )}

        <MonacoEditor
          height="100%"
          language="markdown"
          value={value}
          onChange={onChangeHandler}
          onMount={handleMount}
          theme={resolvedTheme === "dark" ? "vs-dark" : "vs"}
          options={editorOptions}
        />
      </div>

      <div
        style={{
          borderTop: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
          padding: "8px 12px",
          fontSize: "12px",
          color: isDark ? "#9ca3af" : "#6b7280",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: isDark ? "#1f2937" : "#f9fafb",
        }}
      >
        <span>{value.length.toLocaleString()} chars</span>
        {performanceMode && <span>⚡ Performance mode</span>}

                <a
          href="https://akashhalder.in"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: "12px",
            color: isDark ? "#9ca3af" : "#6b7280",
            textDecoration: "none",
            transition: "all 0.2s ease",
            padding: "2px 6px",
            borderRadius: "4px",
            whiteSpace: "nowrap",
            fontWeight: "500",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = isDark ? "#a78bfa" : "#7c3aed";
            e.currentTarget.style.background = isDark
              ? "rgba(139, 92, 246, 0.1)"
              : "rgba(124, 58, 237, 0.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = isDark ? "#9ca3af" : "#6b7280";
            e.currentTarget.style.background = "transparent";
          }}
        >
          Aksha MD Editor - Akash Halder Technologia
        </a>
      </div>
    </div>
  );
});
