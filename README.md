# EPUB Reader

A browser-based EPUB reader built with React and designed to run on Cloudflare Workers.

## Features

- **EPUB Rendering** - Read EPUB files directly in your browser using epub.js
- **Library Management** - Add, remove, and organize your EPUB collection
- **Reading Progress** - Automatically saves and restores your reading position (CFI-based)
- **Dark Mode** - System, light, and dark theme support with EPUB content theming
- **PWA Support** - Install as a standalone app with offline support
- **Offline Storage** - EPUB files stored in IndexedDB for offline access
- **URL Routing** - Each book has its own URL for easy bookmarking and sharing

## Tech Stack

- **React 19** with TypeScript
- **Vite** for development and building
- **Tailwind CSS v4** for styling
- **shadcn/ui** for UI components
- **react-reader** (epub.js wrapper) for EPUB rendering
- **React Router** for client-side routing
- **React Suspense** for data fetching
- **vite-plugin-pwa** for PWA/Service Worker
- **Cloudflare Workers** for deployment

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Open http://localhost:5173 in your browser.

### Build

```bash
pnpm build
```

### Deploy to Cloudflare Workers

```bash
pnpm deploy
```

## Project Structure

```
src/
├── components/
│   ├── ui/          # shadcn/ui components
│   ├── Reader.tsx   # EPUB reader component
│   ├── Library.tsx  # Book library list
│   ├── FileUpload.tsx
│   └── ThemeToggle.tsx
├── contexts/
│   └── ThemeContext.tsx  # Theme state management
├── hooks/
│   └── useLibrary.ts     # Library state management
├── lib/
│   ├── storage.ts        # localStorage utilities
│   ├── epub-storage.ts   # IndexedDB for EPUB files
│   └── suspense.ts       # Suspense utilities
├── App.tsx
└── main.tsx
```

## License

MIT
