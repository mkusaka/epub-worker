# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Type check and build for production
pnpm lint         # Run ESLint
pnpm deploy       # Build and deploy to Cloudflare Workers
```

## Architecture

Browser-based EPUB reader built with React 19, designed for Cloudflare Workers deployment.

### Data Flow

- **Library metadata** (titles, IDs, progress) → localStorage
- **EPUB file data** (ArrayBuffer) → IndexedDB via `src/lib/epub-storage.ts`
- **Theme preference** → localStorage, applied to DOM via ThemeContext

### Key Patterns

**Suspense for Data Fetching**: Use `createResource` from `src/lib/suspense.ts` instead of useEffect for async data loading. Wrap with `<Suspense>` and `<ErrorBoundary>`.

**Theme System**: ThemeContext provides `isDark` boolean. Reader.tsx applies theme to EPUB content via `rendition.themes.override()`. CSS uses Tailwind's `@custom-variant dark` with `.dark` class on `<html>`.

**Routing**: React Router with `/` (home) and `/book/:bookId` routes. Book IDs are SHA-256 hashes of file content.

### Component Relationships

```
App.tsx (routing, layout)
├── AppLayout (sidebar + main area)
│   ├── Library (book list from useLibrary hook)
│   └── BookReaderContent (uses Suspense + createResource)
│       └── Reader (react-reader wrapper with theme support)
└── ThemeToggle (shadcn Select with icons)
```

### Styling

Tailwind CSS v4 with shadcn/ui components. Dark mode uses selector strategy (`@custom-variant dark (&:is(.dark *))`). EPUB content theming handled separately via epub.js rendition API.
