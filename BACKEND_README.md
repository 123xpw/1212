# Curio Travel 后端服务

这是一个基于 Node.js, Express 和 MySQL 的后端服务。

## 目录结构
*   `src/config`: 数据库配置
*   `src/controllers`: 业务逻辑 (包含审计日志集成)
*   `src/middleware`: 中间件 (如 Auth)
*   `src/routes`: 路由定义
*   `src/utils`: 工具函数 (如 auditLogger)

## 安装与运行

1.  **创建数据库**:
    请确保 MySQL 正在运行，并创建了 `travel_platform` 数据库，导入了 `init_data.sql`。

2.  **配置环境变量**:
    在 backend 目录下创建 `.env` 文件：
    ```
    PORT=3000
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_password
    DB_NAME=travel_platform
    JWT_SECRET=your_jwt_secret_key
    ```

3.  **安装依赖**:
    ```bash
    cd backend
    npm install
    ```

4.  **运行开发服务器**:
    ```bash
    npm run dev
    ```

## 关键功能说明

### 审计日志 (Audit Log)
我们在 `src/utils/auditLogger.ts` 中封装了通用的审计功能。
在 Controller 中调用 `logAudit` 即可。对于 `UPDATE` 和 `DELETE` 操作，我们先查询旧数据，以便记录 `old_value`，实现完整的数据变更追踪。

### 目的地标签 (Destination Tags)
在 `exploreController.ts` 中，我们使用了 SQL `GROUP_CONCAT` 和 `JOIN` 来高效地查询目的地及其关联的标签 (如 'Featured', 'Seasonal')。
