import { useCallback, useMemo, useRef, memo, useState, useEffect } from "react";
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
  Strikethrough,
  Smile,
  CheckSquare,
  Copy,
  ZoomIn,
  ZoomOut,
  Indent,
  Outdent,
  ALargeSmall,
  ArrowUpDown,
  X,
} from "lucide-react";

/**
 * Props for the Editor component
 */
type EditorProps = {
  /** The markdown content value */
  value: string;
  /** Callback when content changes */
  onChange: (value: string) => void;
  /** Debounced callback for content changes (fires after 300ms of inactivity) */
  onDebouncedChange?: (value: string) => void;
  /** Theme mode: 'light', 'dark', or 'auto' (default: 'auto') */
  theme?: ThemeMode;
  /** Height of the editor */
  height?: string;
  /** Whether to show line numbers */
  showLineNumbers?: boolean;
  /** Word wrap mode: 'on', 'off', or 'wordWrapColumn' */
  wordWrap?: WordWrap;
  /** Font size in pixels (default: 14) */
  fontSize?: number;
  /** Whether to show the minimap */
  minimap?: boolean;
  /** Whether the editor is read-only */
  readOnly?: boolean;
  /** Placeholder text when editor is empty */
  placeholder?: string;
  /** Whether to show the toolbar */
  enableToolbar?: boolean;
  /** Enable performance mode (disables some features for better performance) */
  performanceMode?: boolean;
  /** Toolbar groups to display */
  toolbarGroups?: ToolbarGroup[];
  /** Callback when save is triggered (Ctrl+S) */
  onSave?: (value: string) => void;
  /** Additional CSS class name */
  className?: string;
  /** Callback when scroll position changes (for sync with preview) */
  onScrollChange?: (ratio: number) => void;
};

const ALL_GROUPS: ToolbarGroup[] = [
  "undo-redo",
  "formatting",
  "lists",
  "insert",
];

/**
 * **Editor component** - Monaco-based markdown editor with rich toolbar
 *
 * This component provides a Monaco Editor instance with a comprehensive
 * toolbar for markdown editing. It supports various formatting options,
 * keyboard shortcuts, and customization.
 *
 * Features:
 * - Monaco Editor integration
 * - Rich formatting toolbar
 * - Keyboard shortcuts (Ctrl+B, Ctrl+I, etc.)
 * - Text colors and highlights
 * - Emoji picker
 * - Table insertion
 * - Code block insertion
 * - Undo/redo support
 * - Zoom controls
 * - Find and replace
 *
 * @param props - Editor component props
 * @returns The rendered editor component
 *
 * @example
 * ```tsx
 * <Editor
 *   value={content}
 *   onChange={setContent}
 *   theme="dark"
 *   enableToolbar={true}
 * />
 * ```
 */
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
  onScrollChange,
}: EditorProps) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [showAlignMenu, setShowAlignMenu] = useState(false);
  const [showEmojiMenu, setShowEmojiMenu] = useState(false);
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);
  const [showLineSpacingMenu, setShowLineSpacingMenu] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(100);
  const [customFontSize, setCustomFontSize] = useState("");

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Don't close if clicking inside toolbar or any dropdown menu
      if (
        !target.closest(".toolbar") &&
        !target.closest("[data-dropdown-menu]")
      ) {
        setShowHeadingMenu(false);
        setShowColorMenu(false);
        setShowHighlightMenu(false);
        setShowAlignMenu(false);
        setShowEmojiMenu(false);
        setShowFontSizeMenu(false);
        setShowLineSpacingMenu(false);
        setShowTableMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [activeTextColor, setActiveTextColor] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem("aksha_active_text_color");
    } catch {
      return null;
    }
  });
  const [activeHighlightColor, setActiveHighlightColor] = useState<
    string | null
  >(() => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem("aksha_active_highlight_color");
    } catch {
      return null;
    }
  });
  const [recentTextColors, setRecentTextColors] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(
        localStorage.getItem("aksha_recent_text_colors") || "[]"
      );
    } catch {
      return [];
    }
  });
  const [recentHighlightColors, setRecentHighlightColors] = useState<string[]>(
    () => {
      if (typeof window === "undefined") return [];
      try {
        return JSON.parse(
          localStorage.getItem("aksha_recent_highlights") || "[]"
        );
      } catch {
        return [];
      }
    }
  );

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
        fontSize: fontSize * (currentZoom / 100),
        scrollBeyondLastLine: !performanceMode,
        smoothScrolling: !performanceMode,
        renderWhitespace: "selection",
        cursorBlinking: "smooth",
      }),
      [
        readOnly,
        minimap,
        showLineNumbers,
        wordWrap,
        fontSize,
        performanceMode,
        currentZoom,
      ]
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

  const toggleTaskList = useCallback(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;
    const selection = editor.getSelection();
    const model = editor.getModel();
    const start = selection.startLineNumber;
    const end = selection.endLineNumber;
    const edits: any[] = [];
    for (let line = start; line <= end; line++) {
      const lineContent = model.getLineContent(line);
      const trimmed = lineContent.trim();
      if (!trimmed) continue;
      // Match task list items: - [ ] or - [x] or * [ ] etc.
      const taskMatch = lineContent.match(/^(\s*)([-*+])\s\[([ xX])\]\s(.*)/);
      if (taskMatch) {
        // Toggle checkbox - if checked, uncheck; if unchecked, check
        const isChecked = taskMatch[3].toLowerCase() === "x";
        const marker = taskMatch[2]; // Keep original marker (-, *, or +)
        edits.push({
          range: new monaco.Range(line, 1, line, lineContent.length + 1),
          text: `${taskMatch[1]}${marker} [${isChecked ? " " : "x"}] ${
            taskMatch[4]
          }`,
        });
      } else {
        // Check if it's already a regular list item
        const listMatch = lineContent.match(/^(\s*)([-*+])\s(.*)/);
        if (listMatch) {
          // Convert regular list to task list
          edits.push({
            range: new monaco.Range(line, 1, line, lineContent.length + 1),
            text: `${listMatch[1]}${listMatch[2]} [ ] ${listMatch[3]}`,
          });
        } else {
          // Add new task list item
          const indent = lineContent.match(/^(\s*)(.*)/);
          const leading = indent ? indent[1] : "";
          const text = indent ? indent[2] : lineContent;
          edits.push({
            range: new monaco.Range(line, 1, line, lineContent.length + 1),
            text: `${leading}- [ ] ${text}`,
          });
        }
      }
    }
    if (edits.length) {
      editor.executeEdits("", edits);
      editor.focus();
    }
  }, []);

  const duplicateLine = useCallback(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;
    const selection = editor.getSelection();
    const model = editor.getModel();
    const start = selection.startLineNumber;
    const end = selection.endLineNumber;
    const lines: string[] = [];
    for (let line = start; line <= end; line++) {
      lines.push(model.getLineContent(line));
    }
    const textToInsert = lines.join("\n") + "\n";
    editor.executeEdits("", [
      {
        range: new monaco.Range(end + 1, 1, end + 1, 1),
        text: textToInsert,
      },
    ]);
    editor.focus();
  }, []);

  const indentLine = useCallback(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;
    const selection = editor.getSelection();
    const start = selection.startLineNumber;
    const end = selection.endLineNumber;
    const edits: any[] = [];
    for (let line = start; line <= end; line++) {
      edits.push({
        range: new monaco.Range(line, 1, line, 1),
        text: "  ",
      });
    }
    if (edits.length) {
      editor.executeEdits("", edits);
      editor.focus();
    }
  }, []);

  const unindentLine = useCallback(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;
    const selection = editor.getSelection();
    const model = editor.getModel();
    const start = selection.startLineNumber;
    const end = selection.endLineNumber;
    const edits: any[] = [];
    for (let line = start; line <= end; line++) {
      const lineContent = model.getLineContent(line);
      if (lineContent.startsWith("  ")) {
        edits.push({
          range: new monaco.Range(line, 1, line, 3),
          text: "",
        });
      } else if (lineContent.startsWith("\t")) {
        edits.push({
          range: new monaco.Range(line, 1, line, 2),
          text: "",
        });
      }
    }
    if (edits.length) {
      editor.executeEdits("", edits);
      editor.focus();
    }
  }, []);

  const insertEmoji = useCallback(
    (emoji: string) => {
      insertText(emoji);
      // Keep the emoji menu open so users can add multiple emojis
      // Menu will only close when user clicks the close button or outside
    },
    [insertText]
  );

  const insertTable = useCallback(
    (rows: number, cols: number) => {
      const editor = editorRef.current;
      if (!editor) return;
      let table = "\n";
      // Header row
      table += "|";
      for (let c = 0; c < cols; c++) {
        table += ` Header ${c + 1} |`;
      }
      table += "\n";
      // Separator
      table += "|";
      for (let c = 0; c < cols; c++) {
        table += " --- |";
      }
      table += "\n";
      // Data rows
      for (let r = 0; r < rows; r++) {
        table += "|";
        for (let c = 0; c < cols; c++) {
          table += ` Cell ${r + 1}-${c + 1} |`;
        }
        table += "\n";
      }
      insertText(table);
      setShowTableMenu(false);
    },
    [insertText]
  );

  const applyFontSize = useCallback(
    (size: string) => {
      applyWrap(`<span style="font-size: ${size}">`, "</span>");
      setShowFontSizeMenu(false);
    },
    [applyWrap]
  );

  const applyLineSpacing = useCallback((spacing: number) => {
    const editor = editorRef.current;
    if (!editor) return;
    const selection = editor.getSelection();
    const model = editor.getModel();
    const text = model?.getValueInRange(selection) ?? "";
    const wrapped = `<div style="line-height: ${spacing}">\n\n${text}\n\n</div>`;
    editor.executeEdits("", [
      {
        range: selection,
        text: wrapped,
      },
    ]);
    editor.focus();
    setShowLineSpacingMenu(false);
  }, []);

  const zoomIn = useCallback(() => {
    setCurrentZoom((prev) => Math.min(prev + 10, 200));
  }, []);

  const zoomOut = useCallback(() => {
    setCurrentZoom((prev) => Math.max(prev - 10, 50));
  }, []);

  const resetZoom = useCallback(() => {
    setCurrentZoom(100);
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
        range: new monaco.Range(
          lineNumber,
          1,
          lineNumber,
          lineContent.length + 1
        ),
        text: newText,
      },
    ]);
    editor.focus();
    setShowHeadingMenu(false);
  }, []);

  const applyColor = useCallback(
    (color: string) => {
      applyWrap(`<span style="color: ${color}">`, "</span>");
      setActiveTextColor(color);
      if (typeof window !== "undefined") {
        localStorage.setItem("aksha_active_text_color", color);
      }
      setShowColorMenu(false);
      setRecentTextColors((prev) => {
        const next = [color, ...prev.filter((c) => c !== color)].slice(0, 6);
        if (typeof window !== "undefined")
          localStorage.setItem(
            "aksha_recent_text_colors",
            JSON.stringify(next)
          );
        return next;
      });
    },
    [applyWrap]
  );

  const applyHighlight = useCallback(
    (color: string) => {
      applyWrap(`<mark style="background-color: ${color}">`, "</mark>");
      setActiveHighlightColor(color);
      if (typeof window !== "undefined") {
        localStorage.setItem("aksha_active_highlight_color", color);
      }
      setShowHighlightMenu(false);
      setRecentHighlightColors((prev) => {
        const next = [color, ...prev.filter((c) => c !== color)].slice(0, 6);
        if (typeof window !== "undefined")
          localStorage.setItem("aksha_recent_highlights", JSON.stringify(next));
        return next;
      });
    },
    [applyWrap]
  );

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
        id: "md-strikethrough",
        label: "Strikethrough",
        keybindings: [
          monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyX,
        ],
        run: () => applyWrap("~~", "~~"),
      });

      editor.addAction({
        id: "md-duplicate-line",
        label: "Duplicate Line",
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD],
        run: () => duplicateLine(),
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
        keybindings: [
          monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyK,
        ],
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
        keybindings: [
          monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyI,
        ],
        run: () => applyWrap("![alt text](", ")"),
      });

      editor.addAction({
        id: "md-blockquote",
        label: "Blockquote",
        keybindings: [
          monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyQ,
        ],
        run: () => {
          const selection = editor.getSelection();
          const text = editor.getModel().getValueInRange(selection);
          const lines = text.split("\n");
          const replacement = lines
            .map((line: string) => `> ${line}`)
            .join("\n");
          editor.executeEdits("", [{ range: selection, text: replacement }]);
        },
      });

      editor.addAction({
        id: "md-table",
        label: "Insert table",
        keybindings: [
          monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyT,
        ],
        run: () =>
          insertText(
            "\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n"
          ),
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

      // Sync scroll ratio
      editor.onDidScrollChange(() => {
        const height = editor.getLayoutInfo().height;
        const max = editor.getScrollHeight() - height;
        const top = editor.getScrollTop();
        const ratio = max > 0 ? Math.min(Math.max(top / max, 0), 1) : 0;
        typeof onScrollChange === "function" && onScrollChange(ratio);
      });

      // Apply active color/highlight on mouse up to avoid jitter
      editor.onMouseUp(() => {
        const sel = editor.getSelection();
        const isEmpty =
          sel.startLineNumber === sel.endLineNumber &&
          sel.startColumn === sel.endColumn;
        if (isEmpty) return;
        const apply = (wrapperPrefix: string, wrapperSuffix: string) => {
          const model = editor.getModel();
          const text = model?.getValueInRange(sel) ?? "";
          editor.executeEdits("", [
            { range: sel, text: `${wrapperPrefix}${text}${wrapperSuffix}` },
          ]);
        };
        if (activeTextColor) {
          apply(`<span style="color: ${activeTextColor}">`, "</span>");
        }
        if (activeHighlightColor) {
          apply(
            `<mark style="background-color: ${activeHighlightColor}">`,
            "</mark>"
          );
        }
      });
    },
    [
      applyWrap,
      insertText,
      onSave,
      onScrollChange,
      activeTextColor,
      activeHighlightColor,
      duplicateLine,
    ]
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
    padding: "5px",
    borderRadius: "8px",
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
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
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
    <div
      className={`markdown-editor ${className}`}
      style={{ height, display: "flex", flexDirection: "column" }}
    >
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
            overflow: "visible",
            zIndex: 1,
          }}
        >
          {/* Undo/Redo */}
          {toolbarGroups.includes("undo-redo") && (
            <>
              <button
                type="button"
                onClick={() =>
                  editorRef.current?.trigger("keyboard", "undo", null)
                }
                title="Undo (Ctrl+Z)"
                style={buttonStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = isDark
                    ? "#374151"
                    : "#e5e7eb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <Undo2 size={18} />
              </button>
              <button
                type="button"
                onClick={() =>
                  editorRef.current?.trigger("keyboard", "redo", null)
                }
                title="Redo (Ctrl+Y)"
                style={buttonStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = isDark
                    ? "#374151"
                    : "#e5e7eb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
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
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = isDark
                  ? "#374151"
                  : "#e5e7eb")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = showHeadingMenu
                  ? isDark
                    ? "#374151"
                    : "#e5e7eb"
                  : "transparent")
              }
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
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = isDark
                        ? "#374151"
                        : "#f3f4f6")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
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
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = isDark
                    ? "#374151"
                    : "#e5e7eb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <Bold size={18} />
              </button>
              <button
                type="button"
                onClick={() => applyWrap("*", "*")}
                title="Italic (Ctrl+I)"
                style={buttonStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = isDark
                    ? "#374151"
                    : "#e5e7eb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <Italic size={18} />
              </button>
              <button
                type="button"
                onClick={() => applyWrap("<u>", "</u>")}
                title="Underline (Ctrl+U)"
                style={buttonStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = isDark
                    ? "#374151"
                    : "#e5e7eb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <Underline size={18} />
              </button>
              <button
                type="button"
                onClick={() => applyWrap("~~", "~~")}
                title="Strikethrough (Ctrl+Shift+X)"
                style={buttonStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = isDark
                    ? "#374151"
                    : "#e5e7eb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <Strikethrough size={18} />
              </button>
              <button
                type="button"
                onClick={() => applyWrap("`", "`")}
                title="Inline Code (Ctrl+`)"
                style={buttonStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = isDark
                    ? "#374151"
                    : "#e5e7eb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <Code size={18} />
              </button>
              <button
                type="button"
                onClick={() => applyWrap("```\n", "\n```")}
                title="Code Block (Ctrl+Shift+K)"
                style={buttonStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = isDark
                    ? "#374151"
                    : "#e5e7eb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
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
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = isDark
                    ? "#374151"
                    : "#e5e7eb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <LinkIcon size={18} />
              </button>
              <button
                type="button"
                onClick={() => applyWrap("![alt text](", ")")}
                title="Insert Image (Ctrl+Shift+I)"
                style={buttonStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = isDark
                    ? "#374151"
                    : "#e5e7eb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <ImageIcon size={18} />
              </button>
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setShowTableMenu(!showTableMenu)}
                  title="Insert Table"
                  style={{ ...buttonStyle, gap: "4px" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = isDark
                      ? "#374151"
                      : "#e5e7eb")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = showTableMenu
                      ? isDark
                        ? "#374151"
                        : "#e5e7eb"
                      : "transparent")
                  }
                >
                  <Table size={18} />
                  <ChevronDown size={14} />
                </button>
                {showTableMenu && (
                  <div
                    style={{
                      ...dropdownStyle,
                      padding: "12px",
                      minWidth: "200px",
                    }}
                  >
                    <div
                      style={{
                        marginBottom: "8px",
                        fontSize: 12,
                        opacity: 0.8,
                      }}
                    >
                      Table Size
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(5, 1fr)",
                        gap: "4px",
                      }}
                    >
                      {[2, 3, 4, 5, 6].map((rows) =>
                        [2, 3, 4, 5, 6].map((cols) => (
                          <button
                            key={`${rows}x${cols}`}
                            onClick={() => insertTable(rows, cols)}
                            style={{
                              padding: "4px",
                              fontSize: "11px",
                              border: `1px solid ${
                                isDark ? "#374151" : "#e5e7eb"
                              }`,
                              borderRadius: "4px",
                              background: isDark ? "#374151" : "#ffffff",
                              color: isDark ? "#d1d5db" : "#374151",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = isDark
                                ? "#4b5563"
                                : "#f3f4f6")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = isDark
                                ? "#374151"
                                : "#ffffff")
                            }
                            title={`${rows}x${cols} table`}
                          >
                            {rows}x{cols}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  const editor = editorRef.current;
                  if (!editor) return;
                  const selection = editor.getSelection();
                  const text = editor.getModel().getValueInRange(selection);
                  const lines = text.split("\n");
                  const replacement = lines
                    .map((line: string) => `> ${line}`)
                    .join("\n");
                  editor.executeEdits("", [
                    { range: selection, text: replacement },
                  ]);
                }}
                title="Blockquote (Ctrl+Shift+Q)"
                style={buttonStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = isDark
                    ? "#374151"
                    : "#e5e7eb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
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
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = isDark
                  ? "#374151"
                  : "#e5e7eb")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = showColorMenu
                  ? isDark
                    ? "#374151"
                    : "#e5e7eb"
                  : "transparent")
              }
            >
              <Palette size={16} />
              <ChevronDown size={14} />
            </button>
            {showColorMenu && (
              <div style={{ ...dropdownStyle, padding: "12px" }}>
                <div
                  style={{ marginBottom: "8px", fontSize: 12, opacity: 0.8 }}
                >
                  Recent
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(6, 1fr)",
                    gap: "8px",
                    marginBottom: 8,
                  }}
                >
                  {recentTextColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => applyColor(color)}
                      title={color}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        border: `2px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                        background: color,
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "8px",
                  }}
                >
                  {[
                    "red",
                    "blue",
                    "green",
                    "orange",
                    "purple",
                    "pink",
                    "yellow",
                    "cyan",
                  ].map((color) => (
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 10,
                  }}
                >
                  <input
                    type="color"
                    onChange={(e) => {
                      const v = e.target.value;
                      setActiveTextColor(v);
                      if (typeof window !== "undefined")
                        localStorage.setItem("aksha_active_text_color", v);
                    }}
                    value={activeTextColor ?? "#000000"}
                    style={{
                      width: 28,
                      height: 28,
                      border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                      borderRadius: 6,
                    }}
                  />
                  <label style={{ fontSize: 12 }}>
                    <input
                      type="checkbox"
                      checked={!!activeTextColor}
                      onChange={(e) => {
                        const v = e.target.checked
                          ? activeTextColor || "#000000"
                          : null;
                        setActiveTextColor(v);
                        if (typeof window !== "undefined") {
                          v
                            ? localStorage.setItem("aksha_active_text_color", v)
                            : localStorage.removeItem(
                                "aksha_active_text_color"
                              );
                        }
                      }}
                    />
                    <span style={{ marginLeft: 6 }}>Active selection mode</span>
                  </label>
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
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = isDark
                  ? "#374151"
                  : "#e5e7eb")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = showHighlightMenu
                  ? isDark
                    ? "#374151"
                    : "#e5e7eb"
                  : "transparent")
              }
            >
              <Highlighter size={16} />
              <ChevronDown size={14} />
            </button>
            {showHighlightMenu && (
              <div style={{ ...dropdownStyle, padding: "12px" }}>
                <div
                  style={{ marginBottom: "8px", fontSize: 12, opacity: 0.8 }}
                >
                  Recent
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(6, 1fr)",
                    gap: "8px",
                    marginBottom: 8,
                  }}
                >
                  {recentHighlightColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => applyHighlight(color)}
                      title={color}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        border: `2px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                        background: color,
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "8px",
                  }}
                >
                  {["yellow", "lightgreen", "lightblue", "pink", "plum"].map(
                    (color) => (
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
                    )
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 10,
                  }}
                >
                  <input
                    type="color"
                    onChange={(e) => {
                      const v = e.target.value;
                      setActiveHighlightColor(v);
                      if (typeof window !== "undefined")
                        localStorage.setItem("aksha_active_highlight_color", v);
                    }}
                    value={activeHighlightColor ?? "#ffff00"}
                    style={{
                      width: 28,
                      height: 28,
                      border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                      borderRadius: 6,
                    }}
                  />
                  <label style={{ fontSize: 12 }}>
                    <input
                      type="checkbox"
                      checked={!!activeHighlightColor}
                      onChange={(e) => {
                        const v = e.target.checked
                          ? activeHighlightColor || "#ffff00"
                          : null;
                        setActiveHighlightColor(v);
                        if (typeof window !== "undefined") {
                          v
                            ? localStorage.setItem(
                                "aksha_active_highlight_color",
                                v
                              )
                            : localStorage.removeItem(
                                "aksha_active_highlight_color"
                              );
                        }
                      }}
                    />
                    <span style={{ marginLeft: 6 }}>Active selection mode</span>
                  </label>
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
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = isDark
                  ? "#374151"
                  : "#e5e7eb")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = showAlignMenu
                  ? isDark
                    ? "#374151"
                    : "#e5e7eb"
                  : "transparent")
              }
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
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = isDark
                        ? "#374151"
                        : "#f3f4f6")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
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
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = isDark
                    ? "#374151"
                    : "#e5e7eb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <List size={18} />
              </button>
              <button
                type="button"
                onClick={() => toggleList(true)}
                title="Numbered List"
                style={buttonStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = isDark
                    ? "#374151"
                    : "#e5e7eb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <ListOrdered size={18} />
              </button>
              <button
                type="button"
                onClick={() => toggleTaskList()}
                title="Task List (Checklist)"
                style={buttonStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = isDark
                    ? "#374151"
                    : "#e5e7eb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <CheckSquare size={18} />
              </button>
              <button
                type="button"
                onClick={() => indentLine()}
                title="Indent (Tab)"
                style={buttonStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = isDark
                    ? "#374151"
                    : "#e5e7eb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <Indent size={18} />
              </button>
              <button
                type="button"
                onClick={() => unindentLine()}
                title="Unindent (Shift+Tab)"
                style={buttonStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = isDark
                    ? "#374151"
                    : "#e5e7eb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <Outdent size={18} />
              </button>
              <div style={separatorStyle} aria-hidden />
            </>
          )}

          {/* Emoji */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setShowEmojiMenu(!showEmojiMenu)}
              title="Insert Emoji"
              style={buttonStyle}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = isDark
                  ? "#374151"
                  : "#e5e7eb")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = showEmojiMenu
                  ? isDark
                    ? "#374151"
                    : "#e5e7eb"
                  : "transparent")
              }
            >
              <Smile size={18} />
            </button>
            {showEmojiMenu && (
              <div
                data-dropdown-menu="emoji"
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "4px",
                  background: isDark ? "#1f2937" : "#ffffff",
                  border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                  borderRadius: "6px",
                  boxShadow:
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                  zIndex: 1000,
                  padding: "12px",
                  width: "300px",
                  maxHeight: "400px",
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              >
                {/* Close button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEmojiMenu(false);
                  }}
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    padding: "4px",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: isDark ? "#9ca3af" : "#6b7280",
                    zIndex: 1,
                  }}
                  title="Close emoji picker"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDark
                      ? "#374151"
                      : "#f3f4f6";
                    e.currentTarget.style.color = isDark
                      ? "#f3f4f6"
                      : "#111827";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = isDark
                      ? "#9ca3af"
                      : "#6b7280";
                  }}
                >
                  <X size={16} />
                </button>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(8, 1fr)",
                    gap: "4px",
                  }}
                >
                  {[
                    "😀",
                    "😃",
                    "😄",
                    "😁",
                    "😆",
                    "😅",
                    "😂",
                    "🤣",
                    "😊",
                    "😇",
                    "🙂",
                    "🙃",
                    "😉",
                    "😌",
                    "❤️",
                    "💖",
                    "😍",
                    "🥰",
                    "😘",
                    "😗",
                    "😙",
                    "😚",
                    "😋",
                    "😛",
                    "😝",
                    "😜",
                    "🤪",
                    "🤨",
                    "🧐",
                    "🤓",
                    "😎",
                    "🤩",
                    "🥳",
                    "😏",
                    "😒",
                    "😞",
                    "😔",
                    "😟",
                    "😕",
                    "🙁",
                    "☹️",
                    "😣",
                    "😖",
                    "😫",
                    "😩",
                    "🥺",
                    "😢",
                    "😭",
                    "😤",
                    "😠",
                    "😡",
                    "🤬",
                    "🤯",
                    "😳",
                    "🥵",
                    "🥶",
                    "😱",
                    "😨",
                    "😰",
                    "😥",
                    "😓",
                    "🤗",
                    "🤔",
                    "🤭",
                    "🤫",
                    "🤥",
                    "😶",
                    "😐",
                    "😑",
                    "😬",
                    "🙄",
                    "😯",
                    "😦",
                    "😧",
                    "😮",
                    "😲",
                    "🥱",
                    "😴",
                    "🤤",
                    "😪",
                    "😵",
                    "🤐",
                    "🥴",
                    "🤢",
                    "🤮",
                    "🤧",
                    "😷",
                    "🤒",
                    "🤕",
                    "🤑",
                    "🤠",
                    "😈",
                    "👿",
                    "👹",
                    "👺",
                    "🤡",
                    "💩",
                    "👻",
                    "💀",
                    "☠️",
                    "👽",
                    "👾",
                    "🤖",
                    "🎃",
                    "😺",
                    "😸",
                    "😹",
                    "😻",
                    "😼",
                    "😽",
                    "🙀",
                    "😿",
                    "😾",
                  ].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={(e) => {
                        e.stopPropagation();
                        insertEmoji(emoji);
                      }}
                      style={{
                        padding: "4px",
                        fontSize: "18px",
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        borderRadius: "4px",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = isDark
                          ? "#374151"
                          : "#f3f4f6")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                      title={emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Font Size */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setShowFontSizeMenu(!showFontSizeMenu)}
              title="Font Size"
              style={{ ...buttonStyle, gap: "4px" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = isDark
                  ? "#374151"
                  : "#e5e7eb")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = showFontSizeMenu
                  ? isDark
                    ? "#374151"
                    : "#e5e7eb"
                  : "transparent")
              }
            >
              <ALargeSmall size={18} />
              <ChevronDown size={14} />
            </button>
            {showFontSizeMenu && (
              <div style={dropdownStyle}>
                {[
                  "8px",
                  "10px",
                  "12px",
                  "14px",
                  "16px",
                  "18px",
                  "20px",
                  "24px",
                  "28px",
                ].map((size) => (
                  <div
                    key={size}
                    onClick={() => applyFontSize(size)}
                    style={dropdownItemStyle}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = isDark
                        ? "#374151"
                        : "#f3f4f6")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <span style={{ fontSize: size }}>Aa</span>
                    <span style={{ marginLeft: "8px" }}>{size}</span>
                  </div>
                ))}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    marginTop: 10,
                  }}
                >
                  <input
                    type="number"
                    value={customFontSize}
                    onChange={(e) => setCustomFontSize(e.target.value)}
                    placeholder="px"
                    style={{
                      width: 80,
                      padding: "6px 8px",
                      borderRadius: 6,
                      border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                      background: isDark ? "#111827" : "#fff",
                      color: isDark ? "#f9fafb" : "#111827",
                      fontSize: 12,
                    }}
                  />
                  <button
                    type="button"
                    style={{
                      ...buttonStyle,
                      minWidth: 60,
                      padding: "6px 10px",
                    }}
                    onClick={() => {
                      const raw = customFontSize.trim();
                      if (!raw) return;
                      const normalized = /^\d+$/.test(raw) ? `${raw}px` : raw;
                      applyFontSize(normalized);
                      setCustomFontSize("");
                    }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Line Spacing */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setShowLineSpacingMenu(!showLineSpacingMenu)}
              title="Line Spacing"
              style={{ ...buttonStyle, gap: "4px" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = isDark
                  ? "#374151"
                  : "#e5e7eb")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = showLineSpacingMenu
                  ? isDark
                    ? "#374151"
                    : "#e5e7eb"
                  : "transparent")
              }
            >
              <ArrowUpDown size={18} />
              <ChevronDown size={14} />
            </button>
            {showLineSpacingMenu && (
              <div style={dropdownStyle}>
                {[1, 1.15, 1.5, 2, 2.5].map((spacing) => (
                  <div
                    key={spacing}
                    onClick={() => applyLineSpacing(spacing)}
                    style={dropdownItemStyle}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = isDark
                        ? "#374151"
                        : "#f3f4f6")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <span>{spacing}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Duplicate & Zoom */}
          <button
            type="button"
            onClick={() => duplicateLine()}
            title="Duplicate Line (Ctrl+D)"
            style={buttonStyle}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = isDark
                ? "#374151"
                : "#e5e7eb")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <Copy size={18} />
          </button>
          <div style={separatorStyle} aria-hidden />
          <button
            type="button"
            onClick={() => zoomOut()}
            title="Zoom Out"
            style={buttonStyle}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = isDark
                ? "#374151"
                : "#e5e7eb")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <ZoomOut size={18} />
          </button>
          <button
            type="button"
            onClick={() => resetZoom()}
            title="Reset Zoom"
            style={{ ...buttonStyle, minWidth: "50px", fontSize: "12px" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = isDark
                ? "#374151"
                : "#e5e7eb")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            {currentZoom}%
          </button>
          <button
            type="button"
            onClick={() => zoomIn()}
            title="Zoom In"
            style={buttonStyle}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = isDark
                ? "#374151"
                : "#e5e7eb")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <ZoomIn size={18} />
          </button>
          <div style={separatorStyle} aria-hidden />

          {/* Search & Help */}
          <button
            type="button"
            onClick={() =>
              editorRef.current?.trigger("keyboard", "actions.find", null)
            }
            title="Find (Ctrl+F)"
            style={buttonStyle}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = isDark
                ? "#374151"
                : "#e5e7eb")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <Search size={18} />
          </button>
          <button
            type="button"
            onClick={() =>
              window.open("https://www.markdownguide.org/", "_blank")
            }
            title="Markdown Guide"
            style={buttonStyle}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = isDark
                ? "#374151"
                : "#e5e7eb")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
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
          <span style={{ fontWeight: "semi-bold" }}>Aksha MD Editor</span> -{" "}
          <span style={{ color: "#8E8CFD", fontWeight: "semi-bold" }}>
            Akash Halder Technologia
          </span>
        </a>
      </div>
    </div>
  );
});
