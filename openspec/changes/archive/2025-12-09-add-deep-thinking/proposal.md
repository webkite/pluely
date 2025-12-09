# Change: Add Deep Thinking Toggle and Display

## Why
Users want to enable "Deep Thinking" capabilities (like DeepSeek R1) and visualize the reasoning process separately from the final answer.

## What Changes
- **Chat Input**: Add a "Deep Thinking" toggle switch.
- **Chat Display**:
  - Show a waiting animation when Deep Thinking is enabled.
  - Display "Thinking..." prompt when reasoning content starts.
  - Stream reasoning content in a gray, quoted style.
  - Separate reasoning content from the main response.
- **Logic**: Update streaming logic to handle `reasoning_content` (or equivalent) fields from AI providers.

## Impact
- Affected specs: `chat`
- Affected code:
  - `src/types/completion.ts`
  - `src/hooks/useChatCompletion.ts`
  - `src/hooks/useCompletion.ts`
  - `src/lib/functions/ai-response.function.ts`
  - `src/pages/app/components/completion/Input.tsx`
  - `src/pages/chats/components/View.tsx`

