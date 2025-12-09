# Project Context

## Purpose
Pluely is a privacy-first, lightweight AI assistant desktop application that provides real-time AI assistance during meetings, interviews, and conversations. The application operates with complete stealth through a translucent overlay window that remains invisible in video calls, screen shares, and recordings. Built as an open-source alternative to Cluely, Pluely emphasizes privacy (local storage, zero telemetry), performance (10MB app size, <100ms startup), and complete user control over AI providers and configuration.

## Tech Stack

### Frontend
- **React 19** - UI framework with React Router for navigation
- **TypeScript 5.8** - Type-safe development
- **Vite 7** - Build tool and dev server
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - Component library (Radix UI primitives)
- **React Markdown** - Markdown rendering with syntax highlighting (Shiki)
- **Lucide React** - Icon library

### Backend
- **Tauri 2** - Desktop framework (Rust + WebView)
- **Rust** - System-level operations and performance-critical code
- **SQLite** - Local database for chat history (via tauri-plugin-sql)
- **Tokio** - Async runtime for Rust

### Key Libraries
- **@ricky0123/vad-react** - Voice Activity Detection
- **recharts** - Data visualization for dashboard
- **moment** - Date/time formatting
- **cmdk** - Command palette component

### Platform-Specific
- **macOS**: tauri-nspanel, cidre, macOS permissions plugin
- **Windows**: WASAPI for audio
- **Linux**: PulseAudio bindings

## Project Conventions

### Code Style
- **TypeScript**: Strict mode enabled, ES2020 target, ESNext modules
- **Naming**: 
  - Components: PascalCase (e.g., `Overlay.tsx`, `TextInput.tsx`)
  - Files: kebab-case for utilities, PascalCase for components
  - Hooks: camelCase with `use` prefix (e.g., `useApp.ts`, `useSettings.ts`)
  - Types: camelCase with `.type.ts` suffix (e.g., `completion.type.ts`)
- **Path Aliases**: Use `@/` for `src/` directory imports
- **File Organization**: Feature-based structure with co-located components
- **Formatting**: Standard TypeScript/React conventions, no explicit formatter config found

### Architecture Patterns
- **Component Structure**: 
  - Feature-based organization under `pages/`
  - Reusable UI components in `components/ui/`
  - Context providers for global state (`AppProvider`, `ThemeProvider`)
- **State Management**: 
  - React Context API for app-wide state
  - localStorage for persistent settings
  - SQLite database for chat history
  - Secure storage (keychain) for sensitive credentials
- **API Communication**: 
  - Direct API calls from frontend to AI providers (no proxy)
  - Custom provider support via curl command configuration
  - Streaming support for real-time responses
- **Window Management**: 
  - Multiple window types (main, dashboard, capture overlays)
  - Window label-based routing in `main.tsx`
  - Tauri window APIs for always-on-top, transparency, positioning
- **Audio Processing**: 
  - Platform-specific audio capture (macOS/Windows/Linux)
  - Voice Activity Detection for automatic processing
  - System audio capture for meeting transcription
- **Data Persistence**: 
  - SQLite for structured data (chats, messages)
  - localStorage for user preferences and settings
  - Encrypted secure storage for license keys

### Testing Strategy
- No explicit testing framework found in dependencies
- Testing approach not currently documented
- Consider adding tests for critical paths (audio capture, window management, API calls)

### Git Workflow
- Branch naming: `dev-daily` branch observed
- No explicit commit convention documented
- Recommend conventional commits for better history tracking

## Domain Context

### Core Features
1. **Invisibility Mode**: Translucent overlay window that's invisible in screen shares/video calls
2. **System Audio Capture**: Real-time transcription of system audio (meetings, presentations)
3. **Voice Input**: Speech-to-text with multiple STT provider support
4. **Screenshot Capture**: Full screen or selection-based capture with AI analysis
5. **File Attachments**: Multi-file support for AI context
6. **Chat History**: Persistent conversation storage with search
7. **System Prompts**: Customizable AI behavior instructions
8. **Custom Providers**: Support for any LLM/STT provider via curl commands

### Key Concepts
- **Overlay Window**: Main interaction window, always-on-top, translucent
- **Dashboard**: Settings and management interface (separate window)
- **Capture Overlay**: Special overlay for screenshot selection
- **AI Providers**: Configurable LLM endpoints (OpenAI, Anthropic, custom, etc.)
- **STT Providers**: Speech-to-text services (Whisper, ElevenLabs, custom, etc.)
- **System Prompts**: Instructions that control AI behavior across all interactions
- **Response Settings**: Length, language, auto-scroll preferences
- **Keyboard Shortcuts**: Global shortcuts for all major actions

### User Flows
- **Quick Query**: Toggle overlay → Type → Get response
- **Meeting Assistance**: Enable system audio → Auto-transcribe → AI analysis
- **Screenshot Analysis**: Capture → Auto/manual submit → AI visual analysis
- **Voice Interaction**: Start recording → STT → AI response
- **Chat Management**: Dashboard → View history → Continue conversation

## Important Constraints

### Privacy & Security
- **Zero Telemetry**: No analytics, tracking, or data collection
- **Local-First**: All data stored locally, no server dependency
- **Direct API Calls**: No proxy servers, calls go directly to user's chosen provider
- **Encrypted Storage**: Sensitive credentials in secure keychain storage

### Performance
- **App Size**: Must remain lightweight (~10MB target)
- **Startup Time**: <100ms launch time
- **Resource Usage**: <50MB RAM during normal operation
- **Native Performance**: Avoid Electron overhead, use Tauri's native webview

### Platform Compatibility
- **Cross-Platform**: Must work on macOS, Windows, and Linux
- **Platform-Specific APIs**: Use platform-native audio capture methods
- **Window Management**: Respect platform conventions (dock visibility, always-on-top)

### User Experience
- **Stealth**: Overlay must be invisible in screen shares
- **Accessibility**: Keyboard shortcuts for all major actions
- **Offline Support**: Local features work without internet
- **Customization**: Extensive configuration options for power users

## External Dependencies

### AI Providers (User-Configurable)
- **Pre-configured**: OpenAI, Anthropic Claude, Google Gemini, xAI Grok, Mistral AI, Cohere, Perplexity, Groq, Ollama
- **Custom**: Any REST API endpoint via curl command configuration
- **Authentication**: Bearer tokens, API keys, custom headers
- **Features**: Streaming and non-streaming support, custom variables

### STT Providers (User-Configurable)
- **Pre-configured**: OpenAI Whisper, ElevenLabs STT, Groq Whisper, Google Speech-to-Text, Deepgram, Azure Speech-to-Text, Speechmatics, Rev.ai, IBM Watson STT
- **Custom**: Any REST API endpoint via curl command configuration
- **Audio Formats**: Various formats and sample rates supported

### Infrastructure
- **Tauri Updater**: Automatic update delivery
- **PostHog**: Analytics (plugin present but usage unclear - verify privacy compliance)
- **Keychain**: Secure credential storage (platform-specific)

### Development Tools
- **Vite**: Build tool and HMR
- **TypeScript**: Type checking
- **Tailwind CSS**: Styling
- **React Router**: Client-side routing
