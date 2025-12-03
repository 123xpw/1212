# Voyage Backend Expansion Guide

Currently, this application runs entirely in the browser using `localStorage`. Here is how you can upgrade it to a full-stack application using Node.js or Django.

## 1. Data Modeling

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

## 2. API Endpoints

Create standard REST API endpoints.

*   `GET /api/v1/journeys` - List all journeys
*   `POST /api/v1/journeys` - Create journey
*   `DELETE /api/v1/journeys/:id` - Delete journey
*   `GET /api/v1/expenses` - Get expenses (support query params for filtering)
*   `GET /api/v1/expenses/stats` - Get aggregated stats for the chart (offload calculation to DB)

## 3. Frontend Integration

1.  **Remove** `services/storageService.ts`.
2.  **Create** `services/api.ts` using `axios` or `fetch`.
3.  **Update Views:** Instead of `useEffect(() => setJourneys(storageService.getJourneys()), [])`, use an async call:
    ```typescript
    useEffect(() => {
      api.get('/journeys').then(res => setJourneys(res.data));
    }, []);
    ```

## 4. Authentication

You will need to add a User model and authentication mechanism (JWT is recommended) so that users can log in and see their private data across devices.
