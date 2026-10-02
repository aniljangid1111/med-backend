# Allergies Controller API Documentation

## Overview
This controller provides user-facing endpoints for managing allergies. Users can view available allergies, add them to their profile, and remove them. Each allergy includes detailed information such as category, severity, symptoms, and emergency information.

## Authentication
All endpoints require JWT authentication. The user is automatically identified from the authentication token using the `@CurrentUser()` decorator.

## Base URL
```
/allergies
```

---

## Endpoints

### 1. Get All Available Allergies
**Endpoint:** `GET /allergies`

**Description:** Retrieves all active allergies available in the system with optional filtering and limiting.

**Authentication:** Required

**Query Parameters:**
- `limit` (optional, number): Maximum number of results to return. Default: 50
- `search` (optional, string): Search term to filter allergies by name, description, or category (case-insensitive)

**Request:**
```http
GET /allergies?limit=10&search=peanut
Authorization: Bearer <jwt_token>
```

**Examples:**
```http
# Get all allergies (default limit of 50)
GET /allergies

# Get first 10 allergies
GET /allergies?limit=10

# Search for allergies containing "peanut"
GET /allergies?search=peanut

# Search with custom limit
GET /allergies?limit=5&search=food
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Peanuts",
    "description": "Allergy to peanuts and peanut-containing products",
    "category": "food",
    "allergenType": "legume",
    "commonSymptoms": "Hives, swelling, difficulty breathing, anaphylaxis",
    "severity": "severe",
    "crossReactivity": "Other legumes (peas, lentils, soybeans)",
    "avoidanceAdvice": "Read all food labels carefully, avoid cross-contamination in kitchens",
    "requiresEpiPen": true,
    "emergencyInfo": "Use epinephrine immediately if anaphylaxis occurs, call 911",
    "isActive": true,
    "createdAt": "2025-10-04T10:00:00.000Z",
    "updatedAt": "2025-10-04T10:00:00.000Z"
  },
  {
    "id": "uuid",
    "name": "Pollen",
    "description": "Seasonal allergic rhinitis caused by tree, grass, or weed pollen",
    "category": "environmental",
    "allergenType": "pollen",
    "commonSymptoms": "Sneezing, runny nose, itchy eyes, congestion",
    "severity": "mild",
    "crossReactivity": "Oral allergy syndrome with certain fruits and vegetables",
    "avoidanceAdvice": "Stay indoors during high pollen count days, use air purifiers",
    "requiresEpiPen": false,
    "emergencyInfo": null,
    "isActive": true,
    "createdAt": "2025-10-04T10:00:00.000Z",
    "updatedAt": "2025-10-04T10:00:00.000Z"
  }
]
```

**Status Codes:**
- `200 OK` - Success

**Allergy Categories:**
- `food` - Food allergies (e.g., peanuts, shellfish, dairy)
- `medication` - Drug allergies (e.g., penicillin, aspirin)
- `environmental` - Environmental allergies (e.g., pollen, dust, mold)
- `insect` - Insect sting/bite allergies (e.g., bee stings, ant bites)
- `latex` - Latex allergies
- `other` - Other types of allergies

**Severity Levels:**
- `mild` - Minor discomfort, easily managed
- `moderate` - Significant symptoms requiring medication
- `severe` - Serious reactions requiring immediate medical attention
- `life-threatening` - Risk of anaphylaxis, requires epinephrine

---

### 2. Get My Allergies
**Endpoint:** `GET /allergies/my-allergies`

**Description:** Retrieves all allergies assigned to the current user.

**Authentication:** Required

**Request:**
```http
GET /allergies/my-allergies
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": "user-allergy-uuid",
    "userId": "user-uuid",
    "allergyId": "allergy-uuid",
    "createdAt": "2025-10-04T10:00:00.000Z",
    "updatedAt": "2025-10-04T10:00:00.000Z",
    "allergy": {
      "id": "allergy-uuid",
      "name": "Peanuts",
      "description": "Allergy to peanuts and peanut-containing products",
      "category": "food",
      "allergenType": "legume",
      "commonSymptoms": "Hives, swelling, difficulty breathing, anaphylaxis",
      "severity": "severe",
      "crossReactivity": "Other legumes (peas, lentils, soybeans)",
      "avoidanceAdvice": "Read all food labels carefully, avoid cross-contamination in kitchens",
      "requiresEpiPen": true,
      "emergencyInfo": "Use epinephrine immediately if anaphylaxis occurs, call 911",
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

### 3. Add Allergy to My Profile
**Endpoint:** `POST /allergies/my-allergies`

**Description:** Adds an allergy to the current user's profile. You can either:
- Provide an existing `allergyId` to add an existing allergy
- Provide an `allergyName` to add or create a new allergy

**Authentication:** Required

**Request Body (Option A - Using existing allergy ID):**
```json
{
  "allergyId": "uuid"
}
```

**Request Body (Option B - Using allergy name):**
```json
{
  "allergyName": "Shellfish"
}
```

**Request Example:**
```http
POST /allergies/my-allergies
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "allergyName": "Peanuts"
}
```

**Response:**
```json
{
  "id": "user-allergy-uuid",
  "userId": "user-uuid",
  "allergyId": "allergy-uuid",
  "createdAt": "2025-10-04T10:00:00.000Z",
  "updatedAt": "2025-10-04T10:00:00.000Z"
}
```

**Status Codes:**
- `201 Created` - Allergy successfully added
- `400 Bad Request` - Invalid input (neither field provided or both provided)
- `404 Not Found` - Allergy ID not found (when using allergyId)
- `409 Conflict` - User already has this allergy assigned

**Validation Rules:**
- At least one field (`allergyId` or `allergyName`) must be provided
- `allergyId` must be a valid UUID
- `allergyName` must be a non-empty string

---

### 4. Remove Allergy from My Profile (by Allergy ID)
**Endpoint:** `DELETE /allergies/my-allergies/:allergyId`

**Description:** Removes an allergy from the current user's profile using the allergy ID.

**Authentication:** Required

**Path Parameters:**
- `allergyId` (UUID, required) - The ID of the allergy to remove

**Request:**
```http
DELETE /allergies/my-allergies/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Allergy successfully removed from user"
}
```

**Status Codes:**
- `200 OK` - Allergy successfully removed
- `400 Bad Request` - Invalid UUID format
- `404 Not Found` - Allergy assignment not found

---

### 5. Remove Allergy from My Profile (by Record ID)
**Endpoint:** `DELETE /allergies/my-allergies/record/:userAllergyId`

**Description:** Removes a user allergy record by its unique record ID. This is useful when you have the specific user-allergy relationship ID.

**Authentication:** Required

**Path Parameters:**
- `userAllergyId` (UUID, required) - The ID of the user allergy record

**Request:**
```http
DELETE /allergies/my-allergies/record/660e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Allergy successfully removed from user"
}
```

**Status Codes:**
- `200 OK` - Allergy successfully removed
- `400 Bad Request` - Invalid UUID format
- `404 Not Found` - User allergy record not found

---

## Usage Examples

### Example 1: View All Available Allergies
```bash
curl -X GET \
  http://localhost:3000/allergies \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Example 2: View My Allergies
```bash
curl -X GET \
  http://localhost:3000/allergies/my-allergies \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Example 3: Add an Allergy (Using Existing ID)
```bash
curl -X POST \
  http://localhost:3000/allergies/my-allergies \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
    "allergyId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

### Example 4: Add an Allergy (Using Name - Will Create if Doesn't Exist)
```bash
curl -X POST \
  http://localhost:3000/allergies/my-allergies \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
    "allergyName": "Shellfish"
  }'
```

### Example 5: Remove an Allergy (By Allergy ID)
```bash
curl -X DELETE \
  http://localhost:3000/allergies/my-allergies/550e8400-e29b-41d4-a716-446655440000 \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Example 6: Remove an Allergy (By Record ID)
```bash
curl -X DELETE \
  http://localhost:3000/allergies/my-allergies/record/660e8400-e29b-41d4-a716-446655440000 \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Either allergyId or allergyName must be provided",
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
  "message": "Allergy with ID \"uuid\" not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "User already has this allergy assigned",
  "error": "Conflict"
}
```

---

## User Flow Examples

### Flow 1: User Adds Their First Allergy
1. User logs in and receives JWT token
2. User views available allergies: `GET /allergies`
3. User selects "Peanuts" and adds it: `POST /allergies/my-allergies` with `allergyName: "Peanuts"`
4. System returns the created user-allergy relationship with full allergy details

### Flow 2: User Views and Manages Their Allergies
1. User views their allergies: `GET /allergies/my-allergies`
2. User sees list including allergy IDs and detailed information (severity, symptoms, emergency info)
3. User decides to remove one: `DELETE /allergies/my-allergies/:allergyId`
4. System confirms removal

### Flow 3: User Adds a Custom Allergy
1. User wants to add "Latex" which doesn't exist in the system
2. User posts: `POST /allergies/my-allergies` with `allergyName: "Latex"`
3. System creates the new allergy and assigns it to the user
4. User receives confirmation

### Flow 4: Emergency Situation - Quick Access to Allergy Info
1. Medical professional accesses patient's allergy list: `GET /allergies/my-allergies`
2. System returns all allergies with:
   - Severity levels
   - Common symptoms
   - Emergency information
   - Whether EpiPen is required
   - Cross-reactivity information
3. Medical professional can quickly identify life-threatening allergies

---

## Integration with Frontend

### React/Vue Example
```typescript
// Fetch user's allergies
const fetchMyAllergies = async () => {
  const response = await fetch('/allergies/my-allergies', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const allergies = await response.json();
  return allergies;
};

// Add an allergy
const addAllergy = async (name: string) => {
  const response = await fetch('/allergies/my-allergies', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ allergyName: name })
  });
  return await response.json();
};

// Remove an allergy
const removeAllergy = async (allergyId: string) => {
  const response = await fetch(`/allergies/my-allergies/${allergyId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
};

// Filter severe allergies for emergency display
const getSevereAllergies = (allergies: UserAllergy[]) => {
  return allergies.filter(ua => 
    ua.allergy.severity === 'severe' || 
    ua.allergy.severity === 'life-threatening' ||
    ua.allergy.requiresEpiPen
  );
};
```

### Medical Emergency Component Example
```typescript
// Emergency Allergy Card Component
const EmergencyAllergyCard = ({ allergy }) => {
  return (
    <div className={`allergy-card ${allergy.requiresEpiPen ? 'critical' : ''}`}>
      <h3>{allergy.name}</h3>
      <div className="severity">
        Severity: <span className={`badge-${allergy.severity}`}>
          {allergy.severity?.toUpperCase()}
        </span>
      </div>
      
      {allergy.requiresEpiPen && (
        <div className="epipen-warning">
          ⚠️ REQUIRES EPIPEN
        </div>
      )}
      
      <div className="symptoms">
        <strong>Symptoms:</strong> {allergy.commonSymptoms}
      </div>
      
      {allergy.emergencyInfo && (
        <div className="emergency-info">
          <strong>Emergency Action:</strong> {allergy.emergencyInfo}
        </div>
      )}
      
      {allergy.crossReactivity && (
        <div className="cross-reactivity">
          <strong>Cross-Reactivity:</strong> {allergy.crossReactivity}
        </div>
      )}
    </div>
  );
};
```

---

## Medical Alert Features

### Critical Information Display
When displaying allergies in a medical context, prioritize:

1. **Life-Threatening Allergies First**
   - Filter by `severity: "life-threatening"` or `requiresEpiPen: true`
   - Display prominently with red/warning colors

2. **Emergency Information**
   - Show `emergencyInfo` field immediately
   - Highlight if EpiPen is required

3. **Symptoms Recognition**
   - Display `commonSymptoms` for quick identification
   - Include `crossReactivity` to avoid related allergens

4. **Category Grouping**
   - Group by `category` for organized display:
     - Food allergies
     - Medication allergies
     - Environmental allergies
     - etc.

### Example Emergency Display Filter
```typescript
// Fetch and categorize allergies for emergency display
const getEmergencyAllergyInfo = async () => {
  const allergies = await fetchMyAllergies();
  
  return {
    critical: allergies.filter(a => 
      a.allergy.requiresEpiPen || 
      a.allergy.severity === 'life-threatening'
    ),
    severe: allergies.filter(a => 
      a.allergy.severity === 'severe'
    ),
    moderate: allergies.filter(a => 
      a.allergy.severity === 'moderate'
    ),
    byCategory: {
      food: allergies.filter(a => a.allergy.category === 'food'),
      medication: allergies.filter(a => a.allergy.category === 'medication'),
      environmental: allergies.filter(a => a.allergy.category === 'environmental'),
      insect: allergies.filter(a => a.allergy.category === 'insect'),
      latex: allergies.filter(a => a.allergy.category === 'latex'),
      other: allergies.filter(a => a.allergy.category === 'other'),
    }
  };
};
```

---

## Notes
- All endpoints require authentication
- The current user is automatically determined from the JWT token
- Allergies are automatically created when a user provides a new name (though it's recommended to pre-populate common allergies with detailed information)
- Users cannot add the same allergy twice
- Removing an allergy doesn't delete the allergy itself, only the user's association with it
- Allergy information includes critical medical details that should be easily accessible in emergency situations
- The `requiresEpiPen` field is crucial for emergency responders
- Cross-reactivity information helps users and medical professionals avoid related allergens

---

## Best Practices

### For Frontend Developers
1. **Always display severe/life-threatening allergies prominently**
2. **Show EpiPen requirement clearly**
3. **Make emergency information easily accessible**
4. **Use color coding for severity levels**
5. **Include search/filter functionality by category**
6. **Provide quick-add functionality for common allergies**

### For Medical Professional Interface
1. **Emergency view should show critical allergies first**
2. **Print-friendly format for medical records**
3. **Export functionality for sharing with healthcare providers**
4. **QR code generation for quick access in emergencies**

### For Users
1. **Keep allergy list up to date**
2. **Include all known allergies, even mild ones**
3. **Review and update severity levels with healthcare provider**
4. **Ensure emergency contact information is current**
