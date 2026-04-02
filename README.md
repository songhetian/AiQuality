# AiQuality 客服质检系统

基于 AI 的智能客服质检系统，支持会话分析、标签管理、质量检查等功能。

## 🏗️ 技术栈

### 后端

- **框架**: NestJS
- **数据库**: MySQL + Prisma ORM
- **缓存**: Redis
- **向量数据库**: Qdrant
- **对象存储**: MinIO

### 前端

- **框架**: React 19 + Vite
- **UI 库**: Mantine UI
- **状态管理**: Zustand + React Query
- **路由**: React Router v7
- **图表**: ECharts

## 🚀 快速开始

### 方式一：Docker Compose（推荐）

```bash
# 1. 安装所有依赖
npm run install:all

# 2. 一键启动所有服务（MySQL + Redis + Qdrant + MinIO + 初始化数据库）
npm run services:up

# 3. 启动前后端开发服务器
npm run dev
```

**访问地址：**

- 🌐 前端：http://localhost:5173
- 🔌 后端 API：http://localhost:3000/api
- 📦 MinIO 控制台：http://localhost:9001 (minioadmin/minioadmin)
- 🎯 Qdrant 控制台：http://localhost:6333/dashboard

### 方式二：本地安装

详细步骤请查看 [QUICKSTART.md](./QUICKSTART.md)

## 📋 项目结构

```
AiQuality/
├── backend/              # NestJS 后端
│   ├── src/             # 源代码
│   ├── prisma/          # Prisma Schema 和迁移
│   └── .env             # 后端环境变量
├── frontend/            # React + Vite 前端
│   └── src/            # 源代码
├── .env                 # 统一环境变量
├── docker-compose.yml   # Docker Compose 配置
├── package.json         # 根目录脚本
├── DATABASE.md          # 详细数据库文档
└── QUICKSTART.md        # 快速开始指南
```

## 🎯 常用命令

### 开发相关

```bash
npm run dev              # 同时启动前后端
npm run dev:backend      # 只启动后端
npm run dev:frontend     # 只启动前端
npm run build            # 构建前后端
```

### 数据库相关

```bash
npm run db:up            # 启动所有 Docker 服务
npm run db:down          # 停止所有 Docker 服务
npm run db:restart       # 重启所有服务
npm run db:logs          # 查看服务日志
npm run db:init          # 初始化 Prisma 数据库
npm run db:reset         # 重置数据库
npm run services:up      # 启动服务并初始化（一键完成）
```

### 其他

```bash
npm run install:all      # 一次性安装所有依赖
npm run clean            # 清理所有 node_modules
```

## 📖 文档

- 📖 [快速开始指南](./QUICKSTART.md) - 详细的安装和启动说明
- 🗄️ [数据库配置文档](./DATABASE.md) - 数据库运行和维护指南
- 📋 [功能树](./dev-flow/SKILL.md) - 项目功能架构说明

## ⚙️ 环境配置

✅ **所有环境变量已统一到根目录的 `/.env` 文件**

```bash
# 数据库配置
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=aiquality

# Redis 配置
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# MinIO 配置
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

参考示例请查看 [.env.example](./.env.example)

详细说明请查看 [ENV-UNIFIED.md](./ENV-UNIFIED.md)

## 🔧 常见问题

### 数据库连接失败？

```bash
# 检查 MySQL 是否运行
docker ps | grep mysql
# 或
brew services list
```

### Prisma 迁移错误？

```bash
cd backend
npx prisma migrate reset
```

更多问题请查看 [QUICKSTART.md](./QUICKSTART.md#常见问题排查)

## 📝 功能特性

- ✅ 会话质检：自动分析客服会话内容
- ✅ 标签管理：灵活的标签系统和匹配规则
- ✅ 数据分析：多维度数据可视化展示
- ✅ 用户权限：完整的 RBAC 权限管理
- ✅ 对象存储：MinIO 文件存储集成
- ✅ 实时通信：WebSocket 实时通知

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
