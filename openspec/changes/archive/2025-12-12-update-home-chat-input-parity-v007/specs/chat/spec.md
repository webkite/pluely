## ADDED Requirements

### Requirement: Chat Message Composer
The chat interface SHALL provide a multiline message composer with consistent keyboard behavior and multimodal attachments.

#### Scenario: Multiline input and submit behavior
- **WHEN** the user types in the chat composer
- **THEN** the composer accepts multiline text
- **AND** pressing Enter submits the message
- **AND** pressing Shift+Enter inserts a newline without submitting

#### Scenario: Paste-to-attach images
- **WHEN** the user pastes clipboard content that contains one or more images
- **THEN** the images are attached to the composer instead of being pasted as raw text
- **AND** the number of attached images is limited by the system maximum

#### Scenario: Attach images and manage attachments
- **WHEN** the user attaches images via file picker or screenshot
- **THEN** the attached images are shown in the composer
- **AND** the user can remove individual images
- **AND** the user can remove all images at once


