# 🐳 AiQuality Docker 运维与开发指南

本文档旨在帮助开发人员快速上手本项目，并解决常见的环境冲突和数据库运维问题。

---

## 🚀 1. 快速开始 (两种模式)

### 模式 A：本地极速开发 (推荐)
**场景：** 编写代码、调试 UI，需要热更新。
*   **服务状态：** 数据库/Redis 在 Docker 中运行，前端/后端在本地宿主机运行。
*   **一键启动：**
    ```bash
    npm run dev:all
    ```
*   **访问地址：** 前端 `http://localhost:5173` | 后端 `http://localhost:3000`

### 模式 B：全量容器化部署 (生产/演示)
**场景：** 模拟线上环境、给他人演示、性能测试。
*   **服务状态：** 所有组件（包含 Nginx、前后端、数据库）全部在 Docker 容器内。
*   **一键部署：**
    ```bash
    npm run docker:build
    ```
*   **访问地址：** 统一入口 `http://localhost` (80 端口)

---

## 🗄️ 2. 数据库运维

### 端口映射说明
由于宿主机可能已安装 MySQL 和 Redis (3306/6379 端口)，本项目的 Docker 外部端口统一映射为：
*   **MySQL (Docker):** `127.0.0.1:3307`
*   **Redis (Docker):** `127.0.0.1:6380`
*   **MySQL 用户名/密码:** `root` / `123456`
*   **Redis 密码:** (无)


### 如何重置数据库？
如果您想清空当前数据并重新加载 `schema.sql` 初始结构：
1.  **停止并清理数据卷：**
    ```bash
    docker-compose down -v
    ```
2.  **重新启动：**
    ```bash
    npm run docker:infra
    ```

### 如何手动导入 SQL？
如果您在容器运行期间修改了 `schema.sql` 并想立即同步：
```bash
npm run db:import
```

---

## 🛠️ 3. 核心命令汇总 (package.json)

| 命令 | 场景描述 |
| :--- | :--- |
| `npm run dev:all` | **[最常用]** 启动数据库并开启前后端本地开发。 |
| `npm run db:init` | **[初次必行]** 生成 Prisma 客户端，否则后端会报错。 |
| `npm run docker:build` | 代码更新后，重新构建并启动全量容器镜像。 |
| `npm run docker:logs` | 实时查看所有容器的输出日志。 |
| `npm run docker:down` | 停止并移除所有容器。 |

---

## 🆘 4. 常见问题排查 (Troubleshooting)

### Q1: 提示端口 3306/3307 被占用？
*   **检查：** 是否有其他 Docker 项目或本地 MySQL 在运行。
*   **解决：** 运行 `lsof -i:3307` 查看占用进程，或者在 `.env` 中修改 `DB_PORT`。

### Q2: 后端报错 "Cannot find module '@prisma/client'"？
*   **原因：** 未执行 Prisma 生成。
*   **解决：** 运行 `npm run db:init`。

### Q3: 修改了 .env 文件，Docker 没生效？
*   **解决：** 修改 `.env` 后，必须执行 `npm run docker:build` 重建容器才能加载新配置。

---

## 📁 5. 项目结构图
```text
AiQuality/
├── .env                # ✅ 全局唯一配置文件
├── docker-compose.yml  # ✅ 容器编排定义
├── nginx.conf          # ✅ 生产环境入口配置
├── schema.sql          # ✅ 数据库初始结构
├── backend/            # ✅ 后端 NestJS (Dockerfile 在此)
└── frontend/           # ✅ 前端 Vite (Dockerfile 在此)
```
