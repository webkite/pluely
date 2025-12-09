# Change: Add Web Search Capability

## Why
用户在使用 AI 助手时，经常需要获取实时、最新的信息（如新闻、天气、股票、技术文档更新等）。当前 AI 模型的知识有截止日期限制，无法回答关于最新信息的问题。添加联网搜索能力可以让 AI 助手提供更准确、更及时的回答。

## What Changes

### 技术方案
采用 **OpenAI Responses API** 内置的 `web_search_preview` 工具，直接实现联网搜索功能。

优点：
- 实现简单，只需在请求中添加 `tools` 参数
- API 返回结构化的 annotations（引用信息）
- 无需额外的搜索 API 费用
- OpenAI 优化了搜索结果的整合质量

### 界面变更
- 在聊天输入区添加「联网搜索」开关（类似 Deep Thinking 开关）
- 添加搜索状态指示器（"正在搜索..."）
- 在 AI 回答中显示引用来源（带链接）
- 引用以内联 `[1]` + 底部脚注形式展示

### 后端变更
- 修改 `chat_stream_response` 支持 `web_search_enabled` 参数
- 请求中添加 `tools: [{"type": "web_search_preview"}]`
- 解析响应中的 annotations 并传递给前端

### 限制
- 初版仅支持 OpenAI 及兼容 Responses API 的 Provider
- 后续可扩展独立搜索引擎方案支持其他 Provider

## Impact
- Affected specs: `chat`
- Affected code:
  - `src-tauri/src/api.rs` - 修改请求添加 tools 参数
  - `src/pages/chats/components/View.tsx` - UI 变更
  - `src/hooks/useChatCompletion.ts` - 状态管理
  - `src/lib/functions/ai-response.function.ts` - 请求参数修改
  - `src/components/Markdown/` - 引用渲染

## Decisions Made
- **触发方式**: 手动开关（用户主动开启）
- **技术方案**: OpenAI Responses API (`web_search_preview`)
- **引用展示**: 内联引用 `[1]` + 底部脚注链接

