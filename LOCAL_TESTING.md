# Local Testing Guide for Aksha MD Editor

## Method 1: Using npm link (Recommended for Development)

This is the best method for testing your library locally while developing.

### Step 1: Build the Library

```bash
# In the aksha-md-editor directory
cd "e:\07_MY PORJECTS\My Libraries\aksha-md-editor"

# Build the library
npm run build
```

This creates the `dist/` folder with all compiled files.

### Step 2: Create a Global Link

```bash
# Still in aksha-md-editor directory
npm link
```

This creates a global symlink to your package.

### Step 3: Create a Test Project

```bash
# Go to your projects folder
cd "e:\07_MY PORJECTS"

# Create a new React app
npx create-react-app test-aksha-editor
cd test-aksha-editor

# Link to your local library
npm link aksha-md-editor
```

### Step 4: Test the Library

Edit `src/App.js`:

```jsx
import { useState } from 'react';
import { MarkdownEditor } from 'aksha-md-editor';
import 'aksha-md-editor/dist/styles.css';

function App() {
  const [markdown, setMarkdown] = useState(`# Welcome to Aksha MD Editor

## Features Test

- **Bold text**
- *Italic text*
- \`Inline code\`

### Code Block

\`\`\`javascript
function hello() {
  console.log('Hello World!');
}
\`\`\`

### Math

Inline math: $E = mc^2$

Block math:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$
`);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', padding: '20px' }}>
      <h1>Testing Aksha MD Editor</h1>
      <div style={{ flex: 1, border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
        <MarkdownEditor
          value={markdown}
          onChange={setMarkdown}
          defaultViewMode="split"
          theme="auto"
        />
      </div>
    </div>
  );
}

export default App;
```

### Step 5: Start the Test App

```bash
npm start
```

Your test app should open at http://localhost:3000

### Step 6: Make Changes and Rebuild

Whenever you make changes to your library:

```bash
# In aksha-md-editor directory
npm run build

# The test app will automatically pick up changes
# (you might need to refresh the browser)
```

### Step 7: Unlink When Done

```bash
# In test project
npm unlink aksha-md-editor

# In aksha-md-editor directory
npm unlink

# Clean up global link
npm unlink -g aksha-md-editor
```

## Method 2: Using npm pack

This method creates a tarball that you can install like a real npm package.

### Step 1: Build and Pack

```bash
# In aksha-md-editor directory
npm run build
npm pack
```

This creates a file like `aksha-md-editor-1.0.0.tgz`

### Step 2: Install in Test Project

```bash
# In your test project
npm install "e:\07_MY PORJECTS\My Libraries\aksha-md-editor\aksha-md-editor-1.0.0.tgz"
```

### Step 3: Test

Use the same test code as Method 1.

### Advantages of npm pack:
- Tests the actual package that will be published
- Tests the files array in package.json
- More accurate to real npm install

### Disadvantages:
- Need to re-pack and re-install for every change
- Slower development cycle

## Method 3: Using Relative Path

Quick and dirty method for testing.

```bash
# In test project
npm install ../aksha-md-editor
```

## Testing Checklist

### Visual Tests
- [ ] Editor loads and displays correctly
- [ ] Toolbar buttons are visible and functional
- [ ] Preview renders markdown correctly
- [ ] Split view works properly
- [ ] Theme switching (light/dark/auto) works
- [ ] Responsive design on mobile sizes

### Functional Tests
- [ ] Typing in editor updates preview (with debounce)
- [ ] Keyboard shortcuts work (Ctrl+B, Ctrl+I, etc.)
- [ ] Toolbar buttons insert correct markdown
- [ ] View mode switching works
- [ ] Fullscreen mode works
- [ ] Read-only mode works

### Content Tests
- [ ] Bold, italic, strikethrough render
- [ ] Code blocks with syntax highlighting
- [ ] Math equations render (KaTeX)
- [ ] Links work
- [ ] Images display
- [ ] Tables render correctly
- [ ] Lists (ordered/unordered) display
- [ ] Blockquotes render

### Performance Tests
- [ ] Large documents (>10KB) work smoothly
- [ ] No lag when typing
- [ ] Debounced updates work correctly
- [ ] Memory doesn't leak over time

### Browser Tests

Test in multiple browsers:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if on Mac)

### React Version Tests

Test with different React versions:

```bash
# Test with React 18
npm install react@18 react-dom@18

# Test with React 19
npm install react@19 react-dom@19
```

## Common Issues

### Issue: Module not found

**Solution**: Make sure you built the library first:
```bash
npm run build
```

### Issue: Styles not loading

**Solution**: Import the CSS file:
```jsx
import 'aksha-md-editor/dist/styles.css';
```

### Issue: TypeScript errors

**Solution**: The library includes type definitions. Make sure your tsconfig.json has:
```json
{
  "compilerOptions": {
    "moduleResolution": "node"
  }
}
```

### Issue: React hooks error

**Solution**: Make sure you're not bundling React twice. Use `peerDependencies` correctly.

### Issue: npm link not working after changes

**Solution**: 
1. Rebuild the library: `npm run build`
2. Clear React cache in test app: `rm -rf node_modules/.cache`
3. Restart the dev server

## Pre-Publish Final Test

Before publishing to npm, do a complete test:

```bash
# 1. Clean everything
npm run lint
npm run type-check
npm test

# 2. Build fresh
rm -rf dist
npm run build

# 3. Pack and test
npm pack
cd ../test-aksha-editor
npm install ../aksha-md-editor/aksha-md-editor-1.0.0.tgz

# 4. Test thoroughly

# 5. If all good, publish!
cd ../aksha-md-editor
npm publish
```

## Publishing to npm

### First time setup

```bash
# Login to npm
npm login

# Verify
npm whoami
```

### Publish

```bash
# For first release
npm publish

# For updates (with semantic-release in CI/CD)
git add .
git commit -m "feat: new feature"
git push origin main
```

## After Publishing

Test the published version:

```bash
# Create new test project
npx create-react-app test-published
cd test-published

# Install from npm
npm install aksha-md-editor

# Test it works!
```

## Continuous Testing During Development

Set up a watch mode for seamless development:

```bash
# Terminal 1: Build library in watch mode
cd aksha-md-editor
npm run dev

# Terminal 2: Run test app
cd test-aksha-editor
npm start
```

Now changes to your library will automatically rebuild, and you just need to refresh the browser!
