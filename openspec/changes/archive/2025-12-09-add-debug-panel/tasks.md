# Implementation Tasks

## 1. Backend - Debug Events
- [ ] 1.1 定义调试事件的 Rust 结构体
- [ ] 1.2 生成唯一的 API 调用 ID
- [ ] 1.3 在 `chat_stream_response` 开始时发送 `api_call_start` 事件
- [ ] 1.4 在流式响应过程中定期发送 `api_call_streaming` 事件
- [ ] 1.5 在请求完成时发送 `api_call_complete` 事件
- [ ] 1.6 在请求失败时发送 `api_call_error` 事件
- [ ] 1.7 脱敏处理 Authorization header

## 2. Frontend - Data Types
- [ ] 2.1 创建 `src/types/debug.ts` 定义调试数据类型
- [ ] 2.2 在 `useChatCompletion` 中添加 `apiCalls` 状态
- [ ] 2.3 监听所有调试事件并更新状态
- [ ] 2.4 实现 API 调用的状态合并逻辑

## 3. Frontend - DebugPanel Component
- [ ] 3.1 创建 `src/components/DebugPanel/index.tsx` 主组件
- [ ] 3.2 创建 `JsonViewer.tsx` JSON 格式化显示组件
- [ ] 3.3 创建 `ApiCallCard.tsx` 单个 API 调用卡片组件
- [ ] 3.4 实现 Request/Response/Timeline 标签切换
- [ ] 3.5 实现复制功能
- [ ] 3.6 实现状态指示器（pending/streaming/success/error）

## 4. Frontend - Integration
- [ ] 4.1 在 `View.tsx` 中替换现有 Debug 面板
- [ ] 4.2 导出 `useChatCompletion` 中的 `apiCalls` 状态
- [ ] 4.3 添加清除调试数据的功能

## 5. Polish & Testing
- [ ] 5.1 测试 Chat API 调用的完整生命周期显示
- [ ] 5.2 测试 Web Search 相关信息显示
- [ ] 5.3 测试错误场景的显示
- [ ] 5.4 测试大量 chunks 时的性能
- [ ] 5.5 优化 JSON 显示的性能（虚拟滚动）

