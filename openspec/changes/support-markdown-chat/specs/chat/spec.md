## ADDED Requirements

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


