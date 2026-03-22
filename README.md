# Frontend Engineer Challenge

This repository contains a React + TypeScript implementation of the Doodle frontend chat challenge.

The goal of the solution was to keep the codebase small and readable while still handling the non-trivial parts of the exercise deliberately:

- loading the latest messages first even though the backend default ordering is chronological
- supporting message creation with a required `author` field that is not exposed in the final mockup
- loading older history without breaking scroll position
- refreshing new messages without websocket or SSE support

<img src="chat.png" width="400" alt="chat preview" />

## What Is Implemented

- responsive chat layout based on the provided assets
- initial message loading with loading, empty, and error states
- local display-name flow backed by `localStorage`
- sending new messages
- loading older messages on demand
- polling for newly created messages
- keyboard and focus handling for accessibility
- mobile-safe composer and long-message handling

## Run Locally

The frontend expects the provided chat API to run separately on `http://localhost:3000`.

From the `frontend-engineer` directory:

```bash
pnpm install
pnpm run dev
```

The Vite dev server starts on `http://localhost:5173`.

## Environment Variables

Optional overrides are available through Vite env vars:

```bash
cp .env.example .env
```

- `VITE_API_BASE_URL`
- `VITE_CHAT_API_TOKEN`

## Available Scripts

```bash
pnpm run dev
pnpm run build
pnpm run typecheck
pnpm run lint
pnpm run format:check
pnpm run check
```

## Technical Decisions

### Stack

- `Vite + React + TypeScript` keeps the setup lightweight and fast for a challenge-sized app.
- The codebase is organized by feature responsibility rather than around a large app-wide state abstraction.

### Initial Message Loading

The provided backend returns the default `GET /api/v1/messages` list in chronological order. If the frontend requests only `limit=3`, the API returns the oldest three messages, not the newest three.

To show the latest page first while still rendering messages oldest-to-newest in the UI, the initial request uses a future `before` cursor. This keeps the UI chronological without requiring a second reorder pass in the view.

### Local Identity

The backend requires an `author` field on `POST /messages`, but the polished mockups do not show an author label on outgoing messages.

The chosen approach is:

- ask once for a lightweight local display name
- persist it in `localStorage`
- send it as the API `author`
- infer outgoing messages by comparing the fetched author against the stored local author
- keep the outgoing author label hidden in the UI to match the design

This keeps the API contract intact without adding a permanent author input to the composer.

### Refresh Strategy

The backend does not expose websocket or server-sent event support, so realtime-like updates are implemented with polling.

Polling uses `after=<latest createdAt>` and is deliberately conservative:

- only newer messages are requested
- new messages are merged without duplication
- polling pauses while the user is typing
- polling also pauses when the user is no longer at the latest messages

This avoids interrupting the user while still keeping the conversation reasonably fresh.

### Sending Messages

After a successful `POST`, the frontend appends the created message locally instead of refetching the entire thread. The backend already returns the created message, so an immediate follow-up fetch would add cost without improving correctness.

### Older History

Older messages are loaded with `before=<oldest createdAt>`. When older items are prepended, the scroll position is restored so the viewport does not jump.

## Architecture

The current structure is intentionally small:

- `src/components/`
  Presentational UI components such as the composer, message list, skeletons, and state cards.
- `src/features/chat/api.ts`
  Typed API client and error normalization.
- `src/features/chat/hooks/`
  Focused chat hooks for fetching, sending, polling, history loading, conversation state, and scroll behavior.
- `src/features/chat/use-chat-shell.ts`
  Screen-level orchestration for the chat shell.
- `src/lib/`
  App configuration and storage helpers.

The main separation is:

- reusable feature hooks in `features/chat/hooks`
- presentational rendering in `components`
- chat-screen composition in `use-chat-shell`

## Assumptions for Ambiguous Parts

### 1. Which user name should be sent when posting messages?

The challenge mockups do not show a visible author field for outgoing messages, but the backend requires `author` on creation.

Assumption and solution:

- the app stores a lightweight local display name
- that stored value is used as the API `author`
- outgoing messages hide the author label in the rendered UI

### 2. How should realtime updates work without websockets or SSE?

The backend only exposes REST endpoints for listing and creating messages.

Assumption and solution:

- periodic polling is used instead of push transport
- polling requests use the `after` cursor
- polling is paused while the user is typing or reading older messages

## Accessibility and UX Notes

- the composer and identity prompt are keyboard accessible
- focus moves intentionally between the identity prompt and the composer
- loading, sending, and error states are exposed accessibly
- the sticky composer respects mobile safe-area insets
- long message content is wrapped safely without breaking the layout

## Verification

The main validation commands used during implementation were:

```bash
pnpm run check
pnpm run build
```

## What I Would Improve Next

Given more time, the next improvements would be:

- add automated tests around pagination, polling, and scroll restoration
- add lightweight visual regression coverage against the provided assets
