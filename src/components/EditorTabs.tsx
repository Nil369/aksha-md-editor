import { memo } from "react";
import { Edit3, Eye, Columns, Maximize, Minimize } from "lucide-react";
import type { ViewMode } from "../types";

type EditorTabsProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  isFullscreen?: boolean;
  onFullscreenToggle?: () => void;
  className?: string;
  theme?: "light" | "dark";
};

const labels: Record<ViewMode, { label: string; icon: typeof Edit3 }> = {
  edit: { label: "Edit", icon: Edit3 },
  preview: { label: "Preview", icon: Eye },
  split: { label: "Split", icon: Columns },
};

export const EditorTabs = memo(function EditorTabs({
  viewMode,
  onViewModeChange,
  isFullscreen = false,
  onFullscreenToggle,
  className = "",
  theme = "light",
}: EditorTabsProps) {
  const isDark = theme === "dark";

  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        borderBottom: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
        background: isDark ? "#1f2937" : "#f9fafb",
        color: isDark ? "#d1d5db" : "#374151",
        flexWrap: "wrap",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {(Object.keys(labels) as ViewMode[]).map((mode) => {
        const { label, icon: Icon } = labels[mode];
        const isActive = viewMode === mode;
        
        // Hide Split mode on mobile screens (< 768px)
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        if (mode === 'split' && isMobile) {
          return null;
        }
        
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onViewModeChange(mode)}
            className={mode === 'split' ? 'hide-on-mobile' : ''}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: 600,
              border: "none",
              borderBottom: isActive
                ? `2px solid ${isDark ? "#8b5cf6" : "#7c3aed"}`
                : "2px solid transparent",
              background: isActive
                ? isDark
                  ? "rgba(139, 92, 246, 0.1)"
                  : "rgba(124, 58, 237, 0.05)"
                : "transparent",
              color: isActive
                ? isDark
                  ? "#a78bfa"
                  : "#7c3aed"
                : isDark
                ? "#9ca3af"
                : "#6b7280",
              cursor: "pointer",
              transition: "all 0.2s ease",
              minHeight: "44px",
              minWidth: "44px",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = isDark
                  ? "rgba(75, 85, 99, 0.3)"
                  : "rgba(229, 231, 235, 0.5)";
                e.currentTarget.style.color = isDark ? "#d1d5db" : "#374151";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = isDark ? "#9ca3af" : "#6b7280";
              }
            }}
            aria-label={`Switch to ${label} mode`}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon style={{ width: "16px", height: "16px" }} />
            <span>{label}</span>
          </button>
        );
      })}

      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          paddingRight: "12px",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            color: isDark ? "#9ca3af" : "#6b7280",
          }}
        >
          {viewMode === "edit" &&
            "Editing mode - Write your markdown content here"}
          {viewMode === "preview" && "Preview mode - Read-only view"}
          {viewMode === "split" && "Split mode - Edit and preview side-by-side"}
        </span>
        {onFullscreenToggle && (
          <button
            type="button"
            onClick={onFullscreenToggle}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "6px",
              borderRadius: "4px",
              background: "transparent",
              border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
              color: isDark ? "#9ca3af" : "#6b7280",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark
                ? "rgba(75, 85, 99, 0.3)"
                : "rgba(229, 231, 235, 0.5)";
              e.currentTarget.style.color = isDark ? "#d1d5db" : "#374151";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = isDark ? "#9ca3af" : "#6b7280";
            }}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize style={{ width: "16px", height: "16px" }} />
            ) : (
              <Maximize style={{ width: "16px", height: "16px" }} />
            )}
          </button>
        )}
      </div>
    </div>
  );
});
