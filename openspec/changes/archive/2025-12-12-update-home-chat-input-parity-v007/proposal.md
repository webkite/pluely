# Change: Align Home input with Chat input (v0.0.7)

## Why
The Home page input experience must match the Chat page composer to avoid inconsistent UX and duplicated logic.

## What Changes
- Home input uses the same composer behaviors as Chat (multiline, Enter/Shift+Enter, paste-to-attach, attachments, screenshot, voice).
- Home exposes Deep Thinking and Web Search toggles consistent with Chat and passes initial toggle state into the new chat.
- Home agent naming is standardized (Super Agent, AI Sheet, AI Meeting).

## Impact
- Affected specs:
  - `specs/home/spec.md`
  - `specs/chat/spec.md`
- Affected code:
  - `src/pages/home/components/HomeInput.tsx`
  - `src/pages/chats/components/View.tsx`
  - `src/types/index.ts`


