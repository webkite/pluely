# Change: Add Enhanced Debug Panel for API Monitoring

## Why
开发和调试 AI 功能时，需要清晰了解每次 API 调用的完整信息：
- 请求参数（URL、Headers、Body）
- 响应数据（Status、Headers、Body）
- 时间线（请求开始、响应开始、完成）
- 错误信息

当前的 Debug 面板信息零散，不够结构化，难以排查问题（如联网搜索功能的 tools 参数是否正确传递）。

## What Changes

### 界面变更
- 重新设计 Debug 面板，采用结构化的 API 调用监控视图
- 每个 API 调用显示为一个可折叠的卡片
- 卡片内包含：请求信息、响应信息、时间线、状态
- 支持 JSON 格式化显示和语法高亮
- 支持复制请求/响应数据

### 后端变更
- 标准化 API 调用的调试事件格式
- 发送完整的请求信息（不含敏感数据如 API Key）
- 发送响应摘要和关键数据

### 数据结构
```typescript
interface ApiCallDebug {
  id: string;
  timestamp: number;
  type: 'chat' | 'search' | 'stt' | 'other';
  status: 'pending' | 'streaming' | 'success' | 'error';
  request: {
    url: string;
    method: string;
    headers: Record<string, string>; // 脱敏后
    body: object;
  };
  response?: {
    status: number;
    headers?: Record<string, string>;
    body?: object;
    error?: string;
  };
  timing: {
    startTime: number;
    firstByteTime?: number;
    endTime?: number;
    duration?: number;
  };
}
```

## Impact
- Affected specs: `chat` (新增 debug capability)
- Affected code:
  - `src-tauri/src/api.rs` - 发送结构化调试事件
  - `src/pages/chats/components/View.tsx` - 重新设计 Debug 面板
  - `src/hooks/useChatCompletion.ts` - 管理调试数据
  - 新增 `src/components/DebugPanel/` - 独立的调试面板组件

## UI 设计

### Debug 面板布局
```
┌─────────────────────────────────────────────────────┐
│ 🔧 Debug Panel                              [X]     │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ 🟢 Chat API Call                    2.3s        │ │
│ │ POST https://api.openai.com/v1/chat/completions │ │
│ ├─────────────────────────────────────────────────┤ │
│ │ [Request] [Response] [Timeline]                 │ │
│ │                                                 │ │
│ │ {                                               │ │
│ │   "model": "gpt-4o",                           │ │
│ │   "messages": [...],                           │ │
│ │   "tools": [{"type": "web_search_preview"}],   │ │
│ │   "stream": true                               │ │
│ │ }                                              │ │
│ │                                     [Copy]     │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 🔵 Streaming...                      1.2s       │ │
│ │ Chunks: 45 | Content: 1.2KB                    │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 状态指示
- 🟡 Pending - 请求已发送，等待响应
- 🔵 Streaming - 正在接收流式响应
- 🟢 Success - 请求成功完成
- 🔴 Error - 请求失败

## Decisions Made
- Debug 面板作为独立组件，可在多处复用
- API Key 等敏感信息不发送到前端
- 请求体中的大型数据（如 base64 图片）显示摘要而非完整内容

