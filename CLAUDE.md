# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Initial setup (install deps + generate Prisma client + run migrations)
npm run setup

# Development server (uses Turbopack)
npm run dev

# Build
npm run build

# Lint
npm run lint

# Run all tests
npm test

# Run a single test file
npx vitest run src/components/chat/__tests__/ChatInterface.test.tsx

# Run tests in watch mode
npx vitest

# Reset database
npm run db:reset

# Regenerate Prisma client after schema changes
npx prisma generate

# Run migrations
npx prisma migrate dev
```

## Environment

Create a `.env` file with:
```
ANTHROPIC_API_KEY=your-api-key-here
```

Without an API key the app runs with a `MockLanguageModel` that returns static components (counter/form/card based on prompt keywords). The mock is defined in `src/lib/provider.ts`.

## Architecture

**UIGen** is an AI-powered React component generator. Users describe components in a chat interface; Claude generates JSX files into an in-memory virtual file system, and a live preview renders them in an iframe.

### Data flow

1. **Chat** (`src/app/api/chat/route.ts`) — POST endpoint receives messages + serialized VFS state. Prepends system prompt, calls Claude (or mock) with two tools: `str_replace_editor` and `file_manager`. On finish, persists messages + VFS to the DB if `projectId` and an authenticated session exist.

2. **AI tools** (`src/lib/tools/`) — `str_replace_editor` exposes `view`, `create`, `str_replace`, `insert` commands on the VFS. `file_manager` exposes `rename` and `delete`. These are the only ways Claude modifies files.

3. **Virtual File System** (`src/lib/file-system.ts`) — `VirtualFileSystem` class keeps files in memory as `Map<string, FileNode>`. No disk I/O. Serializes to/from plain `Record<string, FileNode>` for JSON transport and DB storage.

4. **Client state** — `FileSystemContext` (`src/lib/contexts/file-system-context.tsx`) holds the VFS instance in React state. `handleToolCall` applies tool-call results from the streaming response to keep the client VFS in sync with what Claude generated server-side.

5. **Preview** (`src/components/preview/PreviewFrame.tsx`) — Reads all VFS files, runs `createImportMap` + `createPreviewHTML` from `src/lib/transform/jsx-transformer.ts` (Babel standalone transpilation), and sets `iframe.srcdoc`. Entry point priority: `App.jsx` → `App.tsx` → `index.jsx` → `index.tsx` → first `.jsx/.tsx` found.

### Auth

Custom JWT-based auth (`src/lib/auth.ts`) using `jose`. Middleware (`src/middleware.ts`) protects routes. Anonymous users can use the app; projects are only persisted for authenticated users. `useAuth` hook (`src/hooks/use-auth.ts`) and `AuthDialog` / `SignInForm` / `SignUpForm` handle the UI flow.

### Database

Prisma with SQLite (`prisma/dev.db`). Two models: `User` (email/password) and `Project` (stores `messages` and `data` as JSON strings). Prisma client is generated into `src/generated/prisma/`.

### Key paths

| Path | Purpose |
|------|---------|
| `src/app/api/chat/route.ts` | Streaming AI chat endpoint |
| `src/lib/file-system.ts` | In-memory VFS implementation |
| `src/lib/provider.ts` | Selects real vs. mock LLM; `MODEL = "claude-haiku-4-5"` |
| `src/lib/prompts/generation.tsx` | System prompt for component generation |
| `src/lib/transform/jsx-transformer.ts` | Babel transpilation + import map for iframe preview |
| `src/lib/contexts/file-system-context.tsx` | Client-side VFS state + tool-call handler |
| `src/lib/contexts/chat-context.tsx` | Chat message state |
| `src/lib/anon-work-tracker.ts` | Tracks anonymous user usage limits |
| `src/actions/` | Next.js server actions for project CRUD |

### Testing

Vitest + jsdom + React Testing Library. Tests live in `__tests__/` directories colocated with the code they test. The `NODE_OPTIONS='--require ./node-compat.cjs'` prefix in npm scripts works around a Node.js compatibility issue — not needed when running `vitest` directly.
