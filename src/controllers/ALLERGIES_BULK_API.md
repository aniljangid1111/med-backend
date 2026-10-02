# Allergies Bulk API Documentation

## Add Multiple Allergies Endpoint

### POST `/allergies/my-allergies/bulk`

Add multiple allergies to the current user in a single API call.

#### Request Body

```json
{
  "allergies": [
    {
      "allergyId": "uuid-of-existing-allergy"
    },
    {
      "allergyName": "Peanuts"
    },
    {
      "allergyId": "another-uuid"
    },
    {
      "allergyName": "Shellfish"
    }
  ]
}
```

#### Request Rules

- The `allergies` array must contain at least one item
- Each item must have either `allergyId` OR `allergyName` (at least one must be provided)
- If `allergyId` is provided, it must be a valid UUID of an existing allergy
- If `allergyName` is provided and the allergy doesn't exist, it will be created automatically
- Duplicate allergies for the user will be skipped and reported in the failed array

#### Response

```json
{
  "successCount": 2,
  "failedCount": 1,
  "created": [
    {
      "id": "user-allergy-uuid-1",
      "userId": "user-uuid",
      "allergyId": "allergy-uuid-1",
      "createdAt": "2025-10-04T10:00:00.000Z",
      "updatedAt": "2025-10-04T10:00:00.000Z"
    },
    {
      "id": "user-allergy-uuid-2",
      "userId": "user-uuid",
      "allergyId": "allergy-uuid-2",
      "createdAt": "2025-10-04T10:00:00.000Z",
      "updatedAt": "2025-10-04T10:00:00.000Z"
    }
  ],
  "failed": [
    {
      "item": {
        "allergyId": "invalid-uuid"
      },
      "reason": "Allergy with ID \"invalid-uuid\" not found"
    }
  ]
}
```

#### Response Fields

- `successCount`: Number of allergies successfully added
- `failedCount`: Number of allergies that failed to add
- `created`: Array of successfully created user allergy records
- `failed`: Array of failed items with reasons for failure

#### Common Failure Reasons

1. `"Either allergyId or allergyName must be provided"` - Neither field was provided
2. `"Allergy with ID \"xxx\" not found"` - Invalid allergyId
3. `"User already has this allergy assigned"` - User already has this allergy
4. `"Invalid input data"` - Malformed input data

#### Status Codes

- `201 Created` - Request processed (check response for individual successes/failures)
- `400 Bad Request` - Invalid request format
- `401 Unauthorized` - User not authenticated

## Example Usage

### Add multiple allergies by name

```bash
curl -X POST http://localhost:3000/allergies/my-allergies/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "allergies": [
      {"allergyName": "Peanuts"},
      {"allergyName": "Shellfish"},
      {"allergyName": "Latex"}
    ]
  }'
```

### Add multiple allergies by ID

```bash
curl -X POST http://localhost:3000/allergies/my-allergies/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "allergies": [
      {"allergyId": "550e8400-e29b-41d4-a716-446655440000"},
      {"allergyId": "550e8400-e29b-41d4-a716-446655440001"}
    ]
  }'
```

### Mix of IDs and names

```bash
curl -X POST http://localhost:3000/allergies/my-allergies/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "allergies": [
      {"allergyId": "550e8400-e29b-41d4-a716-446655440000"},
      {"allergyName": "Peanuts"},
      {"allergyId": "550e8400-e29b-41d4-a716-446655440001"},
      {"allergyName": "Shellfish"}
    ]
  }'
```

## Benefits

- **Reduced API Calls**: Add multiple allergies in one request instead of multiple individual requests
- **Partial Success Handling**: The API continues processing even if some items fail, returning both successes and failures
- **Automatic Creation**: New allergies are automatically created when using `allergyName`
- **Duplicate Prevention**: Automatically skips allergies the user already has
