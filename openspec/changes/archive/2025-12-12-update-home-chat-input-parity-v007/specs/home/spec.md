## MODIFIED Requirements

### Requirement: Central AI Input Interface
The Home page SHALL present a prominent, centrally aligned AI input field as the primary interaction element, allowing users to immediately initiate AI tasks.

#### Scenario: Home page display
- **WHEN** user visits the Home page
- **THEN** a large input field is displayed in the visual center of the page
- **AND** the input field accepts text input, file uploads, screenshots, and voice input
- **AND** the input field supports multiline text entry
- **AND** pressing Enter starts a new conversation
- **AND** pressing Shift+Enter inserts a newline without starting a new conversation
- **AND** pasting one or more images attaches them as files (subject to system limits)
- **AND** the input field is the most visually dominant element

#### Scenario: Home passes initial state into chat
- **WHEN** the user starts a new conversation from the Home input
- **THEN** the application navigates to a new chat conversation view
- **AND** the typed input is passed as the initial chat input
- **AND** any attached images are passed as initial attached files

#### Scenario: Home exposes Chat toggles
- **WHEN** the user views the Home input action bar
- **THEN** a "Deep Thinking" toggle is visible
- **AND** a "Web Search" toggle is visible
- **AND** starting a new conversation passes the toggle states into the new chat

### Requirement: Super Agent Entry Points
The Home page SHALL provide direct access points to specialized "Super Agents" located immediately below the central input field.

#### Scenario: Super Agent list
- **WHEN** viewing the Home page
- **THEN** the following agent entry points are displayed below the input:
  - AI Project (AI项目)
  - AI Slides (AI幻灯片)
  - AI Sheet (AI表格)
  - AI Meeting (AI会议)
- **AND** each entry point displays an icon and the agent name

### Requirement: Agent Selection
The Home page input SHALL allow users to select a specific "SuperAgent" context for the conversation.

#### Scenario: Agent selection
- **WHEN** user clicks the agent selector
- **THEN** a list of available agents is displayed
- **AND** selecting an agent updates the context for the new conversation
- **AND** the selected agent icon reflects the selected agent (Project/Slides/Sheet/Meeting)


