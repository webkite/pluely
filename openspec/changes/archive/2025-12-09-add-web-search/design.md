# Technical Design: Web Search via OpenAI Responses API

## Context
Pluely 需要添加联网搜索能力。根据最新研究，应采用 OpenAI 新推出的 `Responses API` (`/v1/responses`) 来实现此功能，该 API 提供了内建的 `web_search_preview` 工具支持。

**重要更新：为了统一实现，所有 OpenAI Provider 的请求（无论是否开启联网搜索）都将迁移到 `/v1/responses` API。**

### Constraints
- 初版仅支持 OpenAI 及兼容 Responses API 的 Provider
- 需要与现有的流式响应机制兼容（或适配新的流式格式）
- 引用信息需要正确解析和展示

## Goals / Non-Goals

### Goals
- 用户可以通过开关启用联网搜索
- AI 回答包含实时网络信息
- 引用来源以脚注形式展示
- 与 Deep Thinking 功能兼容（可同时启用）
- **统一 OpenAI 请求路径：所有 OpenAI 调用均使用 `/v1/responses`**

### Non-Goals
- 不支持自定义搜索引擎（初版）
- 不支持非 OpenAI Provider 的联网搜索（初版）
- 不做搜索结果缓存

## Architecture

### Data Flow
```
用户输入
    ↓
构建请求 (使用 /v1/responses Endpoint)
    {
      "model": "gpt-4o",
      "input": "...",  // 注意：参数名变为 input
      "tools": [{"type": "web_search_preview"}], // 仅在启用搜索时添加
      "stream": true
    }
    ↓
OpenAI Responses API
    ↓
流式响应 (包含 content 和 citations/annotations)
    ↓
前端解析并渲染
    - 正文内容 (带内联引用标记)
    - 脚注区域 (引用链接)
```

### Request Format
```json
{
  "model": "gpt-4o",
  "input": [
    // 假设 input 支持消息数组，或者是单纯的文本。
    // 如果是文本： "input": "用户的问题..."
    // 如果支持多模态或历史：
    {
      "role": "user",
      "content": [
        {"type": "text", "text": "今天有什么重要新闻？"}
      ]
    }
  ],
  "tools": [
    {"type": "web_search_preview"} // Optional: Only if web search is enabled
  ],
  // 还可以包含 instructions (System Prompt)
  "instructions": "You are a helpful assistant..."
}
```

### Response Format (Streaming)
*注：具体流式格式待验证，预计包含 content delta 和 tool output (citations)。*

```json
// 预期包含 citations 字段
{
  "output_text": "根据最新报道[1]...",
  "citations": [
    {
      "start_index": 10,
      "end_index": 12,
      "text": "最新报道",
      "sources": [
        {
            "type": "web_page",
            "url": "https://example.com/news",
            "title": "新闻标题"
        }
      ]
    }
  ]
}
```

## Implementation Details

### Backend Changes (api.rs)

需要修改 `chat_stream_response` 逻辑，**当检测到 Provider 为 OpenAI 时**，强制使用 `/v1/responses` 逻辑，无论 `web_search_enabled` 状态如何。

```rust
// 伪代码示例
let is_openai = provider == "openai";
let url = if is_openai { "https://api.openai.com/v1/responses" } else { api_config.url };

let request_body = if is_openai {
    serde_json::json!({
        "model": "gpt-4o",
        "input": user_message, // 或处理后的 input 结构
        "instructions": system_prompt,
        // 仅在 web_search_enabled 时添加 tools
        "tools": web_search_enabled ? [{"type": "web_search_preview"}] : []
    })
} else {
    // Standard Chat Completion body
};
```

### Frontend Changes

#### useChatCompletion.ts
需要更新调用逻辑，当启用 web search 时，可能需要切换调用路径或传递特定标志给后端以使用新的 API 构建逻辑。

```typescript
const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);

// 在 submit 函数中传递参数
await invoke("chat_stream_response", {
    // ... existing params
    webSearchEnabled: isWebSearchEnabled,
});
```

#### View.tsx - 搜索开关
保持不变，使用 Switch 组件控制 `isWebSearchEnabled`。

### Citation Rendering

在 Markdown 组件中，检测并渲染引用链接。如果是标准的 markdown 引用格式 `[^1]`，则自动渲染为脚注；如果是 API 返回的结构化数据，则需要手动拼装。

```tsx
// 在消息末尾添加脚注区域
{message.citations && message.citations.length > 0 && (
  <div className="mt-4 pt-2 border-t border-muted/30 text-xs text-muted-foreground">
    <div className="font-medium mb-1">Sources:</div>
    {message.citations.map((citation, index) => (
      <div key={index} className="flex items-start gap-1">
        <span>[{index + 1}]</span>
        <a 
          href={citation.url} 
          target="_blank"
          className="text-primary hover:underline truncate"
        >
          {citation.title || citation.url}
        </a>
      </div>
    ))}
  </div>
)}
```

## Decisions

### Decision 1: 使用 OpenAI Responses API
**Why**: 
- 官方支持的联网搜索方式
- `web_search_preview` 工具集成度高
- 避免自行通过 Google API/Bing API 实现搜索和 RAG 流程

**Trade-off**: 仅支持 OpenAI Provider，且 API 为 beta 阶段，接口可能变动。

### Decision 2: 手动开关触发
**Why**:
- 用户控制搜索时机
- 避免不必要的搜索调用（成本和延迟）

### Decision 3: 强制 OpenAI 使用 Responses API
**Why**:
- 统一 OpenAI 的调用逻辑，避免维护两套请求构建逻辑
- 为未来支持其他 Responses API 特性（如文件搜索、计算机使用）打基础

## Risks / Trade-offs

### Risk 1: API 稳定性与文档缺失
**Mitigation**: 
- 标记为实验性功能
- 密切关注 OpenAI 更新

### Risk 2: `input` 参数与历史记录
**Mitigation**:
- 需要验证 `input` 是否支持传入完整的对话历史。如果不支持，可能需要自行拼接历史到 Prompt 中，或使用 Thread ID (如果 API 支持)。

## Migration Plan
无需数据迁移，纯增量功能。

## Open Questions
- [ ] `v1/responses` 的流式响应格式确切定义？
- [ ] 如何通过 `input` 参数传递多轮对话历史？是否需要手动拼接？
