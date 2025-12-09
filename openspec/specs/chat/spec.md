# chat Specification

## Purpose
TBD - created by archiving change support-markdown-chat. Update Purpose after archive.
## Requirements
### Requirement: Markdown Rendering
The chat interface MUST render AI responses using Markdown formatting.

#### Scenario: Code block rendering
- **WHEN** the AI response contains a code block (e.g., ```typescript ...)
- **THEN** the code block is rendered with syntax highlighting
- **AND** a copy button is available for the code block

#### Scenario: Rich text rendering
- **WHEN** the AI response contains Markdown syntax (bold, italic, lists, tables)
- **THEN** the text is rendered with appropriate formatting style

### Requirement: System Prompt Markdown Instruction
The default system prompt MUST instruct the AI provider to generate responses in Markdown format.

#### Scenario: Default prompt configuration
- **WHEN** the application initializes or resets defaults
- **THEN** the system prompt includes an instruction to "Use Markdown formatting"

### Requirement: Deep Thinking Mode
The system SHALL provide a toggle to enable "Deep Thinking" mode, which displays the AI's reasoning process separately.

#### Scenario: Deep Thinking visualization
- **WHEN** the "Deep Thinking" toggle is enabled
- **AND** the user submits a message
- **THEN** a waiting animation is displayed
- **AND** when reasoning content starts arriving, a "Thinking" indicator is shown
- **AND** the reasoning content streams in a gray, quoted style
- **AND** the final response follows the reasoning content

### Requirement: Web Search Toggle
The chat interface SHALL provide a toggle to enable "Web Search" mode, which augments AI responses with real-time web search results via OpenAI Responses API.

#### Scenario: Toggle display and state
- **WHEN** the user views the chat input area
- **THEN** a "Web Search" toggle switch with a Globe icon is visible
- **AND** the toggle is positioned next to the Deep Thinking toggle
- **AND** the toggle state persists across sessions

#### Scenario: Search enabled indicator
- **WHEN** the web search toggle is enabled
- **THEN** the toggle displays an active visual indicator (highlighted color)
- **AND** the Globe icon changes to primary color

### Requirement: Search Status Indicator
The system SHALL display a status indicator when web search is in progress.

#### Scenario: Search in progress
- **WHEN** web search is enabled
- **AND** the user submits a message
- **THEN** a "Searching..." indicator with a Globe icon is displayed
- **AND** the indicator shows a loading animation

#### Scenario: Search completed
- **WHEN** the web search and AI response generation completes
- **THEN** the search indicator is hidden
- **AND** the response is displayed with citations

### Requirement: Citation Display
The system SHALL display citations for web search results in the AI response as footnotes.

#### Scenario: Inline citation format
- **WHEN** the AI response includes citations from web search
- **THEN** citations are displayed as inline references (e.g., [1], [2])
- **AND** a "Sources" section at the end of the message shows the citation links

#### Scenario: Citation link behavior
- **WHEN** the user clicks on a citation link in the Sources section
- **THEN** the source URL opens in the system default browser

#### Scenario: No citations
- **WHEN** the AI response does not include any citations
- **THEN** no Sources section is displayed

### Requirement: Debug Panel API Call Monitoring
The system SHALL provide a Debug Panel that displays structured information about all cloud API calls.

#### Scenario: API call start display
- **WHEN** an API request is initiated
- **THEN** a new entry appears in the Debug Panel
- **AND** the entry shows status as "Pending" with yellow indicator
- **AND** the entry displays the API URL and request method
- **AND** the entry displays the request timestamp

#### Scenario: Request details display
- **WHEN** the user views the Request tab of an API call entry
- **THEN** the full request body is displayed in formatted JSON
- **AND** sensitive information (API keys) is masked as "***"
- **AND** a summary shows: model, message count, tools enabled, stream mode
- **AND** a Copy button is available to copy the request JSON

#### Scenario: Streaming status display
- **WHEN** an API call is receiving streaming response
- **THEN** the entry status shows "Streaming" with blue indicator
- **AND** the entry displays real-time chunk count
- **AND** the entry displays total bytes received
- **AND** the entry indicates if reasoning content is being received

#### Scenario: Response details display
- **WHEN** the user views the Response tab of a completed API call
- **THEN** the response status code is displayed
- **AND** a summary shows: chunk count, total bytes, has reasoning, has citations
- **AND** duration from start to completion is displayed

#### Scenario: Error display
- **WHEN** an API call fails
- **THEN** the entry status shows "Error" with red indicator
- **AND** the error message is displayed prominently
- **AND** the failed request details remain viewable

#### Scenario: Timeline display
- **WHEN** the user views the Timeline tab of an API call
- **THEN** the start time is displayed
- **AND** the first byte time is displayed (if streaming)
- **AND** the end time is displayed
- **AND** the total duration is displayed

### Requirement: Debug Panel Controls
The system SHALL provide controls for managing the Debug Panel.

#### Scenario: Toggle debug panel
- **WHEN** the user clicks the Debug button in the chat header
- **THEN** the Debug Panel opens/closes

#### Scenario: Clear debug data
- **WHEN** the user clicks the Clear button in the Debug Panel
- **THEN** all API call entries are removed
- **AND** the panel shows "No API calls recorded"

#### Scenario: Copy request data
- **WHEN** the user clicks Copy on a request
- **THEN** the full request JSON is copied to clipboard
- **AND** a success feedback is shown

### Requirement: Debug Data Privacy
The system SHALL protect sensitive information in debug displays.

#### Scenario: API key masking
- **WHEN** displaying request headers
- **THEN** the Authorization header value is masked as "Bearer ***"

#### Scenario: Image data summarization  
- **WHEN** the request contains base64 image data
- **THEN** the image is displayed as "[Image: {size}KB]" instead of full base64

