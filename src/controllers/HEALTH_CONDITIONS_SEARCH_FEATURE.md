# Health Conditions Search and Limit Feature

## Overview
The `GET /health-conditions` endpoint now supports search and limit functionality to help users find and filter health conditions more efficiently.

## Features

### 1. Limit Results
Control the maximum number of health conditions returned.

**Default:** 50 health conditions

**Usage:**
```bash
# Get only 10 health conditions
GET /health-conditions?limit=10

# Get 100 health conditions
GET /health-conditions?limit=100
```

### 2. Search Functionality
Search health conditions by name (case-insensitive).

**Search Fields:**
- Health condition name

**Usage:**
```bash
# Search for "diabetes"
GET /health-conditions?search=diabetes

# Search for "heart" related conditions
GET /health-conditions?search=heart

# Search for "asthma"
GET /health-conditions?search=asthma
```

### 3. Combined Search and Limit
Use both parameters together for precise results.

**Usage:**
```bash
# Search for "diabetes" and limit to 5 results
GET /health-conditions?search=diabetes&limit=5

# Search for "heart" and limit to 3 results
GET /health-conditions?search=heart&limit=3
```

## API Examples

### Example 1: Get All Health Conditions (Default)
```bash
curl -X GET "http://localhost:3000/health-conditions" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:** Returns up to 50 active health conditions, ordered alphabetically by name.

### Example 2: Limit Results
```bash
curl -X GET "http://localhost:3000/health-conditions?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:** Returns only the first 10 health conditions.

### Example 3: Search by Name
```bash
curl -X GET "http://localhost:3000/health-conditions?search=diabetes" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Type 2 Diabetes",
    "isActive": true,
    "createdAt": "2025-10-04T10:00:00.000Z",
    "updatedAt": "2025-10-04T10:00:00.000Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Type 1 Diabetes",
    "isActive": true,
    "createdAt": "2025-10-04T10:00:00.000Z",
    "updatedAt": "2025-10-04T10:00:00.000Z"
  }
]
```

### Example 4: Combined Search and Limit
```bash
curl -X GET "http://localhost:3000/health-conditions?search=heart&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:** Returns up to 5 health conditions matching "heart" (e.g., heart disease, heart failure).

### Example 5: Search with Special Characters
```bash
# URL encode special characters
curl -X GET "http://localhost:3000/health-conditions?search=crohn%27s" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Query Parameters

| Parameter | Type   | Required | Default | Description                                    |
|-----------|--------|----------|---------|------------------------------------------------|
| limit     | number | No       | 50      | Maximum number of results to return            |
| search    | string | No       | -       | Search term (searches name, case-insensitive)  |

## Response

The response is always an array of health condition objects, sorted alphabetically by name.

**Success Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "name": "string",
    "isActive": boolean,
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
]
```

**Empty Results:**
If no health conditions match the search criteria, an empty array is returned:
```json
[]
```

## Search Behavior

### Case Insensitive
The search is case-insensitive, so these queries are equivalent:
- `?search=diabetes`
- `?search=DIABETES`
- `?search=Diabetes`

### Partial Matching
The search uses partial matching (LIKE %term%), so:
- `?search=dia` will match "Diabetes", "Diarrhea", etc.
- `?search=heart` will match "Heart Disease", "Heart Failure", etc.

## Use Cases

### 1. Autocomplete/Type-ahead
```javascript
// User types "dia" in search box
fetch('/health-conditions?search=dia&limit=10')
  .then(res => res.json())
  .then(conditions => {
    // Show dropdown with: Diabetes, Diarrhea, etc.
  });
```

### 2. Quick Search
```javascript
// User searches for "asthma"
fetch('/health-conditions?search=asthma&limit=5')
  .then(res => res.json())
  .then(conditions => {
    // Show top 5 asthma-related conditions
  });
```

### 3. Pagination Simulation
```javascript
// Get first page (10 items)
fetch('/health-conditions?limit=10')
  
// Note: For true pagination, you would need offset/page parameters
// This limit parameter is useful for "load more" patterns
```

## Performance Considerations

1. **Default Limit:** The default limit of 50 ensures reasonable response times
2. **Ordering:** Results are always ordered by name (ASC) for consistency
3. **Active Only:** Only active health conditions (isActive = true) are returned
4. **Database Index:** Consider adding an index on the `name` column for better search performance

## Future Enhancements

Potential future improvements:
- Pagination with offset/page parameters
- Sorting options (by name, creation date)
- Filter by isActive status
- Full-text search capabilities
- Search result highlighting
- Category/type filtering if added to the schema

## Testing Examples

### PowerShell (Windows)
```powershell
# Get all health conditions with limit
Invoke-RestMethod -Uri "http://localhost:3000/health-conditions?limit=10" `
  -Headers @{ Authorization = "Bearer YOUR_TOKEN" }

# Search for health conditions
Invoke-RestMethod -Uri "http://localhost:3000/health-conditions?search=diabetes" `
  -Headers @{ Authorization = "Bearer YOUR_TOKEN" }
```

### cURL (Cross-platform)
```bash
# Simple limit
curl "http://localhost:3000/health-conditions?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Search with limit
curl "http://localhost:3000/health-conditions?search=heart&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### JavaScript/Fetch
```javascript
// With query parameters
const params = new URLSearchParams({
  limit: '10',
  search: 'diabetes'
});

fetch(`http://localhost:3000/health-conditions?${params}`, {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})
  .then(res => res.json())
  .then(data => console.log(data));
```

## Integration with Frontend

### React Example
```jsx
function HealthConditionSearch() {
  const [search, setSearch] = useState('');
  const [conditions, setConditions] = useState([]);
  
  useEffect(() => {
    const params = new URLSearchParams({
      limit: '10',
      search: search
    });
    
    fetch(`/health-conditions?${params}`)
      .then(res => res.json())
      .then(setConditions);
  }, [search]);
  
  return (
    <div>
      <input 
        type="text" 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search health conditions..."
      />
      <ul>
        {conditions.map(condition => (
          <li key={condition.id}>{condition.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Vue.js Example
```vue
<template>
  <div>
    <input 
      v-model="search" 
      type="text"
      placeholder="Search health conditions..."
    />
    <ul>
      <li v-for="condition in conditions" :key="condition.id">
        {{ condition.name }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      search: '',
      conditions: []
    };
  },
  watch: {
    search(newSearch) {
      this.fetchConditions(newSearch);
    }
  },
  methods: {
    async fetchConditions(searchTerm) {
      const params = new URLSearchParams({
        limit: '10',
        search: searchTerm
      });
      
      const response = await fetch(`/health-conditions?${params}`);
      this.conditions = await response.json();
    }
  }
};
</script>
```
