# Curio Travel 后端扩展指南

目前，本应用程序完全在浏览器中使用 `localStorage` 运行。以下是将升级为使用 Node.js 或 Django 的全栈应用程序的指南。

## 1. 数据建模 (Data Modeling)

**Node.js (Mongoose/MongoDB):**
```javascript
const JourneySchema = new Schema({
  userId: { type: ObjectId, ref: 'User' },
  location: String,
  date: Date,
  description: String,
  imageUrl: String
});
```

**Django (Models):**
```python
class Journey(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    location = models.CharField(max_length=200)
    date = models.DateField()
    description = models.TextField()
    image = models.ImageField(upload_to='journeys/')
```

## 2. API 端点 (API Endpoints)

创建标准的 REST API 端点。

*   `GET /api/v1/journeys` - 获取所有旅程
*   `POST /api/v1/journeys` - 创建新旅程
*   `DELETE /api/v1/journeys/:id` - 删除旅程
*   `GET /api/v1/expenses` - 获取消费记录 (支持筛选)
*   `GET /api/v1/expenses/stats` - 获取图表统计数据 (建议在后端计算)

## 3. 前端集成 (Frontend Integration)

1.  **移除** `services/storageService.ts`。
2.  **创建** `services/api.ts` 使用 `axios` 或 `fetch`。
3.  **更新视图 (Views):** 不再直接读取 storage，而是使用异步调用：
    ```typescript
    useEffect(() => {
      api.get('/journeys').then(res => setJourneys(res.data));
    }, []);
    ```

## 4. 用户认证 (Authentication)

你需要添加用户模型和认证机制（推荐 JWT），以便用户可以在不同设备上登录并查看自己的私有数据。