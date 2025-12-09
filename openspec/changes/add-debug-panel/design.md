# Technical Design: Enhanced Debug Panel

## Context
当前的调试功能分散在各处，缺乏统一的结构化视图。需要一个系统性的解决方案来监控所有云端 API 调用。

## Goals / Non-Goals

### Goals
- 清晰展示每个 API 调用的完整生命周期
- 结构化显示请求和响应数据
- 支持 JSON 格式化和语法高亮
- 脱敏处理敏感信息
- 支持复制数据便于调试

### Non-Goals
- 不做请求拦截或修改
- 不做历史记录持久化
- 不做网络抓包级别的详细信息

## Architecture

### Event Flow
```
Rust Backend                          Frontend
    │                                     │
    │ ── api_call_start ──────────────►   │
    │    {id, type, request}              │
    │                                     │
    │ ── api_call_streaming ──────────►   │
    │    {id, chunks, bytes}              │
    │                                     │
    │ ── api_call_complete ───────────►   │
    │    {id, response, timing}           │
    │                                     │
    │ ── api_call_error ──────────────►   │
    │    {id, error, timing}              │
```

### Data Types

```typescript
// 前端类型定义
interface ApiCallDebug {
  id: string;
  timestamp: number;
  type: 'chat' | 'search' | 'stt' | 'tts' | 'other';
  status: 'pending' | 'streaming' | 'success' | 'error';
  
  request: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: {
      model?: string;
      messages?: { role: string; content: string | object }[];
      tools?: object[];
      stream?: boolean;
      [key: string]: unknown;
    };
    // 大型数据的摘要
    bodySummary?: {
      messageCount?: number;
      hasImages?: boolean;
      imageCount?: number;
      hasTools?: boolean;
      toolTypes?: string[];
    };
  };
  
  response?: {
    status: number;
    statusText: string;
    headers?: Record<string, string>;
    // 流式响应的摘要
    streamSummary?: {
      chunkCount: number;
      totalBytes: number;
      hasReasoning: boolean;
      hasCitations: boolean;
    };
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

```rust
// Rust 后端事件结构
#[derive(Serialize)]
struct ApiCallStart {
    id: String,
    call_type: String,  // "chat", "search", "stt"
    timestamp: u64,
    request: ApiRequestInfo,
}

#[derive(Serialize)]
struct ApiRequestInfo {
    url: String,
    method: String,
    headers: HashMap<String, String>,  // 脱敏后
    body_summary: serde_json::Value,
    body_full: Option<serde_json::Value>,  // 可选完整body
}

#[derive(Serialize)]
struct ApiCallComplete {
    id: String,
    timestamp: u64,
    status: u16,
    duration_ms: u64,
    stream_summary: Option<StreamSummary>,
}

#[derive(Serialize)]
struct StreamSummary {
    chunk_count: u32,
    total_bytes: u64,
    has_reasoning: bool,
    has_citations: bool,
}
```

## Implementation

### Backend: api.rs

在每个 API 调用处添加调试事件：

```rust
// 1. 请求开始时
let call_id = uuid::Uuid::new_v4().to_string();
let start_time = std::time::Instant::now();

let request_debug = serde_json::json!({
    "id": call_id,
    "type": "chat",
    "timestamp": chrono::Utc::now().timestamp_millis(),
    "request": {
        "url": api_config.url,
        "method": "POST",
        "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer ***"  // 脱敏
        },
        "body_summary": {
            "model": api_config.model,
            "message_count": messages.len(),
            "has_tools": web_search_enabled.unwrap_or(false),
            "stream": true
        },
        "body_full": request_body.clone()  // 完整请求体
    }
});
let _ = app.emit("api_call_start", request_debug);

// 2. 流式响应过程中（定期更新）
let stream_update = serde_json::json!({
    "id": call_id,
    "chunk_count": chunk_count,
    "total_bytes": total_bytes,
    "has_reasoning": !full_reasoning.is_empty(),
});
let _ = app.emit("api_call_streaming", stream_update);

// 3. 请求完成时
let complete_debug = serde_json::json!({
    "id": call_id,
    "timestamp": chrono::Utc::now().timestamp_millis(),
    "status": "success",
    "duration_ms": start_time.elapsed().as_millis(),
    "response": {
        "chunk_count": chunk_count,
        "total_bytes": total_bytes,
        "has_reasoning": !full_reasoning.is_empty(),
        "has_citations": !citations.is_empty(),
        "citation_count": citations.len()
    }
});
let _ = app.emit("api_call_complete", complete_debug);
```

### Frontend: DebugPanel Component

创建独立的 DebugPanel 组件：

```tsx
// src/components/DebugPanel/index.tsx
interface DebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
  apiCalls: ApiCallDebug[];
}

export function DebugPanel({ isOpen, onClose, apiCalls }: DebugPanelProps) {
  const [selectedCall, setSelectedCall] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'request' | 'response' | 'timeline'>('request');
  
  return (
    <div className="fixed top-16 right-4 w-[500px] max-h-[80vh] ...">
      {/* Header */}
      {/* API Call List */}
      {/* Selected Call Detail */}
    </div>
  );
}
```

### JSON Viewer Component

```tsx
// src/components/DebugPanel/JsonViewer.tsx
interface JsonViewerProps {
  data: unknown;
  maxHeight?: number;
  onCopy?: () => void;
}

export function JsonViewer({ data, maxHeight, onCopy }: JsonViewerProps) {
  const formatted = JSON.stringify(data, null, 2);
  
  return (
    <div className="relative">
      <pre className="bg-black/50 rounded p-2 overflow-auto text-xs">
        {/* 语法高亮渲染 */}
      </pre>
      <button onClick={onCopy} className="absolute top-2 right-2">
        Copy
      </button>
    </div>
  );
}
```

## Decisions

### Decision 1: 事件驱动架构
**Why**: 前端被动接收后端事件，保持解耦

### Decision 2: 请求体完整发送
**Why**: 调试时需要看到完整请求，便于排查问题
**Mitigation**: API Key 等敏感信息在后端脱敏

### Decision 3: 流式更新采用节流
**Why**: 避免频繁更新导致性能问题
**Implementation**: 每 500ms 或每 10 个 chunk 更新一次

## Migration Plan
1. 创建 DebugPanel 组件
2. 修改后端添加调试事件
3. 在 useChatCompletion 中管理调试数据
4. 替换现有的简易 Debug 面板
5. 测试各种 API 调用场景

