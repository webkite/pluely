# Change: Reorganize Main Navigation

## Why
The current navigation has 9 top-level entries (Dashboard, Chats, System prompts, App Settings, Responses, Screenshot, Audio, Cursor & Shortcuts, Dev space), which creates a cluttered sidebar and makes it difficult for users to find settings. By consolidating related settings pages into a grouped Settings section and adding a Home entry, we simplify the navigation to just 3 main entries (Home, Chats, Settings), improving discoverability and user experience.

## What Changes
- Add a new "Home" entry as the primary landing page (replacing Dashboard as the default entry)
- Keep "Chats" as a top-level entry
- Create a new "Settings" parent entry with sub-navigation containing:
  - Dashboard (moved from top-level)
  - App Settings (moved from top-level)
  - Responses (moved from top-level)
  - Screenshot (moved from top-level)
  - Audio (moved from top-level)
  - Cursor & Shortcuts (moved from top-level)
  - Dev space (moved from top-level)
  - System prompts (moved from top-level for consistency)
- Update sidebar navigation to support expandable/collapsible Settings section
- Update routing to maintain all existing page routes
- Update logo click behavior to navigate to Home instead of Dashboard

## Impact
- Affected specs: Navigation structure (new capability)
- Affected code:
  - `src/hooks/useMenuItems.tsx` - Menu structure and items
  - `src/components/Sidebar.tsx` - Navigation rendering with nested support
  - `src/routes/index.tsx` - Route definitions (routes remain unchanged)
  - `src/pages/dashboard/index.tsx` - May need to update if used as Home
  - New: `src/pages/home/index.tsx` - New Home page component
  - New: `src/pages/settings/index.tsx` - Settings page with sub-navigation (or update existing)
- User experience: Simplified navigation, easier access to settings, clearer information architecture

