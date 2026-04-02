# 数据库配置与运行指南

## 📋 目录

- [数据库名称](#数据库名称)
- [环境配置](#环境配置)
- [MySQL 安装与配置](#mysql-安装与配置)
- [Redis 安装与配置](#redis-安装与配置)
- [Qdrant 安装与配置](#qdrant-安装与配置)
- [MinIO 安装与配置](#minio-安装与配置)
- [初始化数据库](#初始化数据库)
- [常见问题](#常见问题)

---

## 数据库名称

**主数据库名称**: `aiquality`

这是系统默认使用的 MySQL 数据库名称，可以在根目录的 `.env` 文件中修改。

---

## 环境配置

所有环境变量已统一配置在根目录的 `.env` 文件中：

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
REDIS_PASSWORD=
REDIS_DB=0

# Qdrant 配置
QDRANT_URL=http://127.0.0.1:6333

# MinIO 配置
MINIO_ENDPOINT=127.0.0.1
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=aiquality
```

---

## MySQL 安装与配置

### macOS (使用 Homebrew)

```bash
# 安装 MySQL
brew install mysql@8.0

# 启动 MySQL 服务
brew services start mysql@8.0

# 登录 MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE aiquality CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建用户并授权（可选）
CREATE USER 'aiquality'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON aiquality.* TO 'aiquality'@'localhost';
FLUSH PRIVILEGES;
```

### Docker 方式

```bash
docker run --name mysql-aiquality \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -e MYSQL_DATABASE=aiquality \
  -p 3306:3306 \
  -v mysql-data:/var/lib/mysql \
  -d mysql:8.0
```

---

## Redis 安装与配置

### macOS (使用 Homebrew)

```bash
# 安装 Redis
brew install redis

# 启动 Redis 服务
brew services start redis

# 测试连接
redis-cli ping
# 应返回：PONG
```

### Docker 方式

```bash
docker run --name redis-aiquality \
  -p 6379:6379 \
  -v redis-data:/data \
  -d redis:latest
```

---

## Qdrant 向量数据库安装与配置

### Docker 方式（推荐）

```bash
docker run --name qdrant-aiquality \
  -p 6333:6333 \
  -p 6334:6334 \
  -v qdrant-storage:/qdrant/storage \
  -d qdrant/qdrant:latest
```

访问管理界面：http://localhost:6333/dashboard

---

## MinIO 对象存储安装与配置

### Docker 方式

```bash
docker run --name minio-aiquality \
  -p 9000:9000 \
  -p 9001:9001 \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  -v minio-data:/data \
  -d minio/minio server /data --console-address ":9001"
```

访问管理界面：http://localhost:9001

---

## 初始化数据库

### 1. 使用 Prisma 迁移数据库

```bash
cd backend

# 安装依赖
npm install

# 应用 Prisma 迁移
npx prisma migrate deploy

# 生成 Prisma 客户端
npx prisma generate

# 初始化种子数据（可选）
node prisma/seed-permissions.js
```

### 2. 直接导入 SQL 文件

```bash
# 从项目根目录
mysql -u root -p aiquality < schema.sql

# 或从 backend 目录
cd backend
mysql -u root -p aiquality < ../schema.sql
```

---

## 使用 Docker Compose 一键启动所有服务（推荐）

创建 `docker-compose.yml` 文件：

```yaml
version: "3.8"

services:
  mysql:
    image: mysql:8.0
    container_name: mysql-aiquality
    environment:
      MYSQL_ROOT_PASSWORD: 123456
      MYSQL_DATABASE: aiquality
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  redis:
    image: redis:alpine
    container_name: redis-aiquality
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      timeout: 5s
      retries: 5

  qdrant:
    image: qdrant/qdrant:latest
    container_name: qdrant-aiquality
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant-storage:/qdrant/storage

  minio:
    image: minio/minio:latest
    container_name: minio-aiquality
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio-data:/data
    command: server /data --console-address ":9001"

volumes:
  mysql-data:
  redis-data:
  qdrant-storage:
  minio-data:
```

启动所有服务：

```bash
docker-compose up -d
```

停止所有服务：

```bash
docker-compose down
```

---

## 验证服务状态

```bash
# MySQL
mysql -u root -p123456 -e "SHOW DATABASES;"

# Redis
redis-cli ping

# Qdrant
curl http://localhost:6333/

# MinIO
curl http://localhost:9000/minio/health/live
```

---

## 常见问题

### 1. MySQL 连接失败

- 检查服务是否运行：`brew services list` 或 `docker ps`
- 确认端口是否被占用：`lsof -i :3306`
- 检查防火墙设置

### 2. Redis 连接失败

- 确保 Redis 服务已启动
- 检查是否有密码保护
- 验证端口 6379 是否可访问

### 3. 数据库权限问题

```sql
-- 重置权限
GRANT ALL PRIVILEGES ON aiquality.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Prisma 迁移错误

```bash
# 重置数据库
npx prisma migrate reset

# 重新生成迁移
npx prisma migrate dev --name init
```

---

## 下一步

完成数据库配置后，运行：

```bash
# 在项目根目录
npm run dev
```

这将同时启动前端和后端服务！🚀
