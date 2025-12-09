## Context
The current navigation structure has 9 top-level entries, making the sidebar cluttered and settings difficult to discover. Users need a cleaner, more organized navigation that groups related functionality together while maintaining quick access to primary features like Chats.

## Goals / Non-Goals

### Goals
- Simplify navigation to 3 top-level entries (Home, Chats, Settings)
- Group all settings and configuration pages under Settings
- Maintain all existing page routes and functionality
- Provide expandable/collapsible Settings section for better organization
- Create a clear Home entry as the primary landing page

### Non-Goals
- Changing the functionality of existing pages
- Removing any existing features or routes
- Changing the routing structure (routes remain the same, only navigation UI changes)
- Implementing complex nested navigation beyond one level (Settings sub-items)

## Decisions

### Decision: Expandable Settings Section
**What**: Settings will be an expandable/collapsible parent entry with sub-items.

**Why**: This allows grouping related pages while keeping the top-level navigation clean. Users can expand Settings when needed and collapse it when not in use.

**Alternatives considered**:
- Dropdown menu: More complex interaction, requires hover/click management
- Separate Settings page with tabs: Requires additional page structure and routing changes
- Always-expanded sub-items: Takes up too much vertical space

### Decision: Home Page Implementation
**What**: Create a new Home page that can serve as a welcome/overview page, potentially reusing Dashboard content or creating new content.

**Why**: Provides a clear entry point and replaces Dashboard as the default landing page. Users expect a "Home" entry in navigation.

**Alternatives considered**:
- Redirect Home to Dashboard: Less clear separation of concerns
- Make Dashboard the Home: Doesn't match user's request for separate Home entry

### Decision: Keep Chats as Top-Level
**What**: Chats remains a top-level entry, separate from Settings.

**Why**: Chats is a primary feature used frequently. Keeping it at the top level ensures quick access without requiring expansion of Settings.

**Alternatives considered**:
- Move Chats under Settings: Would reduce top-level entries but makes primary feature less accessible
- Move Chats under Home: Doesn't match user's request structure

### Decision: Include System Prompts in Settings
**What**: System Prompts is moved under Settings as a sub-item.

**Why**: User specified exactly 3 top-level entries. System Prompts is a configuration feature that fits logically with other settings.

**Alternatives considered**:
- Keep System Prompts as top-level: Would result in 4 entries, not matching user's requirement

## Risks / Trade-offs

### Risk: Settings Section May Be Hidden
**Mitigation**: Settings section can be expanded by default on first visit, or we can add visual indicators (chevron icon) to show it's expandable.

### Risk: Additional Click to Access Settings
**Mitigation**: Settings is a frequently used section, but the trade-off of cleaner navigation is worth it. We can track usage and adjust if needed.

### Risk: Navigation Component Complexity
**Mitigation**: Use simple state management for expand/collapse. Keep the implementation straightforward with React state.

## Migration Plan

### Steps
1. Create Home page component and route
2. Update menu structure in `useMenuItems.tsx` to support nested items
3. Update Sidebar component to render nested navigation with expand/collapse
4. Update Settings page to include sub-navigation if needed (or handle via sidebar)
5. Update logo click handler
6. Test all navigation paths

### Rollback
- Revert menu structure changes in `useMenuItems.tsx`
- Revert Sidebar component changes
- Remove Home route if added
- Restore original logo click behavior

## Open Questions
- Should Settings be expanded by default on first visit?
- Should Home page reuse Dashboard content or have its own welcome/overview content?
- Should we add keyboard shortcuts for expanding/collapsing Settings section?

