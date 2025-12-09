# home Specification

## Purpose
TBD - created by archiving change remodel-home-page. Update Purpose after archive.
## Requirements
### Requirement: Central AI Input Interface
The Home page SHALL present a prominent, centrally aligned AI input field as the primary interaction element, allowing users to immediately initiate AI tasks.

#### Scenario: Home page display
- **WHEN** user visits the Home page
- **THEN** a large input field is displayed in the visual center of the page
- **AND** the input field accepts text input, file uploads, screenshots, and voice input
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

### Requirement: Multimodal Input
The Home page input SHALL support uploading files, capturing screenshots, and recording voice input.

#### Scenario: File upload
- **WHEN** user clicks the file attachment button
- **THEN** a system file picker opens
- **AND** selected files are displayed in the input area

#### Scenario: Screenshot capture
- **WHEN** user clicks the screenshot button
- **THEN** the system initiates a screen capture (selection or full screen)
- **AND** the captured image is attached to the input

#### Scenario: Voice input
- **WHEN** user clicks the microphone button
- **THEN** the system starts recording and transcribing audio
- **AND** the transcribed text is added to the input field

### Requirement: Agent Selection
The Home page input SHALL allow users to select a specific "SuperAgent" context for the conversation.

#### Scenario: Agent selection
- **WHEN** user clicks the agent selector
- **THEN** a list of available agents is displayed
- **AND** selecting an agent updates the context for the new conversation

