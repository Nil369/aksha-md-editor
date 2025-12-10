---
sidebar_position: 3
---

# API Reference

Complete API documentation for aksha-md-editor components and utilities.

## MarkdownEditor

The main component that provides a complete markdown editing experience.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `undefined` | Controlled value of the editor |
| `defaultValue` | `string` | `'# Hello, Markdown!\n\nStart typing...'` | Default value for uncontrolled mode |
| `onChange` | `(value: string) => void` | `undefined` | Callback fired when content changes |
| `defaultViewMode` | `'edit' \| 'preview' \| 'split'` | `'split'` | Initial view mode |
| `theme` | `'auto' \| 'light' \| 'dark'` | `'auto'` | Editor theme |
| `height` | `string` | `'600px'` | Editor height |
| `className` | `string` | `undefined` | Additional CSS class |
| `placeholder` | `string` | `'Start typing...'` | Placeholder text |
| `readOnly` | `boolean` | `false` | Makes editor read-only |
| `showLineNumbers` | `boolean` | `true` | Show line numbers in editor |
| `enableToolbar` | `boolean` | `true` | Show formatting toolbar |
| `toolbarGroups` | `ToolbarGroup[]` | All groups | Toolbar items to display |
| `wordWrap` | `'on' \| 'off' \| 'wordWrapColumn'` | `'on'` | Word wrap setting |
| `fontSize` | `number` | `14` | Editor font size |
| `minimap` | `boolean` | `false` | Show minimap |
| `performanceMode` | `boolean` | `false` | Enable performance optimizations |
| `onSave` | `(value: string) => void` | `undefined` | Called on Ctrl+S / Cmd+S |

### Example

```tsx
import { useState } from 'react';
import { MarkdownEditor } from 'aksha-md-editor';
import 'aksha-md-editor/styles.css'; // Required: Import CSS for styling

function App() {
  const [markdown, setMarkdown] = useState('# Hello World');

  return (
    <MarkdownEditor
      value={markdown}
      onChange={setMarkdown}
      defaultViewMode="split"
      theme="auto"
      height="500px"
      enableToolbar={true}
    />
  );
}
```

## Editor

The Monaco-based code editor component with markdown toolbar.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `''` | Editor content |
| `onChange` | `(value: string) => void` | Required | Content change callback |
| `theme` | `'auto' \| 'light' \| 'dark'` | `'auto'` | Editor theme |
| `height` | `string` | `'100%'` | Editor height |
| `showLineNumbers` | `boolean` | `true` | Show line numbers |
| `wordWrap` | `'on' \| 'off' \| 'wordWrapColumn'` | `'on'` | Word wrap setting |
| `fontSize` | `number` | `14` | Font size |
| `minimap` | `boolean` | `false` | Show minimap |
| `readOnly` | `boolean` | `false` | Read-only mode |
| `placeholder` | `string` | `undefined` | Placeholder text |
| `enableToolbar` | `boolean` | `true` | Show toolbar |
| `performanceMode` | `boolean` | `false` | Performance mode |
| `onSave` | `(value: string) => void` | `undefined` | Save callback |

### Toolbar Actions

- **Bold** (Ctrl+B): Wraps selection with `**text**`
- **Italic** (Ctrl+I): Wraps selection with `*text*`
- **Code** (Ctrl+`): Wraps selection with `` `code` ``
- **Link** (Ctrl+K): Inserts `[text](url)`
- **Image**: Inserts `![alt](url)`
- **Ordered List**: Inserts numbered list
- **Unordered List**: Inserts bullet list
- **Undo** (Ctrl+Z): Undo last change
- **Redo** (Ctrl+Y): Redo last undone change

## Preview

Markdown preview component with syntax highlighting and math support.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | Required | Markdown content to render |
| `theme` | `'auto' \| 'light' \| 'dark'` | `'auto'` | Preview theme |
| `className` | `string` | `undefined` | Additional CSS class |

### Supported Features

- **GitHub Flavored Markdown (GFM)**: Tables, task lists, strikethrough, autolinks
- **Math Equations**: LaTeX syntax with KaTeX (inline `$...$` and block `$$...$$`)
- **Syntax Highlighting**: Code blocks with language detection
- **Autolinks**: Automatically converts URLs to links

### Example

```tsx
import { Preview } from 'aksha-md-editor';
import 'aksha-md-editor/styles.css'; // Required: Import CSS for styling

function MarkdownPreview() {
  const markdown = `
# Math Example

Inline math: $E = mc^2$

Block math:
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$
  `;

  return <Preview content={markdown} theme="light" />;
}
```

## EditorTabs

View mode switcher component.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `viewMode` | `'edit' \| 'preview' \| 'split'` | Required | Current view mode |
| `onViewModeChange` | `(mode: ViewMode) => void` | Required | View mode change callback |
| `isFullscreen` | `boolean` | `false` | Fullscreen state |
| `onFullscreenToggle` | `() => void` | `undefined` | Fullscreen toggle callback |

## Hooks

### useTheme

Custom hook for theme management with system preference detection.

```tsx
import { useTheme } from 'aksha-md-editor';
import 'aksha-md-editor/styles.css'; // Required: Import CSS for styling

function MyComponent() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme('dark')}>
      Current theme: {resolvedTheme}
    </button>
  );
}
```

**Returns:**
- `theme`: Current theme setting (`'auto' | 'light' | 'dark'`)
- `resolvedTheme`: Actual theme in use (`'light' | 'dark'`)
- `setTheme`: Function to change theme

### useDebounce

Custom hook for debouncing values.

```tsx
import { useState, useEffect } from 'react';
import { useDebounce } from 'aksha-md-editor';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    // API call with debouncedSearch
  }, [debouncedSearch]);

  return <input onChange={(e) => setSearchTerm(e.target.value)} />;
}
```

## Types

### ViewMode

```typescript
type ViewMode = 'edit' | 'preview' | 'split';
```

### ThemeMode

```typescript
type ThemeMode = 'auto' | 'light' | 'dark';
```

### WordWrap

```typescript
type WordWrap = 'on' | 'off' | 'wordWrapColumn';
```

### ToolbarGroup

```typescript
type ToolbarGroup = 'undo-redo' | 'formatting' | 'lists' | 'insert';
```

## Styling

The library includes pre-built styles for markdown rendering:

```tsx
import 'aksha-md-editor/styles.css';
```

### Custom Styling

You can override styles using CSS custom properties:

```css
.markdown-editor {
  --editor-bg: #ffffff;
  --editor-text: #000000;
  --editor-border: #e5e7eb;
  --editor-toolbar-bg: #f9fafb;
}

.markdown-editor.dark {
  --editor-bg: #1f2937;
  --editor-text: #f9fafb;
  --editor-border: #374151;
  --editor-toolbar-bg: #111827;
}
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + B` | Bold |
| `Ctrl/Cmd + I` | Italic |
| `Ctrl/Cmd + K` | Insert Link |
| `Ctrl/Cmd` + ` | Inline Code |
| `Ctrl/Cmd + S` | Save (triggers onSave) |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Y` | Redo |
| `Ctrl/Cmd + /` | Toggle Comment |

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions

## Performance Tips

1. **Use performanceMode**: For documents > 10,000 lines
2. **Disable minimap**: Reduces memory usage
3. **Debounce onChange**: Already implemented (300ms)
4. **Use controlled mode sparingly**: For large documents, consider uncontrolled mode
