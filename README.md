<div align="center">
  <img src="https://ik.imagekit.io/AkashPortfolioAssets/product_demo_videos/aksha_docs/aksha-md-editor-banner.png?updatedAt=1765364484876" alt="Aksha MD Editor Banner" width="100%" style="margin-bottom:10px;" />
  
  [![TypeScript](https://img.shields.io/badge/TypeScript-6.x-blue.svg)](https://www.typescriptlang.org/)
  ![Version](https://img.shields.io/badge/version-1.x-green.svg)
  [![license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/Nil369/aksha-md-editor/blob/main/LICENSE)
  [![Website](https://img.shields.io/badge/🌐%20Visit%20my%20portfolio-akashhalder.in-blue)](https://akashhalder.in/portfolio)
  <h1>Aksha MD Editor</h1>
  <p>A highly optimized, production-ready Markdown Editor for React with live preview and VS Code style interface</p>
</div>

---

## ✨ Features

- **🎯 Monaco Editor Integration** - The same powerful editor that powers VS Code
- **📝 GitHub Flavored Markdown** - Full GFM support with tables, task lists, and more
- **🧮 Math Equations** - LaTeX syntax with KaTeX rendering (inline `$...$` and block `$$...$$`)
- **🎨 Syntax Highlighting** - Code blocks with 100+ language support
- **🌗 Theme Support** - Light, dark, and auto (system preference) themes
- **👁️ Multiple View Modes** - Edit-only, Preview-only, or Split view
- **⌨️ Keyboard Shortcuts** - Familiar shortcuts for productivity
- **🛠️ Rich Toolbar** - Comprehensive formatting options
- **📱 Responsive** - Works seamlessly on all screen sizes
- **⚡ Performance Optimized** - Debounced updates and efficient rendering
- **🎯 TypeScript** - Full type safety with comprehensive type definitions
- **📦 Tree-shakable** - Import only what you need

## 📦 Installation

```bash
npm install aksha-md-editor
```

```bash
yarn add aksha-md-editor
```

```bash
pnpm add aksha-md-editor
```

### Peer Dependencies

Make sure you have these installed:

```bash
npm install react react-dom @monaco-editor/react
```

## 🚀 Quick Start

```tsx
import { useState } from 'react';
import MarkdownEditor from 'aksha-md-editor';
import 'aksha-md-editor/styles.css';

function App() {
  const [markdown, setMarkdown] = useState('# Hello World\n\nStart editing!');

  return (
    <MarkdownEditor
      value={markdown}
      onChange={setMarkdown}
      defaultViewMode="split"
      theme="auto"
      height="600px"
    />
  );
}

export default App;
```

## 📚 Examples

### Basic Usage

```tsx
import {MarkdownEditor} from 'aksha-md-editor';
import 'aksha-md-editor/styles.css';

function BasicEditor() {
  const [content, setContent] = useState('# Start writing...');

  return (
    <MarkdownEditor
      value={content}
      onChange={setContent}
    />
  );
}
```

### With Custom Height and Theme

```tsx
function CustomizedEditor() {
  const [markdown, setMarkdown] = useState('');

  return (
    <MarkdownEditor
      value={markdown}
      onChange={setMarkdown}
      height="800px"
      theme="dark"
      defaultViewMode="edit"
    />
  );
}
```

### With Save Functionality

```tsx
function EditorWithSave() {
  const [content, setContent] = useState('');

  const handleSave = (value: string) => {
    console.log('Saving...', value);
    // Your save logic here
  };

  return (
    <MarkdownEditor
      value={content}
      onChange={setContent}
      onSave={handleSave}
    />
  );
}
```

### Math and Code Example

```tsx
function MathEditor() {
  const initialContent = `
# Math Example

Inline math: $E = mc^2$

Block math:
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

\`\`\`javascript
const greeting = 'Hello, Markdown!';
console.log(greeting);
\`\`\`
  `;

  const [content, setContent] = useState(initialContent);

  return (
    <MarkdownEditor
      value={content}
      onChange={setContent}
      defaultViewMode="split"
    />
  );
}
```

### Using Individual Components

```tsx
import { Editor, Preview, EditorTabs } from 'aksha-md-editor';
import 'aksha-md-editor/styles.css';

function CustomLayout() {
  const [markdown, setMarkdown] = useState('# Custom Layout');
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split');

  return (
    <div>
      <EditorTabs
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      
      {viewMode !== 'preview' && (
        <Editor
          value={markdown}
          onChange={setMarkdown}
          height="500px"
        />
      )}
      
      {viewMode !== 'edit' && (
        <Preview content={markdown} />
      )}
    </div>
  );
}
```

### Read-Only Preview Mode

```tsx
function ReadOnlyPreview() {
  const content = '# Documentation\n\nThis is read-only content.';

  return (
    <MarkdownEditor
      value={content}
      readOnly={true}
      defaultViewMode="preview"
      enableToolbar={false}
    />
  );
}
```

### Performance Mode for Large Documents

```tsx
function LargeDocumentEditor() {
  const [largeDoc, setLargeDoc] = useState('');

  return (
    <MarkdownEditor
      value={largeDoc}
      onChange={setLargeDoc}
      performanceMode={true}
      minimap={false}
      height="100vh"
    />
  );
}
```

## 🎯 API Reference

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
| `enableDownload` | `boolean` | `true` | Show a download `.md` button |
| `downloadFileName` | `string` | `'document.md'` | File name used when downloading |

### Example

```tsx
import {MarkdownEditor} from 'aksha-md-editor';
import 'aksha-md-editor/styles.css';

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
import {Preview}  from 'aksha-md-editor';
import 'aksha-md-editor/styles.css';

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
import {useTheme} from 'aksha-md-editor';

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
| `Ctrl/Cmd` + \` | Inline Code |
| `Ctrl/Cmd + S` | Save (triggers onSave) |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Y` | Redo |
| `Ctrl/Cmd + /` | Toggle Comment |

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions

## ⚡ Performance Tips

1. **Use performanceMode**: For documents > 10,000 lines
2. **Disable minimap**: Reduces memory usage
3. **Debounce onChange**: Already implemented (300ms)
4. **Use controlled mode sparingly**: For large documents, consider uncontrolled mode

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- Markdown parsing powered by [unified](https://unifiedjs.com/)
- Math rendering by [KaTeX](https://katex.org/)
- Syntax highlighting by [highlight.js](https://highlightjs.org/)


---

<div align="center">
  <p>Made with ❤️ by the Akash Halder</p>
  <p>
    <a href="https://github.com/Nil369/aksha-md-editor">⭐ Star us on GitHub</a>
  </p>
</div>

