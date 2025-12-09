## 1. Implementation
- [ ] 1.1 Update `ChatMessage` interface in `src/types/completion.ts` to include `reasoning_content`.
- [ ] 1.2 Update `getStreamingContent` in `src/lib/functions/common.function.ts` to extract reasoning content.
- [ ] 1.3 Update `fetchAIResponse` in `src/lib/functions/ai-response.function.ts` to yield object with content and reasoning.
- [ ] 1.4 Update `useChatCompletion` and `useCompletion` to handle new `fetchAIResponse` return type.
- [ ] 1.5 Add `isDeepThinkingEnabled` state to `useChatCompletion` and `Input` component.
- [ ] 1.6 Add "Deep Thinking" toggle in `src/pages/app/components/completion/Input.tsx`.
- [ ] 1.7 Update `src/pages/chats/components/View.tsx` to display reasoning content with waiting animation and specific styling.


