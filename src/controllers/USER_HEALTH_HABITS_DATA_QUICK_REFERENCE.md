# User Health Habits Data API - Quick Reference

## Base URL

`/api/v1/user-health-habits`

## Endpoints Summary

| Method | Endpoint          | Description                       | Auth Required |
| ------ | ----------------- | --------------------------------- | ------------- |
| GET    | `/`               | Get all user's health habits      | ✅            |
| GET    | `/favorites`      | Get user's favorite health habits | ✅            |
| GET    | `/:id`            | Get specific user health habit    | ✅            |
| GET    | `/data/history`   | Get user's health data history    | ✅            |
| GET    | `/data/favorites` | Get favorite health habits data   | ✅            |
| GET    | `/data/:id`       | Get specific health data entry    | ✅            |
| POST   | `/data`           | Create/fill new health data       | ✅            |
| GET    | `/stats/by-date`  | Get health habit statistics       | ✅            |

---

## Common Request Examples

### 1. List My Health Habits

```bash
GET /api/v1/user-health-habits
Authorization: Bearer <token>
```

### 2. View My Data History (All)

```bash
GET /api/v1/user-health-habits/data/history
Authorization: Bearer <token>
```

### 3. View My Data History (Specific Date)

```bash
GET /api/v1/user-health-habits/data/history?date=2025-01-15
Authorization: Bearer <token>
```

### 4. Fill New Health Data

```bash
POST /api/v1/user-health-habits/data
Authorization: Bearer <token>
Content-Type: application/json

{
  "healthHabitId": 1,
  "componentDefinitionId": "uuid",
  "date": "2025-01-15T08:00:00Z",
  "resultValue": "120/80",
  "numericResult": 120,
  "unitUsed": "mmHg",
  "contextNote": "Morning measurement"
}
```

### 5. Get Favorites

```bash
GET /api/v1/user-health-habits/favorites
Authorization: Bearer <token>
```

### 6. Get Statistics for Today

```bash
GET /api/v1/user-health-habits/stats/by-date
Authorization: Bearer <token>
```

---

## Request Body Fields (POST /data)

### Required Fields

- `healthHabitId` (number): Health habit ID
- `componentDefinitionId` (UUID): Component definition ID
- `date` (ISO 8601): Measurement date/time
- `resultValue` (string): Result value

### Optional Fields

- `numericResult` (number): Numeric value for calculations
- `unitUsed` (string): Unit of measurement
- `contextNote` (string): Additional notes
- `reportedAt` (ISO 8601): Report timestamp

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    /* response data */
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "error": "Error type"
}
```

---

## Common HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Auth required
- `404 Not Found` - Resource not found

---

## Date Format

Use ISO 8601 format:

- Full: `2025-01-15T08:00:00Z`
- Date only: `2025-01-15`

---

## Key Features

✅ Auto-authentication (user ID from JWT)  
✅ Data privacy (users can only access their own data)  
✅ Date filtering for history  
✅ Favorite habits tracking  
✅ Statistics and analytics  
✅ Flexible data entry with units and context notes
