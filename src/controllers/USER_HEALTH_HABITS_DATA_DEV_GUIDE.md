# User Health Habits Data Controller - Developer Guide

## Quick Start

The User Health Habits Data Controller provides REST API endpoints for users to manage and track their health habits and measurements.

### Controller Location

`src/controllers/user-health-habits-data.controller.ts`

### Base Route

`/api/v1/user-health-habits`

---

## Module Structure

```
src/controllers/
├── user-health-habits-data.controller.ts          # Main controller
├── USER_HEALTH_HABITS_DATA_API.md                 # Full API docs
├── USER_HEALTH_HABITS_DATA_QUICK_REFERENCE.md     # Quick ref
└── USER_HEALTH_HABITS_DATA_IMPLEMENTATION.md      # Implementation details

libs/
├── user-healt-habit/                              # Health habits management
│   └── src/
│       ├── user-healt-habit.service.ts           # Service for user habits
│       ├── entitiy/user-healt-habit.entity.ts    # Entity definition
│       └── dtos/                                  # DTOs
└── user-healt-habit-data/                         # Health data management
    └── src/
        ├── user-healt-habit-data.service.ts      # Service for habit data
        ├── entity/user-healt-habit-data.entity.ts # Entity definition
        └── dtos/                                  # DTOs
```

---

## Key Concepts

### UserHealthHabit

Represents a health habit that a user is tracking (e.g., "I track Blood Pressure").

**Entity**: `UserHealthHabit`

- Links User → HealthHabit
- Has `isFavorite` flag for quick access
- Stores user preferences for tracking

### UserHealthHabitData

Represents actual measurement data (e.g., "My blood pressure was 120/80 on Jan 15 at 8am").

**Entity**: `UserHealthHabitData`

- Links to `UserHealthHabit` and `User`
- Stores actual values, units, timestamps
- Has optional numeric representation for calculations
- Includes context notes for additional information

---

## Controller Methods Overview

### Health Habits Management

```typescript
getUserHealthHabits(); // GET /
getUserFavoriteHealthHabits(); // GET /favorites
getUserHealthHabitById(); // GET /:id
```

### Data History & Viewing

```typescript
getUserHealthHabitDataHistory(); // GET /data/history
getUserFavoriteHealthHabitData(); // GET /data/favorites
getHealthHabitDataById(); // GET /data/:id
```

### Data Creation

```typescript
createHealthHabitData(); // POST /data
```

### Analytics

```typescript
getUserHealthHabitStats(); // GET /stats/by-date
```

---

## Common Development Tasks

### Adding a New Endpoint

1. **Add method to controller**:

```typescript
@Get('new-endpoint')
async newEndpoint(@CurrentUser() user: User) {
  // Implementation
}
```

2. **No need to update module** - Controller already registered

3. **Add documentation** to `USER_HEALTH_HABITS_DATA_API.md`

### Adding Validation

Use class-validator decorators in DTOs:

```typescript
import { IsString, IsUUID, IsOptional } from 'class-validator';

export class NewDto {
  @IsUUID()
  id: string;

  @IsString()
  @IsOptional()
  note?: string;
}
```

### Adding Query Parameters

```typescript
@Get('example')
async example(
  @CurrentUser() user: User,
  @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  @Query('search') search?: string,
) {
  // Implementation
}
```

### Ensuring User Ownership

Always validate that data belongs to the authenticated user:

```typescript
const data = await this.service.findById(id);
if (data.userId !== user.id) {
  throw new BadRequestException('Not your data');
}
```

---

## Testing the Endpoints

### 1. Start the Server

```bash
pnpm start:dev
```

### 2. Get JWT Token

Login first to get a token:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

### 3. Test Endpoints

```bash
# List health habits
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/v1/user-health-habits

# Create data
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "healthHabitId": 1,
    "componentDefinitionId": "uuid",
    "date": "2025-01-15T08:00:00Z",
    "resultValue": "120/80",
    "numericResult": 120
  }' \
  http://localhost:3000/api/v1/user-health-habits/data
```

---

## Error Handling

### Common Errors

1. **401 Unauthorized**
   - Missing or invalid JWT token
   - Token expired

2. **400 Bad Request**
   - Validation errors (invalid UUID, missing required fields)
   - Attempting to access another user's data
   - Invalid date format

3. **404 Not Found**
   - Resource doesn't exist
   - Invalid ID provided

### Custom Error Messages

The controller provides descriptive error messages:

```typescript
if (healthHabit.userId !== user.id) {
  throw new BadRequestException('This health habit does not belong to you');
}
```

---

## Security Considerations

### ✅ Implemented Security Features

1. **JWT Authentication**: All endpoints protected by global guard
2. **User Isolation**: Users can only access their own data
3. **Ownership Validation**: Checked before returning sensitive data
4. **Auto User Assignment**: `userId` always set from JWT, never from request

### ⚠️ Important Security Rules

- **Never trust `userId` from request body** - Always use `@CurrentUser()`
- **Always validate ownership** before returning data
- **Use UUIDs** for all IDs (prevents enumeration attacks)
- **Validate dates** to prevent injection or invalid data

---

## Integration Points

### Services Used

- `UserHealtHabitService` - Manages user health habits
- `UserHealtHabitDataService` - Manages health data entries

### Modules Required

- `UserHealtHabitModule` - Must be imported in `ControllersModule`
- `UserHealtHabitDataModule` - Must be imported in `ControllersModule`
- `AuthModule` - Provides authentication
- `UserModule` - Provides user entity

### Decorators Used

- `@CurrentUser()` - Injects authenticated user from JWT
- `@ParseUUIDPipe` - Validates and transforms UUID parameters
- `@DefaultValuePipe` - Provides default values for query params
- `@ParseIntPipe` - Validates and transforms integer parameters

---

## Database Relationships

```
User (1) ──→ (M) UserHealthHabit ──→ (1) HealthHabit
  ↓
  (1)
  ↓
  (M)
UserHealthHabitData ──→ (1) TestComponent
  ↓
  (M)
  ↓
  (1)
HealthHabit
```

---

## Response Format

All responses are automatically wrapped by `TransformInterceptor`:

### Success

```json
{
  "success": true,
  "data": {
    /* actual data */
  }
}
```

### Error

```json
{
  "success": false,
  "message": "Error description",
  "error": "BadRequestException"
}
```

---

## Debugging Tips

### Enable Logging

Add logging to service calls:

```typescript
console.log('User:', user.id);
console.log('Creating data:', createDto);
```

### Check Database

Verify data in PostgreSQL:

```sql
SELECT * FROM user_health_habits WHERE "userId" = 'uuid';
SELECT * FROM user_health_habit_data WHERE "userId" = 'uuid';
```

### Test with Postman

Import the endpoints into Postman for easier testing:

1. Set base URL: `http://localhost:3000/api/v1`
2. Add Authorization header: `Bearer <token>`
3. Test each endpoint

---

## Common Issues & Solutions

### Issue: "Cannot find module '@user-healt-habit/user-healt-habit'"

**Solution**: Check `tsconfig.json` paths configuration

### Issue: "This health habit does not belong to you"

**Solution**: Ensure you're using the correct user's JWT token and the habit ID belongs to that user

### Issue: "Invalid date format"

**Solution**: Use ISO 8601 format: `2025-01-15T08:00:00Z` or `2025-01-15`

### Issue: 404 on endpoints

**Solution**:

1. Check if controller is registered in `ControllersModule`
2. Verify global prefix is `/api/v1/`
3. Ensure server is running

---

## Best Practices

1. ✅ **Always use `@CurrentUser()`** for user ID
2. ✅ **Validate ownership** before returning data
3. ✅ **Use proper HTTP status codes** (201 for creation, 200 for success)
4. ✅ **Provide descriptive error messages**
5. ✅ **Use DTOs** for all request bodies
6. ✅ **Use pipes** for validation and transformation
7. ✅ **Keep controller thin** - delegate logic to services
8. ✅ **Document new endpoints** in API docs

---

## Related Documentation

- **Full API Docs**: `USER_HEALTH_HABITS_DATA_API.md`
- **Quick Reference**: `USER_HEALTH_HABITS_DATA_QUICK_REFERENCE.md`
- **Implementation**: `USER_HEALTH_HABITS_DATA_IMPLEMENTATION.md`
- **Project Guidelines**: `/.github/copilot-instructions.md`

---

## Need Help?

- Check existing similar controllers: `allergies.controller.ts`, `health-conditions.controller.ts`
- Review service implementations in `libs/` folders
- Check entity definitions for available fields
- Refer to project guidelines in `.github/copilot-instructions.md`
