# The Challenge (Frontend Engineer)

We would like you to build a simple chat interface in TypeScript that sends and displays messages from all senders. The design should resemble the example below:

<img src="chat.png" width="400" alt="chat" />

The assets and additional documentation are available in the **assets** folder.

## Overview

Your task is to implement the frontend for a chat application. The backend API, which handles message storage and retrieval, has been shared as another repository.

**For the backend implementation details and setup instructions, please refer to the [Frontend Challenge Chat API repository](https://github.com/DoodleScheduling/frontend-challenge-chat-api)**.

### Frontend challenge Chat API Details

- **Authentication:** All message related endpoints require a Bearer token.
- **Endpoints:**
  - **GET /api/v1/messages:** Retrieves messages in chronological order, with `before` and `after` pagination support.
  - **POST /api/v1/messages:** Creates a new chat message.
- **Example cURL Commands after you run it locally:**

  **List all messages:**

  ```shell script
  curl http://localhost:3000/api/v1/messages \
    -H "Authorization: Bearer super-secret-doodle-token"
  ```

  **List 10 messages after a specific timestamp:**

  ```shell script
  curl "http://localhost:3000/api/v1/messages?after=2023-01-01T00:00:00.000Z&limit=10" \
    -H "Authorization: Bearer super-secret-doodle-token"
  ```

  **Send a message:**

  ```shell script
  curl -X POST http://localhost:3000/api/v1/messages \
    -H "Authorization: Bearer super-secret-doodle-token" \
    -H "Content-Type: application/json" \
    -d '{"message": "Hello world", "author": "John Doe"}'
  ```

## Challenge Requirements

- **Time Commitment:** Spend 4 to 6 hours on the challenge over the course of one week.
- **Technology:** Build the interface using React and TypeScript. Feel free to use frameworks like Next.js if desired.
- **Responsiveness:** The interface must be responsive and work smoothly on commonly used browsers and mobile devices.
- **Code Quality:** Maintain clear code readability, commit often with useful messages, and prioritize performance and accessibility.

## What We’re Looking For

- **Code Readability and Clean Architecture**
- **Commit Quality:** Frequent, descriptive commits.
- **Performance:** Fast load times and efficient rendering for mobile devices.
- **Accessibility:** User friendly design that is accessible to everyone.
- **Design Attention:** We are not looking for pixel perfect results, but we love attention to detail.

## Submission

Once completed, send an email with a link to your repository to `code-challenge@doodle.com` with the subject `FE-<yourname>`. For example, if your name is "Paul Smith", the subject should be `FE-Paul Smith`.

We will review your submission within one week although sometimes it might take a bit longer.

Good luck and happy coding!

## Local Frontend Setup

From the `frontend-engineer` directory:

```bash
pnpm install
pnpm run dev
```

The frontend dev server will start on `http://localhost:5173` by default.

The chat API is expected to run separately on `http://localhost:3000`.

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

## Implemented Behavior

- Loads the latest page of messages first, then renders them oldest-to-newest.
- Prompts once for a local display name and stores it in `localStorage`.
- Sends new messages without refetching the whole thread.
- Supports loading older history with a `Load older messages` button.
- Polls for newer messages only while the user is at the latest messages and not typing.
- Includes loading, empty, error, and older-loading states.

## Notes

- The provided backend returns the default message list in ascending order. To show the newest page first while preserving chronological display, the frontend requests the initial page with a future `before` cursor.
- Outgoing messages are inferred by matching the stored local author name against the fetched `author` field.

## Assumptions for Ambiguous Parts

Two parts of the challenge were not fully specified in the provided materials, so the frontend makes these assumptions:

### 1. Which user name should be sent when posting messages?

The mockups do not show a permanent author field for outgoing messages, but the backend requires an `author` value on `POST /api/v1/messages`.

Assumption and solution:

- The app asks once for a lightweight local display name.
- That value is stored in `localStorage`.
- The stored display name is sent as the `author` field when creating messages.
- Outgoing messages still hide the visible author label in the UI to match the mockups.

### 2. How should realtime updates work without websockets or server-sent events?

The backend exposes REST endpoints for listing and creating messages, but it does not provide websocket or SSE support.

Assumption and solution:

- The app uses periodic polling instead of realtime push transport.
- Polling requests use `after=<latest createdAt>` so only newer messages are requested.
- New messages are merged without duplication.
- Polling pauses while the user is typing or when they are no longer at the latest messages, so the UI is not disruptive.
