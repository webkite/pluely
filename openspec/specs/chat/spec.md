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

