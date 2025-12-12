---
sidebar_position: 1
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# Introduction

Welcome to **Aksha MD Editor** - a highly optimized, production-ready Markdown Editor for React applications.

<div align="center">
  <img src="https://ik.imagekit.io/AkashPortfolioAssets/product_demo_videos/aksha_docs/aksha-md-editor-banner.png?updatedAt=1765364484876" alt="Aksha MD Editor Banner" width="100%" style={{ marginTop: '20px', marginBottom: '20px', borderRadius: '15px' }} />
</div>

## What is Aksha MD Editor?

Aksha MD Editor is a drop-in replacement for traditional text processors, built specifically for React applications. It leverages the power of Monaco Editor (the same editor that powers VS Code) to provide a professional editing experience with real-time markdown preview.

## Preview

<div >
  <div>
    <img 
      src="https://ik.imagekit.io/AkashPortfolioAssets/product_demo_videos/aksha_docs/preview-1.png" 
      alt="Light Theme Preview" 
      style={{ width: '100%', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
    />
    <p style={{ textAlign: 'center', marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>Light Theme</p>
  </div>
  <div>
    <img 
      src="https://ik.imagekit.io/AkashPortfolioAssets/product_demo_videos/aksha_docs/light-mode-preview.png" 
      alt="Features Demo" 
      style={{ width: '100%', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
    />
    <p style={{ textAlign: 'center', marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>Features Demo</p>
  </div>
  <div>
    <img 
      src="https://ik.imagekit.io/AkashPortfolioAssets/product_demo_videos/aksha_docs/dark-mode-preview.png" 
      alt="Dark Mode Preview" 
      style={{ width: '100%', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
    />
    <p style={{ textAlign: 'center', marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>Dark Mode</p>
  </div>
</div>

## Key Features

### 🎯 Professional Editing
- **Monaco Editor Integration**: The same editor that powers VS Code
- **Syntax Highlighting**: Full markdown syntax highlighting
- **Rich Toolbar**: Comprehensive formatting options
- **Keyboard Shortcuts**: Familiar shortcuts for power users

### 📝 Comprehensive Markdown Support
- **GitHub Flavored Markdown (GFM)**: Full GFM support
- **Math Equations**: LaTeX math rendering with KaTeX
- **Code Highlighting**: Syntax highlighting for 100+ languages
- **Tables & Task Lists**: Complete markdown feature set
 - **Mermaid Diagrams**: Flowcharts and sequence diagrams via fenced blocks
 - **Charts**: Apache ECharts via fenced blocks
 - **Emoji**: Noto Color Emoji font support

### 🎨 Flexible & Customizable
- **Multiple View Modes**: Edit, Preview, or Split view
- **Theme Support**: Light, Dark, and Auto modes
- **Customizable**: Extensive props for customization
- **Responsive**: Works perfectly on all screen sizes
 - **Auto Scroll**: Preview follows editor scroll in split view

### ⚡ Performance Optimized
- **Debounced Updates**: Smooth performance even with large documents
- **Async Processing**: Non-blocking markdown rendering
- **Efficient Re-rendering**: Optimized React component structure

## Why Choose Aksha MD Editor?

✅ **Production Ready**: Thoroughly tested and optimized for production use

✅ **Type Safe**: Full TypeScript support with comprehensive type definitions

✅ **Well Documented**: Extensive documentation with examples and API reference

✅ **Easy to Use**: Simple API with sensible defaults

✅ **Actively Maintained**: Regular updates and bug fixes

✅ **Open Source**: MIT licensed and open for contributions

## Quick Example

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
    />
  );
}
```

## Browser Support

Aksha MD Editor works in all modern browsers:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Next Steps

Ready to get started? Check out the [Getting Started](./getting-started) guide!
