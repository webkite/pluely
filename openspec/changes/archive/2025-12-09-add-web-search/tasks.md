# Implementation Tasks

## 1. Backend - API Modification (src-tauri/src/api.rs)
- [x] 1.1 Update `chat_stream_response` signature to accept `web_search_enabled`
- [x] 1.2 Implement logic to use `/v1/responses` endpoint for **ALL** OpenAI requests
  - [x] Check if provider is `openai` (regardless of `web_search_enabled`)
  - [x] Construct payload with `input`, `instructions`
  - [x] Conditionally add `tools: [{"type": "web_search_preview"}]` ONLY if `web_search_enabled` is true
  - [x] Handle conversation history adaptation for `input` field
- [x] 1.3 Update streaming response parsing
  - [x] Handle `content` deltas
  - [x] Handle `citations` or `tool_calls` output
- [x] 1.4 Emit `chat_stream_chunk` with content and citations

## 2. Frontend - State Management (useChatCompletion.ts)
- [x] 2.1 Add `isWebSearchEnabled` state and toggle logic
- [x] 2.2 Update `submit` function to pass `webSearchEnabled` to backend invoke
- [x] 2.3 Update stream handling to process citations from backend events

## 3. Frontend - Chat UI (View.tsx)
- [x] 3.1 Add "Web Search" toggle switch in the UI
- [x] 3.2 Display search status/indicator when active

## 4. Frontend - Citation Rendering (View.tsx)
- [x] 4.1 Update message display to render citations/footnotes
- [x] 4.2 Ensure links open in external browser

## 5. Testing
- [x] 5.1 Verify request format to OpenAI matches `/v1/responses` spec for ALL requests
- [x] 5.2 Verify citations are parsed and displayed correctly
- [x] 5.3 Verify normal chat works correctly with Responses API
