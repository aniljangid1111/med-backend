# User Health Habits Data API Documentation

## Overview

This API provides endpoints for users to manage their health habits and fill in their health data. All endpoints are **authenticated** - users can only access and create their own data.

**Base Path**: `/api/v1/user-health-habits`

---

## Endpoints

### 1. Get User's Health Habits

Get all health habits assigned to the authenticated user, including test components and lab unit references.

**Endpoint**: `GET /api/v1/user-health-habits`

**Authentication**: Required

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "healthHabitId": "123",
      "isFavorite": true,
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z",
      "healthHabit": {
        "id": 123,
        "name": "Blood Pressure",
        "description": "Monitor blood pressure levels",
        "icon": "blood-pressure-icon.svg",
        "bgImage": "bg.jpg",
        "color": "#FF5733",
        "isActive": true,
        "type": "health",
        "components": [
          {
            "id": "component-uuid",
            "componentName": "Systolic Pressure",
            "resultType": "QUANTITATIVE",
            "calculationFormula": null,
            "normalRangeText": "90-120 mmHg",
            "contextFactors": "At rest",
            "labTestId": 123,
            "unitReferences": [
              {
                "id": "unit-ref-uuid",
                "unit": "mmHg",
                "normalRangeMin": 90,
                "normalRangeMax": 120,
                "conversionFactor": null,
                "componentId": "component-uuid"
              }
            ]
          },
          {
            "id": "component-uuid-2",
            "componentName": "Diastolic Pressure",
            "resultType": "QUANTITATIVE",
            "calculationFormula": null,
            "normalRangeText": "60-80 mmHg",
            "contextFactors": "At rest",
            "labTestId": 123,
            "unitReferences": [
              {
                "id": "unit-ref-uuid-2",
                "unit": "mmHg",
                "normalRangeMin": 60,
                "normalRangeMax": 80,
                "conversionFactor": null,
                "componentId": "component-uuid-2"
              }
            ]
          }
        ]
      }
    }
  ]
}
```

---

### 2. Get User's Favorite Health Habits

Get user's favorite health habits, optionally filtered by date.

**Endpoint**: `GET /api/v1/user-health-habits/favorites`

**Authentication**: Required

**Query Parameters**:

- `date` (optional): ISO 8601 date string (e.g., "2025-01-15")

**Example Request**:

```
GET /api/v1/user-health-habits/favorites?date=2025-01-15
```

**Response**: Same structure as endpoint #1, filtered by favorites.

---

### 3. Get Specific User Health Habit

Get details of a specific user health habit by ID.

**Endpoint**: `GET /api/v1/user-health-habits/:id`

**Authentication**: Required

**Path Parameters**:

- `id`: UUID of the user health habit

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "user-uuid",
    "healthHabitId": "123",
    "isFavorite": true,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z",
    "user": {
      "id": "user-uuid",
      "email": "user@example.com"
    },
    "healthHabit": {
      "id": 123,
      "name": "Blood Pressure"
    }
  }
}
```

**Error Responses**:

- `400 Bad Request`: If the health habit doesn't belong to the user
- `404 Not Found`: If the health habit doesn't exist

---

### 4. Get Health Habit Data History

Get user's filled health habit data, optionally filtered by date.

**Endpoint**: `GET /api/v1/user-health-habits/data/history`

**Authentication**: Required

**Query Parameters**:

- `date` (optional): ISO 8601 date string (e.g., "2025-01-15") - returns all entries for that specific day

**Example Request**:

```
GET /api/v1/user-health-habits/data/history?date=2025-01-15
```

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "data-uuid",
      "healthHabitId": 123,
      "userId": "user-uuid",
      "date": "2025-01-15T08:30:00Z",
      "resultValue": "120/80",
      "numericResult": 120,
      "unitUsed": "mmHg",
      "contextNote": "Measured after morning walk",
      "reportedAt": "2025-01-15T08:35:00Z",
      "componentDefinitionId": "component-uuid",
      "createdAt": "2025-01-15T08:35:00Z",
      "updatedAt": "2025-01-15T08:35:00Z",
      "healthHabit": {
        "id": 123,
        "name": "Blood Pressure",
        "description": "Monitor blood pressure levels",
        "type": "health",
        "isActive": true,
        "components": [
          {
            "id": "component-uuid",
            "componentName": "Systolic Pressure",
            "resultType": "QUANTITATIVE",
            "normalRangeText": "90-120 mmHg",
            "contextFactors": "At rest",
            "labTestId": 123,
            "unitReferences": [
              {
                "id": "unit-ref-uuid",
                "unit": "mmHg",
                "normalRangeMin": 90,
                "normalRangeMax": 120,
                "conversionFactor": null,
                "componentId": "component-uuid"
              }
            ]
          }
        ]
      },
      "componentDefinition": {
        "id": "component-uuid",
        "componentName": "Systolic Pressure",
        "resultType": "QUANTITATIVE",
        "normalRangeText": "90-120 mmHg",
        "contextFactors": "At rest",
        "labTestId": 123,
        "unitReferences": [
          {
            "id": "unit-ref-uuid",
            "unit": "mmHg",
            "normalRangeMin": 90,
            "normalRangeMax": 120,
            "conversionFactor": null,
            "componentId": "component-uuid"
          }
        ]
      },
      "user": {
        "id": "user-uuid",
        "email": "user@example.com"
      }
    }
  ]
}
```

---

### 5. Get Favorite Health Habit Data

Get health habit data for user's favorite habits.

**Endpoint**: `GET /api/v1/user-health-habits/data/favorites`

**Authentication**: Required

**Response**: Same structure as endpoint #4, filtered by favorite habits.

---

### 6. Get Specific Health Habit Data Entry

Get details of a specific health habit data entry by ID.

**Endpoint**: `GET /api/v1/user-health-habits/data/:id`

**Authentication**: Required

**Path Parameters**:

- `id`: UUID of the health habit data entry

**Response**: Same structure as a single item in endpoint #4.

**Error Responses**:

- `400 Bad Request`: If the data doesn't belong to the user
- `404 Not Found`: If the data entry doesn't exist

---

### 7. Create Health Habit Data (Fill Data)

Create a new health habit data entry for the authenticated user.

**Endpoint**: `POST /api/v1/user-health-habits/data`

**Authentication**: Required

**Request Body**:

```json
{
  "healthHabitId": 123,
  "componentDefinitionId": "component-uuid",
  "date": "2025-01-15T08:30:00Z",
  "resultValue": "120/80",
  "numericResult": 120,
  "unitUsed": "mmHg",
  "contextNote": "Measured after morning walk",
  "reportedAt": "2025-01-15T08:35:00Z"
}
```

**Field Descriptions**:

- `healthHabitId` (required, number): ID of the health habit
- `componentDefinitionId` (required, UUID): ID of the test component definition
- `date` (required, ISO 8601 string): Date/time when the measurement was taken
- `resultValue` (required, string): The actual result value (can be text or numeric)
- `numericResult` (optional, number): Numeric representation of the result for calculations
- `unitUsed` (optional, string, max 50 chars): Unit of measurement (e.g., "mmHg", "mg/dL")
- `contextNote` (optional, string): Additional notes or context about this measurement
- `reportedAt` (optional, ISO 8601 string): When the result was reported (defaults to current time)

**Note**: The `userId` field is automatically set to the authenticated user. If provided in the request body, it must match the authenticated user's ID.

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "new-data-uuid",
    "healthHabitId": 123,
    "userId": "user-uuid",
    "date": "2025-01-15T08:30:00Z",
    "resultValue": "120/80",
    "numericResult": 120,
    "unitUsed": "mmHg",
    "contextNote": "Measured after morning walk",
    "reportedAt": "2025-01-15T08:35:00Z",
    "componentDefinitionId": "component-uuid",
    "createdAt": "2025-01-15T08:35:00Z",
    "updatedAt": "2025-01-15T08:35:00Z",
    "healthHabit": {
      "id": 123,
      "name": "Blood Pressure"
    },
    "componentDefinition": {
      "id": "component-uuid",
      "name": "Systolic Pressure"
    },
    "user": {
      "id": "user-uuid",
      "email": "user@example.com"
    }
  }
}
```

**Error Responses**:

- `400 Bad Request`:
  - Invalid date format
  - Validation errors in request body
  - Attempting to create data for another user
- `404 Not Found`: If referenced healthHabitId or componentDefinitionId doesn't exist

---

### 8. Get Health Habit Statistics by Date

Get statistics for user's health habits on a specific date.

**Endpoint**: `GET /api/v1/user-health-habits/stats/by-date`

**Authentication**: Required

**Query Parameters**:

- `date` (optional): ISO 8601 date string (e.g., "2025-01-15") - defaults to current date

**Example Request**:

```
GET /api/v1/user-health-habits/stats/by-date?date=2025-01-15
```

**Response**:

```json
{
  "success": true,
  "data": {
    "total_healths": 5,
    "completed_healths": 3,
    "pending_healths": 2,
    "completion_rate": 60
  }
}
```

---

## Authentication

All endpoints require JWT authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

If authentication fails, you'll receive a `401 Unauthorized` response.

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Error type",
  "details": {
    // Additional error details
  }
}
```

Common HTTP status codes:

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data or validation error
- `401 Unauthorized`: Authentication required or failed
- `404 Not Found`: Resource not found

---

## Usage Examples

### Example: Fill Blood Pressure Data

```bash
curl -X POST https://api.example.com/api/v1/user-health-habits/data \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "healthHabitId": 1,
    "componentDefinitionId": "comp-uuid-123",
    "date": "2025-01-15T08:00:00Z",
    "resultValue": "120/80",
    "numericResult": 120,
    "unitUsed": "mmHg",
    "contextNote": "Morning measurement after exercise"
  }'
```

### Example: Get Today's Data History

```bash
curl -X GET "https://api.example.com/api/v1/user-health-habits/data/history?date=2025-01-15" \
  -H "Authorization: Bearer <token>"
```

### Example: Get All User Health Habits

```bash
curl -X GET https://api.example.com/api/v1/user-health-habits \
  -H "Authorization: Bearer <token>"
```

---

## Notes

1. **Date Format**: All dates should be in ISO 8601 format (e.g., "2025-01-15T08:00:00Z" or "2025-01-15")
2. **UUIDs**: All IDs (except healthHabitId) are UUIDs and should be in the format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
3. **User Data Privacy**: Users can only access and create their own data. Attempting to access another user's data will result in a 400 Bad Request error.
4. **Automatic Response Wrapping**: All successful responses are automatically wrapped in `{ "success": true, "data": {...} }`

---

## Related Entities

### UserHealthHabit

Links a user to a health habit they're tracking.

### UserHealthHabitData

Stores the actual measurement/data for a health habit at a specific point in time.

### HealthHabit

Defines the type of health habit (e.g., Blood Pressure, Blood Sugar).

### TestComponent

Defines the structure and metadata for a specific component of a health test (e.g., Systolic Pressure, Hemoglobin).
