---
name: logic-optimization-guard
description: 客服质检系统专项质量保障 Skill。重点审计：部门级 Qdrant 隔离、RBAC 权限覆盖、AI 质检协同逻辑、以及 UI 组件库标准化。
---

# Logic Optimization Guard

本 Skill 旨在确保每个功能模块开发均符合 PRD 要求，且 UI 遵循统一的组件化规范。

## 审计工作流

### 1. UI 组件标准化 (UI Consistency)
- **强制性要求**：严禁在页面内直接编写 `Title`、`Breadcrumbs` 等裸组件。必须统一调用 `src/components/ui` 下的 `PageHeader`。
- **图表规范**：所有 ECharts 必须通过 `BaseChart` 渲染，且 `option` 必须符合“浅绿色”视觉体系。
- **状态反馈**：所有异步操作必须配套 `LoadingOverlay` 或 `notifications` 提醒。

### 2. 核心架构审计 (Architecture Security)
- **Qdrant 隔离**：检查 `ChatService` 路由逻辑，确保集合名称严格绑定 `deptId`。
- **关联检查**：删除操作必须实现“全量业务引用校验”。

### 3. 性能加固
- **高频输入**：搜索框必须配备 500ms 以上的 Debounce。
- **Socket 监听**：事件回调必须在 `useEffect` 清理函数中正确解绑。
