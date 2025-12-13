import { useState } from "react";
import { MarkdownEditor } from "aksha-md-editor";
import "aksha-md-editor/styles.css";

function DownloadButton({ text }) {
  const handleDownload = () => {
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      style={{
        padding: "8px 16px",
        background: "#7c3aed",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "500",
      }}
    >
      Download .md
    </button>
  );
}

function ThemeToggleButton({ theme, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        padding: "8px 16px",
        background: theme === "light" ? "#333" : "#e5e7eb",
        color: theme === "light" ? "white" : "black",
        border: "1px solid #ccc",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "500",
        marginRight: "10px",
      }}
    >
      {theme === "light" ? "Dark Mode" : "Light Mode"}
    </button>
  );
}

function LiveAkshaEditor() {
  const value = `# Welcome to Aksha-MD-Editor 🙏

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
  const [markdown, setMarkdown] = useState(value);
  const [theme, setTheme] = useState("light");

  const handleToggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  return (
    <>
      <div
        style={{
          height: "700px",
          borderRadius: "8px",
          overflow: "hidden",
          marginBottom: "10px",
        }}
      >
        <MarkdownEditor
          value={markdown}
          onChange={setMarkdown}
          theme={theme}
          height="700px"
        />
      </div>

      <div style={{ marginTop: "20px" }}>
        <ThemeToggleButton theme={theme} onToggle={handleToggleTheme} />
        <DownloadButton text={markdown} />
      </div>
    </>
  );
}

export default LiveAkshaEditor;