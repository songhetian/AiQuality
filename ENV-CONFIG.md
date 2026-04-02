# 环境变量配置指南

## 📌 当前状态（重要！）

### ✅ 正在使用的配置

| 位置             | 状态            | 作用                                |
| ---------------- | --------------- | ----------------------------------- |
| `/backend/.env`  | ✅ **使用中**   | NestJS 自动读取，后端实际使用此文件 |
| `/frontend/.env` | ❌ 不存在       | 前端目前不使用环境变量              |
| `/.env`          | ⚠️ **仅作文档** | 统一配置参考，但**不会自动生效**    |

---

## 🎯 推荐方案（两种选择）

### 方案一：保持现状（简单）✨ 推荐新手

**保留现有结构：**

- ✅ `/backend/.env` - 后端继续使用
- ✅ `/.env` - 作为统一配置的参考文档
- ❌ 不需要修改任何代码

**如何工作：**

1. 修改 `/.env` 中的配置
2. 同步复制到 `/backend/.env`
3. 重启后端服务即可

**优点：**

- 不需要修改代码
- 前后端配置独立，职责清晰
- 符合 NestJS 默认约定

**缺点：**

- 需要在两个地方维护相同的配置

---

### 方案二：统一到根目录（进阶）🚀

**只保留根目录的 `/.env`**，然后让后端也读取它。

#### 步骤 1: 修改后端启动脚本

编辑 `/backend/package.json`，在 `start:dev` 命令前加载根目录的 `.env`：

```json
{
  "scripts": {
    "start:dev": "node -r dotenv/config dist/main.js dotenv_config_path=../.env"
  }
}
```

或者使用 `cross-env` 包来跨平台支持。

#### 步骤 2: 修改 Prisma 配置

编辑 `/backend/prisma.config.ts`，指向根目录的 `.env`：

```typescript
import dotenv from "dotenv";
import path from "path";

// 加载根目录的 .env
dotenv.config({ path: path.resolve(__dirname, "../.env") });
```

#### 步骤 3: 删除 `/backend/.env`

确保所有服务都从根目录读取配置。

**优点：**

- 配置完全统一
- 只需要维护一个 `.env` 文件

**缺点：**

- 需要修改启动脚本
- 可能破坏现有的开发流程

---

## 💡 我的建议

### 对于这个项目：**使用方案一（保持现状）**

**理由：**

1. ✅ **NestJS 默认行为**：`ConfigModule.forRoot()` 会自动读取 `backend/.env`
2. ✅ **无需修改代码**：现在就能正常工作
3. ✅ **职责分离**：前后端配置独立，互不干扰
4. ✅ **安全性**：每个子项目可以有自己的敏感配置

### 实际操作方法

把根目录的 `/.env` 作为**主配置文件**和**文档**：

```bash
# 1. 首次配置时
cp /.env /backend/.env

# 2. 修改数据库密码等配置时
#   a. 在 /.env 中修改（作为记录）
#   b. 复制到 /backend/.env
#   c. 重启后端服务
```

---

## 🔧 技术细节说明

### 为什么 NestJS 读取的是 `/backend/.env`？

NestJS 的 `ConfigModule` 使用 `dotenv` 包，默认查找路径是：

```
项目根目录/.env
```

对于后端项目来说，"项目根目录" 就是 `/backend/`，所以它会读取 `/backend/.env`。

### 代码示例

```typescript
// backend/src/app.module.ts
ConfigModule.forRoot({ isGlobal: true });
// ↑ 这行代码会让 ConfigModule 自动加载 /backend/.env

// backend/src/main.ts
const port = process.env.PORT;
// ↑ 这个 process.env 来自 /backend/.env
```

---

## 📝 最佳实践

### 1. 使用根目录 `/.env` 作为模板

```bash
# 新成员加入项目时
cp /.env /backend/.env
cp /.env /frontend/.env.local  # 如果前端需要
```

### 2. 保持同步

当修改数据库配置时：

```bash
# 在 /.env 中修改（作为主记录）
DB_PASSWORD=newpassword

# 然后复制到 backend/.env
cp /.env /backend/.env

# 重启服务
npm run db:restart
```

### 3. 使用 Git 管理

```bash
# .gitignore 已经配置
.env              # 忽略根目录 .env
backend/.env      # 忽略后端 .env
frontend/.env*    # 忽略前端 .env 相关文件
```

提交 `.env.example` 作为模板。

---

## 🤔 常见问题

### Q1: 我可以直接删除 `/backend/.env` 吗？

**不可以！** 除非你已经配置好让后端读取根目录的 `.env`。

### Q2: 前端需要 `.env` 吗？

**目前不需要。** 前端使用相对路径 `/api` 访问后端，通过 Vite 代理转发。

### Q3: 如果要添加新的环境变量怎么办？

1. 在 `/.env` 中添加（作为主记录）
2. 复制到 `/backend/.env`
3. 更新 `/.env.example` 作为示例

### Q4: Docker Compose 使用哪个 `.env`？

Docker Compose 默认读取**当前目录下**的 `.env` 文件。

运行 `docker-compose up` 时：

- 在根目录执行 → 读取 `/.env`
- 在 backend 目录执行 → 读取 `/backend/.env`

**建议：** 始终在根目录运行 `docker-compose` 命令。

---

## 🎉 总结

**当前配置（推荐保持）：**

```
/.env              ← 主配置文件 + 文档（手动维护）
/backend/.env      ← 后端实际使用（从 /.env 复制）
/frontend/.env     ← 不需要
```

**快速同步命令：**

```bash
# 同步配置到后端
cp /.env /backend/.env

# 重启服务
npm run db:restart
npm run dev
```

这样既保持了配置的集中管理，又符合各个框架的默认约定！✅
