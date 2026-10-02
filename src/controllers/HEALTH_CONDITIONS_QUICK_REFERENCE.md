# Health Conditions API - Quick Reference

## 🚀 Quick Start

### Search & Filter
```bash
# Get all health conditions (limit: 50)
GET /health-conditions

# Search for specific condition
GET /health-conditions?search=diabetes

# Limit results
GET /health-conditions?limit=10

# Combine search and limit
GET /health-conditions?search=heart&limit=5
```

### Bulk Operations
```bash
# Add multiple conditions at once
POST /health-conditions/my-conditions/bulk
Content-Type: application/json

{
  "healthConditions": [
    {"healthConditionName": "Diabetes"},
    {"healthConditionName": "Hypertension"},
    {"healthConditionId": "existing-uuid"}
  ]
}
```

## 📋 All Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health-conditions` | Get all conditions (with search & limit) |
| GET | `/health-conditions/my-conditions` | Get user's conditions |
| POST | `/health-conditions/my-conditions` | Add single condition |
| POST | `/health-conditions/my-conditions/bulk` | Add multiple conditions |
| DELETE | `/health-conditions/my-conditions/:id` | Remove by condition ID |
| DELETE | `/health-conditions/my-conditions/record/:id` | Remove by record ID |

## 🔍 Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 50 | Max results to return |
| `search` | string | - | Search by name (case-insensitive) |

## 📝 Request Examples

### Single Add
```json
POST /health-conditions/my-conditions
{
  "healthConditionName": "Diabetes"
}
```

### Bulk Add
```json
POST /health-conditions/my-conditions/bulk
{
  "healthConditions": [
    {"healthConditionName": "Diabetes"},
    {"healthConditionName": "Hypertension"}
  ]
}
```

## ✅ Response Examples

### Search Response
```json
[
  {
    "id": "uuid",
    "name": "Type 2 Diabetes",
    "isActive": true,
    "createdAt": "2025-10-04T10:00:00.000Z",
    "updatedAt": "2025-10-04T10:00:00.000Z"
  }
]
```

### Bulk Add Response
```json
{
  "successCount": 2,
  "failedCount": 0,
  "created": [
    {
      "id": "user-condition-uuid",
      "userId": "user-uuid",
      "healthConditionId": "condition-uuid",
      "createdAt": "2025-10-04T10:00:00.000Z",
      "updatedAt": "2025-10-04T10:00:00.000Z"
    }
  ],
  "failed": []
}
```

## 🎯 Common Use Cases

### Autocomplete Search
```javascript
fetch(`/health-conditions?search=${userInput}&limit=10`)
  .then(res => res.json())
  .then(conditions => showDropdown(conditions));
```

### Bulk Import
```javascript
const conditions = ['Diabetes', 'Hypertension', 'Asthma'];
const body = {
  healthConditions: conditions.map(name => ({ healthConditionName: name }))
};

fetch('/health-conditions/my-conditions/bulk', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
});
```

## ⚡ Features

- ✅ Case-insensitive search
- ✅ Partial name matching
- ✅ Automatic condition creation
- ✅ Duplicate prevention
- ✅ Partial success support (bulk)
- ✅ Detailed error reporting
- ✅ Alphabetical sorting
- ✅ Active conditions only

## 📚 Documentation Files

- **HEALTH_CONDITIONS_BULK_API.md** - Bulk operations guide
- **HEALTH_CONDITIONS_SEARCH_FEATURE.md** - Search & limit details
- **HEALTH_CONDITIONS_UPDATE_SUMMARY.md** - Complete technical summary
- **HEALTH_CONDITIONS_QUICK_REFERENCE.md** - This file
