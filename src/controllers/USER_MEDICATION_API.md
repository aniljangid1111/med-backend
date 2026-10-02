# User Medication API Documentation

## Overview

The User Medication API allows authenticated users to manage their personal medication schedules and track medication intake logs. This API supports creating medication schedules, updating them, logging doses, and retrieving medications for specific dates.

**Base URL**: `/api/v1/user-medications`

**Authentication**: All endpoints require JWT authentication (Bearer token)

---

## Endpoints

### 1. Create User Medication

Create a new medication schedule for the authenticated user.

**Endpoint**: `POST /api/v1/user-medications`

**Authentication**: Required

**Request Body** (`CreateUserMedicationDto`):

```json
{
  "medicineId": "uuid-string",
  "dosage": "500mg",
  "frequency": "twice daily",
  "startDate": "2024-10-04",
  "endDate": "2024-10-14",
  "instructions": "Take with food",
  "reminderTimes": ["08:00", "20:00"]
}
```

**Field Descriptions**:

- `medicineId` (required, UUID): Reference to the medicine from the medicines catalog
- `dosage` (required, string): Medication dosage amount (e.g., "500mg", "2 tablets")
- `frequency` (required, string): How often to take the medication (e.g., "twice daily", "once every 8 hours")
- `startDate` (required, ISO 8601 date): When to start taking the medication
- `endDate` (optional, ISO 8601 date): When to stop taking the medication (null for ongoing)
- `instructions` (optional, string): Additional instructions or notes
- `reminderTimes` (optional, array of time strings): Times to send reminders (format: "HH:MM")

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "medicineId": "uuid-string",
    "userId": "uuid-string",
    "dosage": "500mg",
    "frequency": "twice daily",
    "startDate": "2024-10-04",
    "endDate": "2024-10-14",
    "instructions": "Take with food",
    "reminderTimes": ["08:00", "20:00"],
    "isActive": true,
    "createdAt": "2024-10-04T10:00:00Z",
    "updatedAt": "2024-10-04T10:00:00Z"
  }
}
```

**Error Responses**:

- `400 Bad Request`: Invalid input data (validation errors)
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Medicine with specified ID does not exist

**Example cURL**:

```bash
curl -X POST https://api.example.com/api/v1/user-medications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "medicineId": "123e4567-e89b-12d3-a456-426614174000",
    "dosage": "500mg",
    "frequency": "twice daily",
    "startDate": "2024-10-04",
    "instructions": "Take with food"
  }'
```

---

### 2. Update User Medication

Update an existing medication schedule.

**Endpoint**: `PATCH /api/v1/user-medications/:id`

**Authentication**: Required

**URL Parameters**:

- `id` (required, UUID): The medication schedule ID to update

**Request Body** (`UpdateUserMedicationDto`):

```json
{
  "dosage": "1000mg",
  "frequency": "once daily",
  "endDate": "2024-10-20",
  "instructions": "Take in the morning with food",
  "reminderTimes": ["09:00"],
  "isActive": false
}
```

**Field Descriptions** (all fields optional):

- `medicineId` (UUID): Change the medicine reference
- `dosage` (string): Update dosage amount
- `frequency` (string): Update frequency
- `startDate` (ISO 8601 date): Update start date
- `endDate` (ISO 8601 date): Update end date
- `instructions` (string): Update instructions
- `reminderTimes` (array of time strings): Update reminder times
- `isActive` (boolean): Activate or deactivate the medication schedule

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "medicineId": "uuid-string",
    "userId": "uuid-string",
    "dosage": "1000mg",
    "frequency": "once daily",
    "startDate": "2024-10-04",
    "endDate": "2024-10-20",
    "instructions": "Take in the morning with food",
    "reminderTimes": ["09:00"],
    "isActive": false,
    "createdAt": "2024-10-04T10:00:00Z",
    "updatedAt": "2024-10-08T15:30:00Z"
  }
}
```

**Error Responses**:

- `400 Bad Request`: Invalid UUID or validation errors
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Medication schedule not found

**Example cURL**:

```bash
curl -X PATCH https://api.example.com/api/v1/user-medications/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dosage": "1000mg",
    "isActive": false
  }'
```

---

### 3. Delete User Medication

Delete a medication schedule.

**Endpoint**: `DELETE /api/v1/user-medications/:id`

**Authentication**: Required

**URL Parameters**:

- `id` (required, UUID): The medication schedule ID to delete

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "message": "Medication schedule deleted successfully"
  }
}
```

**Error Responses**:

- `400 Bad Request`: Invalid UUID format
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Medication schedule not found

**Example cURL**:

```bash
curl -X DELETE https://api.example.com/api/v1/user-medications/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Note**: Consider implementing soft delete (marking as inactive) instead of hard delete to preserve medication history.

---

### 4. Log Medication Intake

Record that a medication dose was taken.

**Endpoint**: `POST /api/v1/user-medications/:id/logs`

**Authentication**: Required

**URL Parameters**:

- `id` (required, UUID): The medication schedule ID to log

**Request Body** (`CreateMedicationLogDto`):

```json
{
  "takenAt": "2024-10-08T08:15:00Z",
  "dosageTaken": "500mg",
  "notes": "Taken with breakfast"
}
```

**Field Descriptions**:

- `takenAt` (required, ISO 8601 datetime): When the medication was taken
- `dosageTaken` (optional, string): Actual dosage taken (defaults to scheduled dosage)
- `notes` (optional, string): Additional notes about this dose

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "userMedicationId": "uuid-string",
    "takenAt": "2024-10-08T08:15:00Z",
    "dosageTaken": "500mg",
    "notes": "Taken with breakfast",
    "createdAt": "2024-10-08T08:16:00Z"
  }
}
```

**Error Responses**:

- `400 Bad Request`: Invalid UUID or validation errors
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Medication schedule not found

**Example cURL**:

```bash
curl -X POST https://api.example.com/api/v1/user-medications/123e4567-e89b-12d3-a456-426614174000/logs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "takenAt": "2024-10-08T08:15:00Z",
    "dosageTaken": "500mg",
    "notes": "Taken with breakfast"
  }'
```

---

### 5. Get Medications by Date

Retrieve all medications scheduled for a specific date for the authenticated user.

**Endpoint**: `GET /api/v1/user-medications/by-date`

**Authentication**: Required

**Query Parameters**:

- `date` (optional, ISO 8601 date string): The date to retrieve medications for
  - Format: `YYYY-MM-DD` or `YYYY-MM-DDTHH:MM:SSZ`
  - Examples: `2024-10-04` or `2024-10-04T00:00:00Z`
  - Default: Current date if not provided

**Response** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "medicine": {
        "id": "uuid-string",
        "name": "Amoxicillin",
        "genericName": "Amoxicillin",
        "type": "Antibiotic"
      },
      "dosage": "500mg",
      "frequency": "twice daily",
      "reminderTimes": ["08:00", "20:00"],
      "instructions": "Take with food",
      "startDate": "2024-10-04",
      "endDate": "2024-10-14",
      "isActive": true,
      "logs": [
        {
          "id": "uuid-string",
          "takenAt": "2024-10-08T08:15:00Z",
          "dosageTaken": "500mg",
          "notes": "Taken with breakfast"
        }
      ]
    },
    {
      "id": "uuid-string-2",
      "medicine": {
        "id": "uuid-string-2",
        "name": "Lisinopril",
        "genericName": "Lisinopril",
        "type": "Blood Pressure"
      },
      "dosage": "10mg",
      "frequency": "once daily",
      "reminderTimes": ["09:00"],
      "instructions": "Take in the morning",
      "startDate": "2024-01-01",
      "endDate": null,
      "isActive": true,
      "logs": []
    }
  ]
}
```

**Response Fields**:

- Returns an array of medication schedules active on the specified date
- Each medication includes:
  - Full medication schedule details
  - Associated medicine information
  - Any logs recorded for that date
- Medications are filtered by:
  - `startDate <= specified date`
  - `endDate >= specified date` OR `endDate is null` (ongoing)
  - `isActive = true`

**Error Responses**:

- `400 Bad Request`: Invalid date format

  ```json
  {
    "success": false,
    "message": "Invalid date format. Please use ISO 8601 format (e.g., 2024-10-04 or 2024-10-04T00:00:00Z).",
    "error": "Bad Request"
  }
  ```

- `401 Unauthorized`: Missing or invalid authentication token

**Example cURL**:

```bash
# Get medications for a specific date
curl -X GET "https://api.example.com/api/v1/user-medications/by-date?date=2024-10-08" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get medications for today (no date parameter)
curl -X GET "https://api.example.com/api/v1/user-medications/by-date" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Data Models

### CreateUserMedicationDto

```typescript
{
  medicineId: string (UUID, required)
  dosage: string (required)
  frequency: string (required)
  startDate: string (ISO 8601 date, required)
  endDate?: string (ISO 8601 date, optional)
  instructions?: string (optional)
  reminderTimes?: string[] (optional, format: "HH:MM")
}
```

### UpdateUserMedicationDto

```typescript
{
  medicineId?: string (UUID, optional)
  dosage?: string (optional)
  frequency?: string (optional)
  startDate?: string (ISO 8601 date, optional)
  endDate?: string (ISO 8601 date, optional)
  instructions?: string (optional)
  reminderTimes?: string[] (optional)
  isActive?: boolean (optional)
}
```

### CreateMedicationLogDto

```typescript
{
  takenAt: string (ISO 8601 datetime, required)
  dosageTaken?: string (optional)
  notes?: string (optional)
}
```

---

## Common Response Format

All successful responses follow this format:

```json
{
  "success": true,
  "data": { ... }
}
```

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Error Type",
  "details": { ... } // Optional, for validation errors
}
```

---

## Authentication

All endpoints require a valid JWT token in the Authorization header:

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

The token identifies the authenticated user, and all operations are performed in the context of that user.

---

## Date and Time Formats

- **Dates**: ISO 8601 format `YYYY-MM-DD` (e.g., `2024-10-04`)
- **Datetimes**: ISO 8601 format with timezone `YYYY-MM-DDTHH:MM:SSZ` (e.g., `2024-10-04T08:15:00Z`)
- **Times**: 24-hour format `HH:MM` (e.g., `08:00`, `20:30`)

---

## Use Cases

### 1. Creating a Short-term Medication (Antibiotic Course)

```json
POST /api/v1/user-medications
{
  "medicineId": "123e4567-e89b-12d3-a456-426614174000",
  "dosage": "500mg",
  "frequency": "3 times daily",
  "startDate": "2024-10-04",
  "endDate": "2024-10-14",
  "instructions": "Complete full course even if feeling better",
  "reminderTimes": ["08:00", "14:00", "20:00"]
}
```

### 2. Creating an Ongoing Medication (Chronic Condition)

```json
POST /api/v1/user-medications
{
  "medicineId": "987e6543-e21b-12d3-a456-426614174000",
  "dosage": "10mg",
  "frequency": "once daily",
  "startDate": "2024-01-01",
  "endDate": null,
  "instructions": "Take in the morning with water",
  "reminderTimes": ["09:00"]
}
```

### 3. Logging a Dose

```json
POST /api/v1/user-medications/123e4567-e89b-12d3-a456-426614174000/logs
{
  "takenAt": "2024-10-08T09:05:00Z",
  "dosageTaken": "10mg",
  "notes": "Taken slightly late"
}
```

### 4. Checking Today's Medications

```HTTP
GET /api/v1/user-medications/by-date
```

### 5. Pausing a Medication Temporarily

```json
PATCH /api/v1/user-medications/123e4567-e89b-12d3-a456-426614174000
{
  "isActive": false
}
```

---

## Best Practices

1. **Always validate dates**: The API will reject invalid ISO 8601 dates
2. **Use timezone-aware datetimes**: Always include timezone information (Z for UTC or +HH:MM offset)
3. **Log medications promptly**: Record doses as soon as they're taken for accurate tracking
4. **Set realistic reminder times**: Consider the user's typical daily schedule
5. **Handle missed doses**: Create a separate mechanism to track and report missed doses
6. **Use meaningful instructions**: Provide clear, actionable guidance for each medication
7. **Verify medicine existence**: Ensure the `medicineId` refers to a valid medicine before creating a schedule

---

## Related APIs

- **Medicine API**: `/api/v1/medicines` - Browse available medicines catalog
- **Dashboard API**: `/api/v1/dashboard` - Get aggregated health data including medication adherence
- **User Profile API**: `/api/v1/users/me` - Manage user account settings

---

## Notes

- The controller uses global validation pipes with `whitelist: true` and `forbidNonWhitelisted: true`
- All UUID parameters are validated using `ParseUUIDPipe`
- The `@CurrentUser()` decorator automatically injects the authenticated user from the JWT token
- Response transformation is handled globally by `TransformInterceptor`
- Error handling is standardized via `HttpExceptionFilter`

---

## Changelog

### Version 1.0.0 (Initial Release)

- Create user medication schedules
- Update medication schedules
- Delete medication schedules
- Log medication intake
- Retrieve medications by date with optimized date validation
