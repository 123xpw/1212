
# Curio Travel 后端与数据库设计规范

基于现有的 `travel_platform` 数据库结构，以下是详细的字段设计和 API 接口规划。

## 1. 数据库模式设计 (Database Schema)


## 1. 核心业务表
1. Users
CREATE TABLE users (
    user_id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

2. Travel Footprints
CREATE TABLE travel_footprints (
    travel_footprint_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,

    location VARCHAR(200) NOT NULL,
    date DATE NOT NULL,
    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (travel_footprint_id),

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

3. Wishlist
CREATE TABLE wishlist (
    wishlist_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,

    location VARCHAR(200) NOT NULL,
    reason TEXT,
    planned_date VARCHAR(100),
    priority TINYINT DEFAULT 50,
    budget VARCHAR(200),
    status ENUM('Pending', 'Realized') DEFAULT 'Pending',

    destination_id BIGINT,         -- optional foreign key
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (wishlist_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    -- destination_id intentionally not constrained to allow flexible linking
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

4. Expenses
CREATE TABLE expenses (
    expense_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,

    location VARCHAR(200) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    category ENUM('交通','住宿','餐饮','购物','活动','其他') NOT NULL DEFAULT '其他',
    note TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (expense_id),

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

5. Destinations
CREATE TABLE destinations (
    destination_id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    description TEXT,
    recommended_reason TEXT,
    best_season VARCHAR(100),
    budget_level ENUM('Low','Medium','High','Luxury'),
    image_url VARCHAR(500),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (destination_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

6. Destination Tags
CREATE TABLE destination_tags (
    destination_id BIGINT NOT NULL,
    tag_name VARCHAR(50) NOT NULL,

    PRIMARY KEY (destination_id, tag_name),
    FOREIGN KEY (destination_id) REFERENCES destinations(destination_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

7. Audit Log
CREATE TABLE audit_log (
    audit_id BIGINT NOT NULL AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(50) NOT NULL,
    target_table VARCHAR(50) NOT NULL,
    target_id INT,
    old_value JSON,
    new_value JSON,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (audit_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


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
