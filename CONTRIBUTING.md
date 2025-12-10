# Contributing to Aksha MD Editor

Thank you for your interest in contributing to Aksha MD Editor! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps to reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed and what behavior you expected
* Include screenshots if applicable
* Include your environment details (OS, Browser, React version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* Use a clear and descriptive title
* Provide a detailed description of the suggested enhancement
* Provide specific examples to demonstrate the feature
* Explain why this enhancement would be useful

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Development Setup

### Prerequisites

- Node.js >= 18
- npm >= 9

### Setup Steps

1. **Clone your fork:**
   ```bash
   git clone https://github.com/Nil369/aksha-md-editor.git
   cd aksha-md-editor
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install docs dependencies:**
   ```bash
   cd docs-site
   npm install
   cd ..
   ```

### Development Workflow

1. **Run tests:**
   ```bash
   npm test
   ```

2. **Run tests in watch mode:**
   ```bash
   npm run test:watch
   ```

3. **Build the library:**
   ```bash
   npm run build
   ```

4. **Lint code:**
   ```bash
   npm run lint
   ```

5. **Format code:**
   ```bash
   npm run format
   ```

6. **Type check:**
   ```bash
   npm run type-check
   ```

7. **Run documentation site locally:**
   ```bash
   npm run docs:dev
   ```

### Project Structure

```
aksha-md-editor/
├── src/                    # Source code
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   ├── types/             # TypeScript types
│   └── index.ts           # Main entry point
├── tests/                 # Test files
├── docs-site/            # Docusaurus documentation
├── .github/              # GitHub Actions workflows
└── dist/                 # Build output (generated)
```

## Coding Guidelines

### TypeScript

- Use TypeScript for all new code
- Provide proper type annotations
- Avoid `any` types when possible
- Export types that might be useful to consumers

### React

- Use functional components with hooks
- Use `memo` for performance-critical components
- Prefer controlled components
- Keep components focused and single-purpose

### Styling

- Use CSS modules or styled-components
- Follow the existing styling patterns
- Ensure responsive design
- Support both light and dark themes

### Testing

- Write tests for new features
- Maintain test coverage above 70%
- Use React Testing Library
- Test user interactions, not implementation details

### Documentation

- Add JSDoc comments to public APIs
- Update README.md for significant changes
- Add examples for new features
- Keep documentation in sync with code

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): subject

body

footer
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(editor): add syntax highlighting for python
fix(preview): resolve markdown rendering issue
docs(readme): update installation instructions
```

## Release Process

Releases are automated using semantic-release:

1. Merge PRs to `main` branch
2. GitHub Actions runs tests and builds
3. semantic-release analyzes commits
4. Automatically publishes to npm
5. Creates GitHub release
6. Updates CHANGELOG.md

## Questions?

Feel free to:
- Open an issue for questions
- Start a discussion on GitHub Discussions
- Contact maintainers directly

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Thank You! 🎉

Your contributions make this project better for everyone. We appreciate your time and effort!
