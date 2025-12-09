## ADDED Requirements

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
