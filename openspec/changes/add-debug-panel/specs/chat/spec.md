## ADDED Requirements

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

