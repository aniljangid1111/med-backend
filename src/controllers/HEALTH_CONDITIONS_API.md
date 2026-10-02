# Health Conditions Controller API Documentation

## Overview
This controller provides user-facing endpoints for managing health conditions. Users can view available health conditions, add them to their profile, and remove them.

## Authentication
All endpoints require JWT authentication. The user is automatically identified from the authentication token using the `@CurrentUser()` decorator.

## Base URL
```
/health-conditions
```

---

## Endpoints

### 1. Get All Available Health Conditions
**Endpoint:** `GET /health-conditions`

**Description:** Retrieves all active health conditions available in the system.

**Authentication:** Required

**Request:**
```http
GET /health-conditions
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Diabetes Type 2",
    "isActive": true,
    "createdAt": "2025-10-04T10:00:00.000Z",
    "updatedAt": "2025-10-04T10:00:00.000Z"
  },
  {
    "id": "uuid",
    "name": "Hypertension",
    "isActive": true,
    "createdAt": "2025-10-04T10:00:00.000Z",
    "updatedAt": "2025-10-04T10:00:00.000Z"
  }
]
```

**Status Codes:**
- `200 OK` - Success

---

### 2. Get My Health Conditions
**Endpoint:** `GET /health-conditions/my-conditions`

**Description:** Retrieves all health conditions assigned to the current user.

**Authentication:** Required

**Request:**
```http
GET /health-conditions/my-conditions
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": "user-health-condition-uuid",
    "userId": "user-uuid",
    "healthConditionId": "condition-uuid",
    "createdAt": "2025-10-04T10:00:00.000Z",
    "updatedAt": "2025-10-04T10:00:00.000Z",
    "healthCondition": {
      "id": "condition-uuid",
      "name": "Diabetes Type 2",
      "isActive": true,
      "createdAt": "2025-10-04T10:00:00.000Z",
      "updatedAt": "2025-10-04T10:00:00.000Z"
    }
  }
]
```

**Status Codes:**
- `200 OK` - Success

---

### 3. Add Health Condition to My Profile
**Endpoint:** `POST /health-conditions/my-conditions`

**Description:** Adds a health condition to the current user's profile. You can either:
- Provide an existing `healthConditionId` to add an existing condition
- Provide a `healthConditionName` to add or create a new condition

**Authentication:** Required

**Request Body (Option A - Using existing condition ID):**
```json
{
  "healthConditionId": "uuid"
}
```

**Request Body (Option B - Using condition name):**
```json
{
  "healthConditionName": "Asthma"
}
```

**Request Example:**
```http
POST /health-conditions/my-conditions
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "healthConditionName": "Diabetes Type 2"
}
```

**Response:**
```json
{
  "id": "user-health-condition-uuid",
  "userId": "user-uuid",
  "healthConditionId": "condition-uuid",
  "createdAt": "2025-10-04T10:00:00.000Z",
  "updatedAt": "2025-10-04T10:00:00.000Z"
}
```

**Status Codes:**
- `201 Created` - Health condition successfully added
- `400 Bad Request` - Invalid input (neither field provided or both provided)
- `404 Not Found` - Health condition ID not found (when using healthConditionId)
- `409 Conflict` - User already has this health condition assigned

**Validation Rules:**
- At least one field (`healthConditionId` or `healthConditionName`) must be provided
- `healthConditionId` must be a valid UUID
- `healthConditionName` must be a non-empty string

---

### 4. Remove Health Condition from My Profile (by Health Condition ID)
**Endpoint:** `DELETE /health-conditions/my-conditions/:healthConditionId`

**Description:** Removes a health condition from the current user's profile using the health condition ID.

**Authentication:** Required

**Path Parameters:**
- `healthConditionId` (UUID, required) - The ID of the health condition to remove

**Request:**
```http
DELETE /health-conditions/my-conditions/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Health condition successfully removed from user"
}
```

**Status Codes:**
- `200 OK` - Health condition successfully removed
- `400 Bad Request` - Invalid UUID format
- `404 Not Found` - Health condition assignment not found

---

### 5. Remove Health Condition from My Profile (by Record ID)
**Endpoint:** `DELETE /health-conditions/my-conditions/record/:userHealthConditionId`

**Description:** Removes a user health condition record by its unique record ID. This is useful when you have the specific user-health-condition relationship ID.

**Authentication:** Required

**Path Parameters:**
- `userHealthConditionId` (UUID, required) - The ID of the user health condition record

**Request:**
```http
DELETE /health-conditions/my-conditions/record/660e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Health condition successfully removed from user"
}
```

**Status Codes:**
- `200 OK` - Health condition successfully removed
- `400 Bad Request` - Invalid UUID format
- `404 Not Found` - User health condition record not found

---

## Usage Examples

### Example 1: View All Available Health Conditions
```bash
curl -X GET \
  http://localhost:3000/health-conditions \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Example 2: View My Health Conditions
```bash
curl -X GET \
  http://localhost:3000/health-conditions/my-conditions \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Example 3: Add a Health Condition (Using Existing ID)
```bash
curl -X POST \
  http://localhost:3000/health-conditions/my-conditions \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
    "healthConditionId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

### Example 4: Add a Health Condition (Using Name - Will Create if Doesn't Exist)
```bash
curl -X POST \
  http://localhost:3000/health-conditions/my-conditions \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
    "healthConditionName": "Migraine"
  }'
```

### Example 5: Remove a Health Condition (By Condition ID)
```bash
curl -X DELETE \
  http://localhost:3000/health-conditions/my-conditions/550e8400-e29b-41d4-a716-446655440000 \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Example 6: Remove a Health Condition (By Record ID)
```bash
curl -X DELETE \
  http://localhost:3000/health-conditions/my-conditions/record/660e8400-e29b-41d4-a716-446655440000 \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Either healthConditionId or healthConditionName must be provided",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Health condition with ID \"uuid\" not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "User already has this health condition assigned",
  "error": "Conflict"
}
```

---

## User Flow Examples

### Flow 1: User Adds Their First Health Condition
1. User logs in and receives JWT token
2. User views available conditions: `GET /health-conditions`
3. User selects "Diabetes Type 2" and adds it: `POST /health-conditions/my-conditions` with `healthConditionName: "Diabetes Type 2"`
4. System returns the created user-health-condition relationship

### Flow 2: User Views and Manages Their Health Conditions
1. User views their conditions: `GET /health-conditions/my-conditions`
2. User sees list including condition IDs
3. User decides to remove one: `DELETE /health-conditions/my-conditions/:healthConditionId`
4. System confirms removal

### Flow 3: User Adds a Custom Health Condition
1. User wants to add "Lactose Intolerance" which doesn't exist in the system
2. User posts: `POST /health-conditions/my-conditions` with `healthConditionName: "Lactose Intolerance"`
3. System creates the new condition and assigns it to the user
4. User receives confirmation

---

## Integration with Frontend

### React/Vue Example
```typescript
// Fetch user's health conditions
const fetchMyConditions = async () => {
  const response = await fetch('/health-conditions/my-conditions', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const conditions = await response.json();
  return conditions;
};

// Add a health condition
const addCondition = async (name: string) => {
  const response = await fetch('/health-conditions/my-conditions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ healthConditionName: name })
  });
  return await response.json();
};

// Remove a health condition
const removeCondition = async (conditionId: string) => {
  const response = await fetch(`/health-conditions/my-conditions/${conditionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
};
```

---

## Notes
- All endpoints require authentication
- The current user is automatically determined from the JWT token
- Health conditions are automatically created when a user provides a new name
- Users cannot add the same health condition twice
- Removing a health condition doesn't delete the condition itself, only the user's association with it
