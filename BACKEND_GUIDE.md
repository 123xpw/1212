
# Curio Travel 后端与数据库设计规范

基于现有的 `travel_platform` 数据库结构，以下是详细的字段设计和 API 接口规划。

## 1. 数据库模式设计 (Database Schema)

使用 MySQL (8.0+)

### `users` (用户表)
用于管理账户和鉴权。
```sql
CREATE TABLE `users`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

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


### `diaries` (旅行日记 / 我的旅程)
对应前端：**我的旅程 (Journeys)**
```sql
CREATE TABLE `travel_footprints`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NULL DEFAULT NULL,
  `location` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `date` date NULL DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `travel_footprints_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

```

### `expenses` (消费记录)
对应前端：**消费记录 (Expenses)**
```sql
CREATE TABLE `expenses`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NULL DEFAULT NULL,
  `item` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `amount` decimal(10, 2) NULL DEFAULT NULL,
  `date` date NULL DEFAULT NULL,
  `category` ENUM('交通', '住宿', '餐饮', '购物', '活动', '其他') DEFAULT '其他' COMMENT '类别：交通、住宿、餐饮、购物、活动、其他',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '备注',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `expenses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;
```

### `wishlist` (愿望清单)
对应前端：**愿望目的地 (Wishlist)**
```sql
-- 创建 wishlist 表（含新字段）
CREATE TABLE `wishlist`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NULL DEFAULT NULL,
  `place` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `plan_date` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '计划日期，如：明年夏天，2025年10月',
  `priority` ENUM('0', '25', '50', '75', '100') DEFAULT '50' COMMENT '想去程度优先级，只能选择0,25,50,75,100',
  `budget` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '预算规划，如：预计花费2万元/游玩7天',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;
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
