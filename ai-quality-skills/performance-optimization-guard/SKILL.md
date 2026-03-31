---
name: performance-optimization-guard
description: 客服质检系统专项性能优化 Skill。专注于检测异步处理、防抖节流及 Redis 缓存应用。适用于高频查询、大数据量采集、实时搜索等性能敏感场景。
---

# Performance Optimization Guard

本 Skill 旨在确保系统在高并发、大数据量场景下的流畅运行，提供专业的性能增强审计。

## 审计准则

### 1. 异步化与任务队列 (Asynchrony)
- **非阻塞 I/O**：检查所有数据库操作、第三方 API 调用是否正确使用 `async/await`。
- **后台任务**：对于耗时的 AI 质检、数据清洗、报表生成，建议移入后台队列或异步任务，避免阻塞主接口。

### 2. 前端防抖与节流 (Debounce & Throttle)
- **实时搜索**：聊天记录查询、标签名称检索等 `Input` 变化触发的请求，强制要求应用 **Debounce**（建议 300ms-500ms）。
- **高频点击**：提交表单、启动批量质检等按钮，强制要求应用 **Throttle** 或 `Loading` 锁定，防止重复提交。

### 3. Redis 缓存优化 (Redis Integration)
- **热点数据**：对于平台配置、部门树结构、计费规则等变动频率低但访问频繁的数据，建议应用 Redis 缓存。
- **接口限流**：检测敏感接口（如 AI 测试、短信/登录接口）是否需要基于 Redis 的频率控制。
- **状态存储**：检查 Socket 在线状态、任务进度等临时数据是否优先存储于 Redis 而非主库。

## 使用示例

> "我已经完成了聊天记录查询功能，请使用 performance-optimization-guard 进行性能审计。"

Gemini CLI 将会：
1. 检查前端 `ChatSearch` 组件是否对输入进行了防抖处理。
2. 检查后端 `findAllSessions` 接口是否可以对分页总数进行 Redis 缓存。
3. 检查向量检索过程是否为完全异步。
