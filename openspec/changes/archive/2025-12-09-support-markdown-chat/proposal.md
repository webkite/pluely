# Change: Support Markdown in Chat

## Why
Users expect rich text formatting in AI responses for better readability, especially for code blocks, lists, and tables.

## What Changes
- Update the default system prompt to explicitly request Markdown formatting from the LLM.
- Ensure the chat interface renders Markdown content correctly.

## Impact
- **Specs**: Adds `chat` capability spec with Markdown requirements.
- **Code**: Updates `src/config/constants.ts` (DEFAULT_SYSTEM_PROMPT).

