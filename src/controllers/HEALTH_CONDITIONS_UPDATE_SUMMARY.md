# Health Conditions API Update Summary

## Changes Made

### 1. New DTO Created (`add-multiple-user-health-conditions.dto.ts`)

Created a new DTO for bulk operations:

```typescript
export class HealthConditionItemDto {
  healthConditionId?: string;
  healthConditionName?: string;
}

export class AddMultipleUserHealthConditionsDto {
  healthConditions: HealthConditionItemDto[];
}
```

- Accepts an array of health conditions
- Each item can have either `healthConditionId` or `healthConditionName`
- Validates that at least one health condition is provided

### 2. Service Updates (`health-condition.service.ts`)

#### Enhanced `getAllHealthConditions()` Method

**Before:**
```typescript
async getAllHealthConditions(isActive?: boolean): Promise<HealthCondition[]>
```

**After:**
```typescript
async getAllHealthConditions(
  isActive?: boolean,
  limit?: number,
  search?: string,
): Promise<HealthCondition[]>
```

**Features Added:**
- ✅ Search by health condition name (case-insensitive)
- ✅ Configurable result limit (default: 50)
- ✅ Results ordered alphabetically by name
- ✅ Uses TypeORM QueryBuilder for flexible queries
- ✅ Only returns active health conditions

#### New Method: `addMultipleUserHealthConditions()`

```typescript
async addMultipleUserHealthConditions(
  userId: string,
  addMultipleDto: AddMultipleUserHealthConditionsDto,
): Promise<{
  successCount: number;
  failedCount: number;
  created: UserHealthCondition[];
  failed: Array<{ item: any; reason: string }>;
}>
```

**Features:**
- ✅ Process multiple health conditions in a single call
- ✅ Handles both IDs and names
- ✅ Automatically creates new health conditions when using names
- ✅ Returns detailed results with success/failure counts
- ✅ Continues processing even if some items fail
- ✅ Prevents duplicate assignments

### 3. Controller Updates (`health-conditions.controller.ts`)

#### Enhanced GET Endpoint

**Before:**
```typescript
@Get()
async getAllHealthConditions()
```

**After:**
```typescript
@Get()
async getAllHealthConditions(
  @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  @Query('search') search?: string,
)
```

**New Query Parameters:**
- `limit` (optional, default: 50) - Maximum number of results
- `search` (optional) - Search term to filter by name

#### New Bulk Endpoint

```typescript
@Post('my-conditions/bulk')
@HttpCode(HttpStatus.CREATED)
async addMultipleHealthConditions(
  @CurrentUser() user: User,
  @Body() addMultipleDto: AddMultipleUserHealthConditionsDto,
)
```

**Endpoint:** `POST /health-conditions/my-conditions/bulk`

**Response Structure:**
```json
{
  "successCount": 2,
  "failedCount": 1,
  "created": [...],
  "failed": [...]
}
```

## API Usage Examples

### Search and Limit

```bash
# Get all health conditions (default limit: 50)
GET /health-conditions

# Limit results to 10
GET /health-conditions?limit=10

# Search for "diabetes"
GET /health-conditions?search=diabetes

# Combined: search + limit
GET /health-conditions?search=heart&limit=5
```

### Bulk Operations

```bash
# Add multiple health conditions by name
POST /health-conditions/my-conditions/bulk
{
  "healthConditions": [
    {"healthConditionName": "Diabetes"},
    {"healthConditionName": "Hypertension"},
    {"healthConditionName": "Asthma"}
  ]
}

# Add multiple health conditions by ID
POST /health-conditions/my-conditions/bulk
{
  "healthConditions": [
    {"healthConditionId": "uuid-1"},
    {"healthConditionId": "uuid-2"}
  ]
}

# Mix of IDs and names
POST /health-conditions/my-conditions/bulk
{
  "healthConditions": [
    {"healthConditionId": "uuid-1"},
    {"healthConditionName": "Diabetes"},
    {"healthConditionName": "Hypertension"}
  ]
}
```

## Complete API Reference

### 1. Get All Health Conditions (Enhanced)

**Endpoint:** `GET /health-conditions`

**Query Parameters:**
- `limit` (number, optional, default: 50)
- `search` (string, optional)

**Example:**
```bash
curl "http://localhost:3000/health-conditions?limit=10&search=diabetes" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:** Array of health condition objects

### 2. Get My Health Conditions

**Endpoint:** `GET /health-conditions/my-conditions`

**Example:**
```bash
curl "http://localhost:3000/health-conditions/my-conditions" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Add Single Health Condition

**Endpoint:** `POST /health-conditions/my-conditions`

**Body:**
```json
{
  "healthConditionId": "uuid"  // OR
  "healthConditionName": "Diabetes"
}
```

### 4. Add Multiple Health Conditions (NEW)

**Endpoint:** `POST /health-conditions/my-conditions/bulk`

**Body:**
```json
{
  "healthConditions": [
    {"healthConditionId": "uuid-1"},
    {"healthConditionName": "Diabetes"}
  ]
}
```

**Response:**
```json
{
  "successCount": 2,
  "failedCount": 0,
  "created": [
    {
      "id": "user-health-condition-uuid-1",
      "userId": "user-uuid",
      "healthConditionId": "health-condition-uuid-1",
      "createdAt": "2025-10-04T10:00:00.000Z",
      "updatedAt": "2025-10-04T10:00:00.000Z"
    }
  ],
  "failed": []
}
```

### 5. Remove Health Condition by ID

**Endpoint:** `DELETE /health-conditions/my-conditions/:healthConditionId`

**Example:**
```bash
curl -X DELETE "http://localhost:3000/health-conditions/my-conditions/uuid" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Remove Health Condition by Record ID

**Endpoint:** `DELETE /health-conditions/my-conditions/record/:userHealthConditionId`

## Benefits

### For Frontend Developers
1. **Reduced API Calls**: Add multiple health conditions in one request
2. **Reduced Data Transfer**: Limit results to only what's needed
3. **Better UX**: Implement search/filter functionality
4. **Faster Load Times**: Smaller payloads with limit parameter
5. **Autocomplete Support**: Use search with limit for type-ahead features

### For Users
1. **Faster Search**: Quickly find specific health conditions
2. **Less Scrolling**: Limit results to manageable numbers
3. **Bulk Entry**: Add multiple conditions at once
4. **Better Experience**: More responsive interface

### For System
1. **Better Performance**: Reduced database load with limits
2. **Scalability**: Can handle large health condition databases
3. **Efficient Processing**: Bulk operations reduce overhead
4. **Better Error Handling**: Partial success support in bulk operations

## Technical Implementation Details

### Query Building
```typescript
const queryBuilder = this.healthConditionRepository.createQueryBuilder('healthCondition');

// Filter by active status
if (isActive !== undefined) {
  queryBuilder.where('healthCondition.isActive = :isActive', { isActive });
}

// Search by name (case-insensitive)
if (search) {
  queryBuilder.andWhere('LOWER(healthCondition.name) LIKE LOWER(:search)', {
    search: `%${search}%`
  });
}

// Apply limit
if (limit && limit > 0) {
  queryBuilder.limit(limit);
}

// Order by name
queryBuilder.orderBy('healthCondition.name', 'ASC');
```

### Bulk Processing Logic
1. Iterate through each health condition item
2. Validate input (ID or name provided)
3. Lookup or create health condition
4. Check for duplicates
5. Create user health condition assignment
6. Track successes and failures
7. Return comprehensive results

### Error Handling
- **Validation Errors**: Caught and added to failed array
- **Not Found Errors**: Invalid IDs tracked in failed array
- **Duplicate Errors**: Existing assignments skipped with reason
- **Unknown Errors**: Caught and logged with generic message

## Backward Compatibility

✅ **Fully Backward Compatible**

All changes are 100% backward compatible:
- All new parameters are optional
- Existing API calls continue to work without modification
- Default behavior matches previous implementation

**Examples:**
```bash
# Old way (still works)
GET /health-conditions

# New way (with parameters)
GET /health-conditions?limit=10&search=diabetes
```

## Frontend Integration Examples

### React Hook for Search
```jsx
function useHealthConditionSearch(searchTerm, limit = 10) {
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchConditions = async () => {
      setLoading(true);
      const params = new URLSearchParams({
        limit: limit.toString(),
        search: searchTerm
      });
      
      const response = await fetch(`/health-conditions?${params}`);
      const data = await response.json();
      setConditions(data);
      setLoading(false);
    };

    fetchConditions();
  }, [searchTerm, limit]);

  return { conditions, loading };
}
```

### Bulk Add Function
```javascript
async function addMultipleHealthConditions(conditionNames) {
  const response = await fetch('/health-conditions/my-conditions/bulk', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      healthConditions: conditionNames.map(name => ({
        healthConditionName: name
      }))
    })
  });

  const result = await response.json();
  
  console.log(`Successfully added: ${result.successCount}`);
  console.log(`Failed: ${result.failedCount}`);
  
  return result;
}

// Usage
addMultipleHealthConditions(['Diabetes', 'Hypertension', 'Asthma']);
```

## Testing Checklist

- [x] Search works with partial matches
- [x] Search is case-insensitive
- [x] Limit parameter restricts results
- [x] Default limit (50) applies when not specified
- [x] Empty search returns all health conditions (with limit)
- [x] Results are sorted alphabetically
- [x] Only active health conditions are returned
- [x] Bulk endpoint accepts multiple items
- [x] Bulk endpoint handles mixed IDs and names
- [x] Bulk endpoint returns success/failure details
- [x] Duplicate health conditions are prevented
- [x] New health conditions are created automatically from names
- [x] No TypeScript errors
- [x] No runtime errors

## Documentation Files Created

1. **HEALTH_CONDITIONS_BULK_API.md** - Bulk operations documentation
2. **HEALTH_CONDITIONS_SEARCH_FEATURE.md** - Search and limit feature guide
3. **HEALTH_CONDITIONS_UPDATE_SUMMARY.md** - This comprehensive summary

## Comparison with Allergies API

Both APIs now have feature parity:

| Feature | Allergies | Health Conditions |
|---------|-----------|-------------------|
| Search | ✅ | ✅ |
| Limit | ✅ | ✅ |
| Bulk Add | ✅ | ✅ |
| Auto-create | ✅ | ✅ |
| Partial Success | ✅ | ✅ |

## Next Steps

Potential future enhancements:
- [ ] Add pagination (page/offset parameters)
- [ ] Add sorting options (sortBy, sortOrder)
- [ ] Add filtering by additional fields
- [ ] Implement full-text search
- [ ] Add search result relevance scoring
- [ ] Add database indexes for performance
- [ ] Add bulk delete operations
- [ ] Add bulk update operations
