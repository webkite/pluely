## MODIFIED Requirements

### Requirement: Central AI Input Interface
The Home page SHALL present a prominent, centrally aligned AI input field as the primary interaction element, allowing users to immediately initiate AI tasks.

#### Scenario: Home page display
- **WHEN** user visits the Home page
- **THEN** a large input field is displayed in the visual center of the page
- **AND** the input field accepts text input, file uploads, screenshots, and voice input
- **AND** the input field is the most visually dominant element

## ADDED Requirements

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
