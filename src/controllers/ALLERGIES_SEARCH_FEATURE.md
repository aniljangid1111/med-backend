# Allergies Search and Limit Feature

## Overview
The `GET /allergies` endpoint now supports search and limit functionality to help users find and filter allergies more efficiently.

## Features

### 1. Limit Results
Control the maximum number of allergies returned.

**Default:** 50 allergies

**Usage:**
```bash
# Get only 10 allergies
GET /allergies?limit=10

# Get 100 allergies
GET /allergies?limit=100
```

### 2. Search Functionality
Search allergies by name, description, or category (case-insensitive).

**Search Fields:**
- Allergy name
- Description
- Category

**Usage:**
```bash
# Search for "peanut" in name, description, or category
GET /allergies?search=peanut

# Search for "food" related allergies
GET /allergies?search=food

# Search for "severe" allergies
GET /allergies?search=severe
```

### 3. Combined Search and Limit
Use both parameters together for precise results.

**Usage:**
```bash
# Search for "food" and limit to 5 results
GET /allergies?search=food&limit=5

# Search for "pollen" and limit to 3 results
GET /allergies?search=pollen&limit=3
```

## API Examples

### Example 1: Get All Allergies (Default)
```bash
curl -X GET "http://localhost:3000/allergies" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:** Returns up to 50 active allergies, ordered alphabetically by name.

### Example 2: Limit Results
```bash
curl -X GET "http://localhost:3000/allergies?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:** Returns only the first 10 allergies.

### Example 3: Search by Name
```bash
curl -X GET "http://localhost:3000/allergies?search=peanut" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Peanuts",
    "description": "Allergy to peanuts and peanut-containing products",
    "category": "food",
    "allergenType": "legume",
    "commonSymptoms": "Hives, swelling, difficulty breathing, anaphylaxis",
    "severity": "severe",
    "crossReactivity": "Other legumes (peas, lentils, soybeans)",
    "avoidanceAdvice": "Read all food labels carefully",
    "requiresEpiPen": true,
    "emergencyInfo": "Use epinephrine immediately if anaphylaxis occurs",
    "isActive": true,
    "createdAt": "2025-10-04T10:00:00.000Z",
    "updatedAt": "2025-10-04T10:00:00.000Z"
  }
]
```

### Example 4: Search by Category
```bash
curl -X GET "http://localhost:3000/allergies?search=food" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:** Returns all allergies with "food" in their name, description, or category.

### Example 5: Combined Search and Limit
```bash
curl -X GET "http://localhost:3000/allergies?search=shell&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:** Returns up to 5 allergies matching "shell" (e.g., shellfish).

### Example 6: Search with Special Characters
```bash
# URL encode special characters
curl -X GET "http://localhost:3000/allergies?search=bee%20sting" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Query Parameters

| Parameter | Type   | Required | Default | Description                                           |
|-----------|--------|----------|---------|-------------------------------------------------------|
| limit     | number | No       | 50      | Maximum number of results to return                   |
| search    | string | No       | -       | Search term (searches name, description, and category)|

## Response

The response is always an array of allergy objects, sorted alphabetically by name.

**Success Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "category": "string",
    "allergenType": "string",
    "commonSymptoms": "string",
    "severity": "string",
    "crossReactivity": "string",
    "avoidanceAdvice": "string",
    "requiresEpiPen": boolean,
    "emergencyInfo": "string",
    "isActive": boolean,
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
]
```

**Empty Results:**
If no allergies match the search criteria, an empty array is returned:
```json
[]
```

## Search Behavior

### Case Insensitive
The search is case-insensitive, so these queries are equivalent:
- `?search=peanut`
- `?search=PEANUT`
- `?search=Peanut`

### Partial Matching
The search uses partial matching (LIKE %term%), so:
- `?search=pea` will match "Peanuts", "Peas", "Peacock feathers", etc.
- `?search=shell` will match "Shellfish", "Eggshells", etc.

### Multiple Fields
Each allergy is searched across three fields:
1. **name** - The allergy name
2. **description** - Detailed description
3. **category** - Category (e.g., "food", "environmental", "medication")

## Use Cases

### 1. Autocomplete/Type-ahead
```javascript
// User types "pea" in search box
fetch('/allergies?search=pea&limit=10')
  .then(res => res.json())
  .then(allergies => {
    // Show dropdown with: Peanuts, Peas, etc.
  });
```

### 2. Category Filtering
```javascript
// Show only food allergies
fetch('/allergies?search=food&limit=20')
  .then(res => res.json())
  .then(allergies => {
    // Display food-related allergies
  });
```

### 3. Pagination Simulation
```javascript
// Get first page (10 items)
fetch('/allergies?limit=10')
  
// Note: For true pagination, you would need offset/page parameters
// This limit parameter is useful for "load more" patterns
```

### 4. Quick Search
```javascript
// User searches for "latex"
fetch('/allergies?search=latex&limit=5')
  .then(res => res.json())
  .then(allergies => {
    // Show top 5 latex-related allergies
  });
```

## Performance Considerations

1. **Default Limit:** The default limit of 50 ensures reasonable response times
2. **Ordering:** Results are always ordered by name (ASC) for consistency
3. **Active Only:** Only active allergies (isActive = true) are returned
4. **Database Index:** Consider adding an index on the `name` column for better search performance

## Future Enhancements

Potential future improvements:
- Pagination with offset/page parameters
- Sorting options (by name, severity, category)
- Filter by severity, category, or requiresEpiPen
- Full-text search capabilities
- Search result highlighting

## Testing Examples

### PowerShell (Windows)
```powershell
# Get all allergies with limit
Invoke-RestMethod -Uri "http://localhost:3000/allergies?limit=10" `
  -Headers @{ Authorization = "Bearer YOUR_TOKEN" }

# Search for allergies
Invoke-RestMethod -Uri "http://localhost:3000/allergies?search=peanut" `
  -Headers @{ Authorization = "Bearer YOUR_TOKEN" }
```

### cURL (Cross-platform)
```bash
# Simple limit
curl "http://localhost:3000/allergies?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Search with limit
curl "http://localhost:3000/allergies?search=food&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### JavaScript/Fetch
```javascript
// With query parameters
const params = new URLSearchParams({
  limit: '10',
  search: 'peanut'
});

fetch(`http://localhost:3000/allergies?${params}`, {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})
  .then(res => res.json())
  .then(data => console.log(data));
```
