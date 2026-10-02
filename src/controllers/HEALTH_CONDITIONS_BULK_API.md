# Health Conditions Bulk API Documentation

## Add Multiple Health Conditions Endpoint

### POST `/health-conditions/my-conditions/bulk`

Add multiple health conditions to the current user in a single API call.

#### Request Body

```json
{
  "healthConditions": [
    {
      "healthConditionId": "uuid-of-existing-condition"
    },
    {
      "healthConditionName": "Diabetes"
    },
    {
      "healthConditionId": "another-uuid"
    },
    {
      "healthConditionName": "Hypertension"
    }
  ]
}
```

#### Request Rules

- The `healthConditions` array must contain at least one item
- Each item must have either `healthConditionId` OR `healthConditionName` (at least one must be provided)
- If `healthConditionId` is provided, it must be a valid UUID of an existing health condition
- If `healthConditionName` is provided and the health condition doesn't exist, it will be created automatically
- Duplicate health conditions for the user will be skipped and reported in the failed array

#### Response

```json
{
  "successCount": 2,
  "failedCount": 1,
  "created": [
    {
      "id": "user-health-condition-uuid-1",
      "userId": "user-uuid",
      "healthConditionId": "health-condition-uuid-1",
      "createdAt": "2025-10-04T10:00:00.000Z",
      "updatedAt": "2025-10-04T10:00:00.000Z"
    },
    {
      "id": "user-health-condition-uuid-2",
      "userId": "user-uuid",
      "healthConditionId": "health-condition-uuid-2",
      "createdAt": "2025-10-04T10:00:00.000Z",
      "updatedAt": "2025-10-04T10:00:00.000Z"
    }
  ],
  "failed": [
    {
      "item": {
        "healthConditionId": "invalid-uuid"
      },
      "reason": "Health condition with ID \"invalid-uuid\" not found"
    }
  ]
}
```

#### Response Fields

- `successCount`: Number of health conditions successfully added
- `failedCount`: Number of health conditions that failed to add
- `created`: Array of successfully created user health condition records
- `failed`: Array of failed items with reasons for failure

#### Common Failure Reasons

1. `"Either healthConditionId or healthConditionName must be provided"` - Neither field was provided
2. `"Health condition with ID \"xxx\" not found"` - Invalid healthConditionId
3. `"User already has this health condition assigned"` - User already has this health condition
4. `"Invalid input data"` - Malformed input data

#### Status Codes

- `201 Created` - Request processed (check response for individual successes/failures)
- `400 Bad Request` - Invalid request format
- `401 Unauthorized` - User not authenticated

## Example Usage

### Add multiple health conditions by name

```bash
curl -X POST http://localhost:3000/health-conditions/my-conditions/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "healthConditions": [
      {"healthConditionName": "Diabetes"},
      {"healthConditionName": "Hypertension"},
      {"healthConditionName": "Asthma"}
    ]
  }'
```

### Add multiple health conditions by ID

```bash
curl -X POST http://localhost:3000/health-conditions/my-conditions/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "healthConditions": [
      {"healthConditionId": "550e8400-e29b-41d4-a716-446655440000"},
      {"healthConditionId": "550e8400-e29b-41d4-a716-446655440001"}
    ]
  }'
```

### Mix of IDs and names

```bash
curl -X POST http://localhost:3000/health-conditions/my-conditions/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "healthConditions": [
      {"healthConditionId": "550e8400-e29b-41d4-a716-446655440000"},
      {"healthConditionName": "Diabetes"},
      {"healthConditionId": "550e8400-e29b-41d4-a716-446655440001"},
      {"healthConditionName": "Hypertension"}
    ]
  }'
```

## Benefits

- **Reduced API Calls**: Add multiple health conditions in one request instead of multiple individual requests
- **Partial Success Handling**: The API continues processing even if some items fail, returning both successes and failures
- **Automatic Creation**: New health conditions are automatically created when using `healthConditionName`
- **Duplicate Prevention**: Automatically skips health conditions the user already has
