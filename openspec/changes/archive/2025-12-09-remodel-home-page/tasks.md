## 1. Preparation
- [x] 1.1 Review `src/pages/app/components/completion/Input.tsx` for reusability (ensure it can render inline without Popover if needed, or wrap it appropriately).

## 2. Implementation
- [x] 2.1 Create `SuperAgentGrid` component for the agent entry points (Project, Slides, Spreadsheet, Meeting Advisor).
- [x] 2.2 Refactor `src/pages/home/index.tsx` to implement the new layout:
    - [x] Center: Large AI Input.
    - [x] Below Center: Super Agent Grid.
    - [x] Remove: Large "Get Started" buttons for Chats/Settings.
    - [x] Remove: "Quick Tips" section (or relocate/minimize).
- [x] 2.3 Ensure "Chats" and "Settings" are either removed from the main content area (relying on sidebar) or present as very subtle text links/icons if required by design (spec implies "weakened", removing them from content works effectively as they are in the sidebar).

## 3. Polish
- [x] 3.1 Verify responsiveness of the central input.
- [x] 3.2 Ensure Agent icons match the design intent (placeholder icons if specific assets not provided).
