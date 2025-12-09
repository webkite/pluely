## ADDED Requirements

### Requirement: Home Navigation Entry
The application SHALL provide a "Home" entry as the primary top-level navigation item that serves as the main landing page for users.

#### Scenario: User accesses Home
- **WHEN** user clicks the "Home" navigation item or the application logo
- **THEN** the Home page is displayed
- **AND** the Home entry is highlighted as active in the sidebar

#### Scenario: Logo navigation
- **WHEN** user clicks the Pluely logo in the sidebar
- **THEN** the application navigates to the Home page
- **AND** the Home entry is highlighted as active

### Requirement: Simplified Top-Level Navigation
The application SHALL display exactly three top-level navigation entries: Home, Chats, and Settings.

#### Scenario: Navigation structure
- **WHEN** user views the sidebar navigation
- **THEN** exactly three top-level entries are visible: Home, Chats, and Settings
- **AND** no other top-level navigation entries are displayed

### Requirement: Settings Grouped Navigation
The application SHALL group all configuration and settings pages under a single "Settings" parent entry with expandable sub-navigation.

#### Scenario: Settings section expansion
- **WHEN** user clicks the "Settings" navigation entry
- **THEN** the Settings section expands to show sub-navigation items
- **AND** the following sub-items are visible: Dashboard, App Settings, Responses, Screenshot, Audio, Cursor & Shortcuts, Dev space, System prompts

#### Scenario: Settings section collapse
- **WHEN** user clicks the "Settings" navigation entry while it is expanded
- **THEN** the Settings section collapses to hide sub-navigation items
- **AND** only the "Settings" parent entry remains visible

#### Scenario: Navigate to settings sub-item
- **WHEN** user clicks a sub-item under Settings (e.g., "App Settings")
- **THEN** the corresponding settings page is displayed
- **AND** the Settings parent entry remains expanded
- **AND** the active sub-item is highlighted

#### Scenario: Active route highlighting
- **WHEN** user is viewing a page that is a sub-item of Settings
- **THEN** the Settings parent entry is visually indicated as containing the active route
- **AND** the specific sub-item is highlighted as active

### Requirement: Chats Navigation Entry
The application SHALL maintain "Chats" as a top-level navigation entry, separate from Settings.

#### Scenario: Access Chats
- **WHEN** user clicks the "Chats" navigation entry
- **THEN** the Chats page is displayed
- **AND** the Chats entry is highlighted as active in the sidebar

### Requirement: Navigation Menu Structure
The navigation menu structure SHALL be organized with three top-level entries: Home, Chats, and Settings. Settings SHALL contain all configuration and settings pages as sub-navigation items. The menu SHALL support expandable/collapsible sections for nested navigation.

#### Scenario: Menu organization
- **WHEN** the application loads
- **THEN** the sidebar displays Home, Chats, and Settings as top-level entries
- **AND** Settings can be expanded to reveal sub-navigation items
- **AND** all existing page routes remain accessible through the new navigation structure

#### Scenario: Settings sub-navigation access
- **WHEN** user expands the Settings section
- **THEN** all previously top-level settings pages are accessible as sub-items
- **AND** clicking a sub-item navigates to the corresponding page
- **AND** the page content and functionality remain unchanged

