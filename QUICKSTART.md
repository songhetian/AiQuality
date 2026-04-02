# 🚀 快速开始指南

## 📦 项目结构

```
AiQuality/
├── backend/          # NestJS 后端
├── frontend/         # React + Vite 前端
├── .env             # 统一环境变量（已创建）
├── docker-compose.yml # Docker Compose 配置（已创建）
├── package.json      # 根目录脚本（已创建）
└── DATABASE.md       # 详细数据库文档（已创建）
```

---

## ⚡ 快速启动（推荐方式）

### 方式一：使用 Docker Compose（最简单）

```bash
# 1. 克隆项目后，在项目根目录执行
npm run install:all

# 2. 一键启动所有服务（MySQL + Redis + Qdrant + MinIO）
npm run services:up

# 3. 启动前后端开发服务器
npm run dev
```

**访问地址：**

- 🔹 前端：http://localhost:5173
- 🔹 后端 API：http://localhost:3000
- 🔹 MinIO 控制台：http://localhost:9001 (账号密码：minioadmin)
- 🔹 Qdrant 控制台：http://localhost:6333/dashboard

---

### 方式二：本地安装服务

#### 1. 安装 MySQL

**macOS:**

```bash
brew install mysql@8.0
brew services start mysql@8.0
```

**其他系统：** 参考 [DATABASE.md](./DATABASE.md)

#### 2. 创建数据库

```bash
mysql -u root -p
CREATE DATABASE aiquality CHARACTER SET utf8mb4;
```

#### 3. 安装 Redis

```bash
# macOS
brew install redis
brew services start redis

# 验证
redis-cli ping  # 应返回 PONG
```

#### 4. 安装其他服务（可选）

```bash
# Qdrant (向量数据库)
docker run -d --name qdrant -p 6333:6333 -p 6334:6334 qdrant/qdrant

# MinIO (对象存储)
docker run -d --name minio -p 9000:9000 -p 9001:9001 \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  minio/minio server /data --console-address ":9001"
```

#### 5. 初始化数据库

```bash
cd backend
npm install
npx prisma migrate deploy
npx prisma generate
node prisma/seed-permissions.js
```

#### 6. 启动应用

```bash
# 回到项目根目录
cd ..
npm run dev
```

---

## 🎯 常用命令速查

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

---

## 📝 环境配置说明

### 修改数据库配置

编辑根目录的 `.env` 文件：

```bash
# 数据库配置
DB_HOST=127.0.0.1        # MySQL 主机地址
DB_PORT=3306            # MySQL 端口
DB_USER=root            # MySQL 用户名
DB_PASSWORD=123456      # MySQL 密码
DB_NAME=aiquality       # 数据库名称

# Redis 配置
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# MinIO 配置
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

### ⚠️ 重要提示

1. **修改配置后需要重启服务**
2. **生产环境请修改默认密码**
3. **`.env` 文件不会被提交到 Git**（已添加到 .gitignore）

---

## 🔧 常见问题排查

### 1. 数据库连接失败

```bash
# 检查 MySQL 是否运行
docker ps | grep mysql
# 或
brew services list

# 测试连接
mysql -u root -p123456 -h 127.0.0.1
```

### 2. Redis 连接失败

```bash
# 检查 Redis 是否运行
docker ps | grep redis
# 或
brew services list

# 测试连接
redis-cli ping
```

### 3. 端口被占用

```bash
# 查看端口占用
lsof -i :3000  # 后端端口
lsof -i :5173  # 前端端口
lsof -i :3306  # MySQL 端口
lsof -i :6379  # Redis 端口

# 杀死进程（谨慎使用）
kill -9 <PID>
```

### 4. Prisma 迁移错误

```bash
cd backend

# 方案 1: 重置数据库
npx prisma migrate reset

# 方案 2: 删除迁移记录重新生成
rm -rf prisma/migrations
npx prisma migrate dev --name init
```

### 5. Docker 服务启动失败

```bash
# 查看详细日志
docker-compose logs mysql
docker-compose logs redis
docker-compose logs qdrant
docker-compose logs minio

# 强制重建容器
docker-compose down -v
docker-compose up -d
```

---

## 📚 更多信息

- 📖 [完整数据库文档](./DATABASE.md)
- 🗄️ [数据库 Schema](./schema.sql)
- 📋 [项目功能树](./dev-flow/SKILL.md)

---

## ✅ 验证安装

运行以下命令检查所有服务是否正常：

```bash
# 检查 Docker 服务
docker ps

# 应该看到以下容器：
# - mysql-aiquality
# - redis-aiquality
# - qdrant-aiquality
# - minio-aiquality

# 测试 MySQL
docker exec mysql-aiquality mysql -u root -p123456 -e "SHOW DATABASES;"

# 测试 Redis
docker exec redis-aiquality redis-cli ping

# 测试 Qdrant
curl http://localhost:6333/

# 测试 MinIO
curl http://localhost:9000/minio/health/live
```

---

## 🎉 完成！

如果所有检查都通过，你现在可以：

1. 访问前端：http://localhost:5173
2. 访问后端 API：http://localhost:3000/api
3. 开始开发新功能！

遇到问题？查看 [DATABASE.md](./DATABASE.md) 获取更多详细信息。
