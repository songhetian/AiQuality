# 环境变量统一配置说明

## ✅ 已完成的配置

所有环境变量现已**统一到根目录的 `/.env` 文件**中！

### 📁 文件结构

```
AiQuality/
├── .env                  # ✅ 主配置文件（所有服务共用）
├── .env.example          # ✅ 示例模板
├── backend/
│   ├── .envrc            # ✅ direnv 配置（可选，用于 IDE 支持）
│   └── .gitignore        # ✅ 已添加 .env 忽略规则
└── frontend/
    └── (不需要 .env)     # ✅ 前端不使用环境变量
```

---

## 🔧 技术实现

### 后端（NestJS）

已安装并配置 `dotenv` 包，修改了以下文件：

1. **`backend/package.json`**
   - 添加了 `dotenv` 依赖
   - 修改了启动脚本，从根目录读取 `.env`

2. **`backend/src/main.ts`**

   ```typescript
   import * as dotenv from "dotenv";
   import * as path from "path";

   // 加载根目录的 .env 文件
   dotenv.config({
     path: path.resolve(__dirname, "../../.env"),
   });
   ```

3. **`backend/prisma.config.ts`**

   ```typescript
   // 加载根目录的 .env 文件
   if (process.env.NODE_ENV !== "production") {
     require("dotenv").config({
       path: path.resolve(__dirname, "../.env"),
     });
   }
   ```

4. **`backend/.envrc`**（可选）
   - 用于 direnv 工具自动加载环境变量
   - 需要安装：`brew install direnv`

---

## 🎯 如何使用

### 修改配置

现在只需要修改根目录的 `/.env` 文件：

```bash
# 编辑配置文件
vim .env

# 或
code .env
```

### 重启服务

修改配置后，重启后端服务：

```bash
# 如果使用 Docker Compose
npm run db:restart

# 如果只重启后端
npm run dev:backend
```

---

## 📝 配置项说明

### 数据库配置

```bash
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=aiquality
DATABASE_URL="mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
```

### Redis 配置

```bash
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### MinIO 配置

```bash
MINIO_ENDPOINT=127.0.0.1
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=aiquality
```

### Qdrant 配置

```bash
QDRANT_URL="http://127.0.0.1:6333"
```

### 前端配置

```bash
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
```

---

## 🚀 快速开始

### 方式一：Docker Compose（推荐）

```bash
# 1. 一键启动所有服务
npm run services:up

# 2. 启动前后端开发服务器
npm run dev
```

### 方式二：手动启动

```bash
# 1. 启动数据库容器
npm run db:up

# 2. 初始化数据库
npm run db:init

# 3. 启动前后端
npm run dev
```

---

## ⚠️ 注意事项

### 1. Git 提交

- ✅ `/backend/.env` 已被添加到 `.gitignore`
- ✅ 根目录的 `/.env` 也被忽略
- ✅ 只有 `/.env.example` 会被提交

### 2. 新成员加入

新克隆项目的成员需要：

```bash
# 复制示例配置
cp .env.example .env

# 修改为自己的配置
vim .env

# 安装依赖
npm run install:all

# 启动服务
npm run services:up
```

### 3. 生产环境

生产环境部署时：

1. 使用环境变量注入（如 Docker、K8s ConfigMap）
2. 或使用单独的 `.env.production` 文件
3. 不要将敏感信息提交到 Git

---

## 🔍 验证配置

### 检查环境变量是否生效

```bash
# 在后端目录测试
cd backend
node -e "require('dotenv').config({path: '../.env'}); console.log(process.env.DB_NAME)"
# 应输出：aiquality
```

### 检查 Prisma 配置

```bash
cd backend
npx prisma generate
# 应该能正确读取 DATABASE_URL
```

### 检查后端启动

```bash
npm run dev:backend
# 查看日志，确认能正确连接数据库和 Redis
```

---

## 🆘 故障排查

### 问题 1：后端无法启动

**症状：** 报错找不到环境变量

**解决：**

```bash
# 检查 .env 文件是否存在
ls -la .env

# 检查 dotenv 是否正确安装
cd backend
npm list dotenv

# 重新安装依赖
npm install
```

### 问题 2：Prisma 无法连接数据库

**症状：** Prisma 命令报错 DATABASE_URL 未定义

**解决：**

```bash
# 手动指定 .env 文件
cd backend
DOTENV_CONFIG_PATH=../.env npx prisma generate

# 或直接在命令行设置
DATABASE_URL="mysql://..." npx prisma generate
```

### 问题 3：Docker Compose 无法读取变量

**症状：** 容器启动失败，提示缺少环境变量

**解决：**

```bash
# 确保在根目录执行
cd /Users/song/Projects/AiQuality
docker-compose up -d

# 或者显式指定 env-file
docker-compose --env-file .env up -d
```

---

## 📚 相关文档

- [QUICKSTART.md](./QUICKSTART.md) - 快速开始指南
- [DATABASE.md](./DATABASE.md) - 数据库详细配置
- [ENV-CONFIG.md](./ENV-CONFIG.md) - 原环境变量配置说明（已过时）

---

## ✨ 总结

✅ **现在你只需要维护一个 `/.env` 文件！**

- 后端自动从根目录读取配置
- Prisma 自动从根目录读取配置
- Docker Compose 自动从根目录读取配置
- 前端不需要环境变量

🎉 配置管理更加简单和统一了！
