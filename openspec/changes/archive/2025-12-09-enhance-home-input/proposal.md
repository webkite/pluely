# Change: Enhance Home Input

## Why
The Home page AI input currently only supports text. To match the capabilities of the main chat interface and modern AI assistants, it needs to support multimodal input (files, screenshots, voice) and direct agent selection.

## What Changes
- **Home Page Input UI**:
  - Add **File Upload** button (clip icon).
  - Add **Screenshot** button (camera/crop icon).
  - Add **Voice Input** button (microphone icon).
  - Add **SuperAgent Selector** button (sparkles/bot icon) to choose context before starting.
  - Replace "Enter" text hint with a **Send Icon** button.
- **Data Passing**:
  - Update Home page to capture files, screenshots (Base64), and transcripts.
  - Update Navigation logic to pass these assets to the Chat View.
  - Update Chat View (`View.tsx`) to initialize with text AND attachments/agent context.

## Impact
- **Specs**: `specs/home/spec.md`.
- **Code**:
  - `src/pages/home/index.tsx`: Major update to input section.
  - `src/pages/chats/components/View.tsx`: Update to handle `initialFiles` and `agentContext` from router state.
  - New component `src/pages/home/components/HomeInput.tsx` (optional but recommended for cleanliness).
