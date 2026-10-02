# Health Conditions Controller - Quick Reference

## Controller Created: `HealthConditionsController`

### Location
`src/controllers/health-conditions.controller.ts`

### Module Integration
Added to `ControllersModule` with `HealthConditionModule` imported.

---

## API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health-conditions` | Get all available health conditions | ✅ |
| GET | `/health-conditions/my-conditions` | Get current user's health conditions | ✅ |
| POST | `/health-conditions/my-conditions` | Add health condition to user profile | ✅ |
| DELETE | `/health-conditions/my-conditions/:healthConditionId` | Remove health condition by condition ID | ✅ |
| DELETE | `/health-conditions/my-conditions/record/:userHealthConditionId` | Remove health condition by record ID | ✅ |

---

## Key Features

### 1. List All Available Health Conditions
```typescript
GET /health-conditions
```
Returns all active health conditions in the system.

### 2. List User's Health Conditions
```typescript
GET /health-conditions/my-conditions
```
Returns all health conditions assigned to the current user with full condition details.

### 3. Add Health Condition (Flexible)
```typescript
POST /health-conditions/my-conditions
Body: { healthConditionId: "uuid" } OR { healthConditionName: "Diabetes" }
```
- **Option A**: Use existing condition ID
- **Option B**: Provide condition name (creates if doesn't exist)

### 4. Remove Health Condition
```typescript
DELETE /health-conditions/my-conditions/:healthConditionId
```
Removes the health condition from user's profile.

---

## Request/Response Examples

### Get User's Conditions
```bash
curl -X GET http://localhost:3000/health-conditions/my-conditions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
[
  {
    "id": "user-condition-uuid",
    "userId": "user-uuid",
    "healthConditionId": "condition-uuid",
    "healthCondition": {
      "id": "condition-uuid",
      "name": "Diabetes Type 2",
      "isActive": true
    }
  }
]
```

### Add a Condition
```bash
curl -X POST http://localhost:3000/health-conditions/my-conditions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"healthConditionName": "Hypertension"}'
```

### Remove a Condition
```bash
curl -X DELETE http://localhost:3000/health-conditions/my-conditions/CONDITION_UUID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Authentication
All endpoints use JWT authentication. The user is automatically extracted from the token using `@CurrentUser()` decorator.

---

## Error Handling
- **400**: Invalid request (missing required fields)
- **401**: Unauthorized (invalid/missing token)
- **404**: Resource not found
- **409**: Conflict (duplicate assignment)

---

## Files Modified/Created
1. ✅ Created: `src/controllers/health-conditions.controller.ts`
2. ✅ Modified: `src/controllers/controllers.module.ts`
3. ✅ Created: `src/controllers/HEALTH_CONDITIONS_API.md` (Full API docs)

---

## Testing Checklist
- [ ] Test GET all health conditions
- [ ] Test GET my health conditions
- [ ] Test POST add condition with existing ID
- [ ] Test POST add condition with new name
- [ ] Test POST add condition with duplicate (should fail)
- [ ] Test DELETE remove condition
- [ ] Test all endpoints without auth (should fail)

---

## Next Steps
1. Test the endpoints with your frontend or API client (Postman/Insomnia)
2. Ensure JWT authentication is properly configured
3. Verify database migrations are up to date
4. Add Swagger/OpenAPI documentation if needed
5. Consider adding pagination for large condition lists
6. Add filtering/search capabilities if needed
