# Change: Remodel Home Page

## Why
The current Home page serves as a navigational hub with large buttons for Chats and Settings. To align with the product vision of a "Super App" (similar to Genspark or ChatGPT), the Home page needs to prioritize immediate AI interaction and access to specialized AI agents.

## What Changes
- **Redesign Home Page**: Replace the current "Get Started" and "Quick Tips" layout.
- **Central AI Input**: Add a prominent AI input box in the center of the screen, reusing the capabilities of the existing global input.
- **Super Agent Entry Points**: Add quick access icons below the input for:
  - AI Project (AI项目)
  - AI Slides (AI幻灯片)
  - AI Spreadsheet (AI表格)
  - AI Meeting Advisor (AI会议参谋)
- **Visual Hierarchy**: "Weaken" the visibility of Chats and Settings entry points on the Home page content (relying on the sidebar or subtle links), shifting focus to the input.

## Impact
- **Specs**: New `specs/home/spec.md`.
- **Code**:
  - `src/pages/home/index.tsx`: Complete rewrite.
  - `src/pages/app/components/completion/Input.tsx`: May need refactoring to be reusable in a non-popover context if not already flexible.

