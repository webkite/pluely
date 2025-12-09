## 1. Preparation
- [x] 1.1 Define types for passing data (files, agent) via Router State.

## 2. Implementation - Chat View Support
- [x] 2.1 Update `src/pages/chats/components/View.tsx` to read `initialFiles` (Base64/File array) and `initialAgent` from `location.state`.
- [x] 2.2 Modify `useChatCompletion` initialization or `submit` logic to accept these initial values.

## 3. Implementation - Home Page UI
- [x] 3.1 Create `HomeInput` component (or inline in `Home`) with:
    - [x] Text Area (auto-resize).
    - [x] File Upload (using hidden file input).
    - [x] Screenshot (reusing `capture_to_base64` logic).
    - [x] Voice Input (reusing `AudioRecorder` or similar logic).
    - [x] Agent Selector (Dropdown or Popover).
    - [x] Send Button (Icon).
- [x] 3.2 Connect Home Page "Start" action to `navigate` with the gathered data.

## 4. Polish
- [x] 4.1 Ensure styles match the design (centered, glow effects).
- [x] 4.2 Verify "Enter" key behavior (submit vs new line).
