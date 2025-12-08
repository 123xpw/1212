
# Curio Travel 后端与数据库设计规范

基于现有的 `travel_platform` 数据库结构，以下是详细的字段设计和 API 接口规划。

## 1. 数据库模式设计 (Database Schema)

推荐使用 MySQL (8.0+) 或 PostgreSQL。

### `users` (用户表)
用于管理账户和鉴权。
```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### `destinations` (公共目的地库)
**对应前端：探索发现 (Explore)**
这是一个**系统级公共表**，存储全球热门旅行地的信息。
*作用*：为用户提供标准化的地点数据，支持按季节、预算和标签筛选。

```sql
CREATE TABLE destinations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,           -- 地点名称 (如: 京都)
    country VARCHAR(100) NOT NULL,        -- 所属国家/地区 (如: 日本) [新增]
    description TEXT,                     -- 详细简介
    recommended_reason TEXT,              -- 推荐理由 (如: 体验极致的东方美学...) [新增]
    
    best_season VARCHAR(100),             -- 最佳季节描述 (如: 春季或秋季)
    budget_level ENUM('Low', 'Medium', 'High', 'Luxury'), -- 预算等级
    
    image_url VARCHAR(500),               -- 封面图链接
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `destination_tags` (目的地分类标签)
**核心表：支撑“精选”、“季节”、“性价比”三大分类**
使用多对多关联设计，一个地点可以同时属于“精选”和“季节推荐”。
```sql
CREATE TABLE destination_tags (
    destination_id BIGINT NOT NULL,
    tag_name VARCHAR(50) NOT NULL, -- 枚举值: 'Featured', 'Seasonal', 'Value'
    PRIMARY KEY (destination_id, tag_name),
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
);
```
*查询示例：查询所有“高性价比”的目的地*
`SELECT * FROM destinations d JOIN destination_tags t ON d.id = t.destination_id WHERE t.tag_name = 'Value';`

### `destination_reviews` (目的地评价 - 扩展)
**为“探索发现”模块增加社区价值**
允许用户对公共目的地进行评分，帮助其他用户决策。
```sql
CREATE TABLE destination_reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    destination_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    rating TINYINT NOT NULL, -- 1-5分
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (destination_id) REFERENCES destinations(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### `diaries` (旅行日记 / 我的旅程)
对应前端：**我的旅程 (Journeys)**
```sql
CREATE TABLE diaries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    location VARCHAR(100) NOT NULL, -- 地点
    travel_date DATE NOT NULL,      -- 日期
    description TEXT,               -- 旅程描述
    -- image_url VARCHAR(255),      -- (前端已移除图片功能，数据库可保留以备未来使用)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### `expenses` (消费记录)
对应前端：**消费记录 (Expenses)**
```sql
CREATE TABLE expenses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    diary_id BIGINT,                -- 可选：关联到具体的某次旅程
    location VARCHAR(100) NOT NULL, -- 消费地点/商家
    amount DECIMAL(10, 2) NOT NULL, -- 金额
    category ENUM('Transport', 'Accommodation', 'Food', 'Shopping', 'Activities', 'Other') NOT NULL,
    expense_date DATE NOT NULL,
    note VARCHAR(255),              -- 备注 (如: 给同事买礼物) [新增]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (diary_id) REFERENCES diaries(id) ON DELETE SET NULL
);
```

### `wishlist` (愿望清单)
对应前端：**愿望目的地 (Wishlist)**
```sql
CREATE TABLE wishlist (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    
    -- 核心字段
    location VARCHAR(100) NOT NULL,
    destination_id BIGINT,          -- 关联公共库 (可选)，如果是从【探索发现】加入的，则记录此ID
    
    planned_date VARCHAR(50),       -- 计划日期
    reason TEXT,                    -- 理由
    priority TINYINT DEFAULT 50,    -- 优先级：0, 25, 50, 75, 100
    -- budget_note VARCHAR(255),    -- (前端已移除此字段，移至消费记录)
    
    status ENUM('Pending', 'Realized') DEFAULT 'Pending', -- 状态：未实现/已实现
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL
);
```

### `audit_log` (审计日志)
用于安全审计和操作记录。
```sql
CREATE TABLE audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(50) NOT NULL,      -- 例如: "DELETE_DIARY", "LOGIN"
    target_table VARCHAR(50),         -- 例如: "diaries"
    target_id BIGINT,                 -- 受影响的记录ID
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 2. API 接口规范 (RESTful)

后端需要提供以下 JSON 接口供前端调用。

### 认证 (Auth)
*   `POST /api/auth/register` - 注册
*   `POST /api/auth/login` - 登录 (返回 JWT Token)
*   `GET /api/auth/me` - 获取当前用户信息

### 探索发现 (Explore)
*   `GET /api/destinations` - 获取公共目的地列表
    *   *Query Params*: `?tag=Seasonal` (按标签筛选), `?country=Japan` (按国家筛选)
*   `GET /api/destinations/:id` - 获取详情

### 我的旅程 (Journeys / Diaries)
*   `GET /api/diaries` - 获取当前用户所有旅程
*   `POST /api/diaries` - 创建新旅程
*   `DELETE /api/diaries/:id` - 删除旅程

### 消费记录 (Expenses)
*   `GET /api/expenses` - 获取消费列表
*   `GET /api/expenses/stats` - 获取统计数据
*   `POST /api/expenses` - 新增消费 (包含 note 字段)
*   `DELETE /api/expenses/:id` - 删除消费

### 愿望清单 (Wishlist)
*   `GET /api/wishlist` - 获取清单
*   `POST /api/wishlist` - 新增愿望
*   `POST /api/wishlist/:id/realize` - 标记为已实现
