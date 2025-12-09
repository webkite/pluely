## ADDED Requirements

### Requirement: Central AI Input Interface
The Home page SHALL present a prominent, centrally aligned AI input field as the primary interaction element, allowing users to immediately initiate AI tasks.

#### Scenario: Home page display
- **WHEN** user visits the Home page
- **THEN** a large input field is displayed in the visual center of the page
- **AND** the input field accepts text input similar to the global AI assistant
- **AND** the input field is the most visually dominant element

### Requirement: Super Agent Entry Points
The Home page SHALL provide direct access points to specialized "Super Agents" located immediately below the central input field.

#### Scenario: Super Agent list
- **WHEN** viewing the Home page
- **THEN** the following agent entry points are displayed below the input:
  - AI Project (AI项目)
  - AI Slides (AI幻灯片)
  - AI Spreadsheet (AI表格)
  - AI Meeting Advisor (AI会议参谋)
- **AND** each entry point displays an icon and the agent name

### Requirement: Simplified Content Navigation
The Home page SHALL minimize or remove redundant navigation elements (specifically large links to Chats and Settings) to reduce distraction from the primary AI input.

#### Scenario: Minimized navigation
- **WHEN** viewing the Home page
- **THEN** no large "Get Started" cards for Chats or Settings are displayed
- **AND** the page focus remains on the AI input and Super Agents

