# Dashboard Controller

The Dashboard Controller provides endpoints for retrieving user health and habit statistics and detailed data.

## Endpoints

### GET `/dashboard/stats`

Get statistics for user's health habits and habits for a specific date.

#### Authentication
Requires authentication via `@CurrentUser` decorator.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | No | Date in ISO 8601 format (e.g., `2024-10-04` or `2024-10-04T00:00:00Z`). If not provided, defaults to today. |

#### Response

```json
{
  "total_healths": 5,
  "total_habits": 3,
  "total_filled_healths": 4,
  "total_filled_habits": 2,
  "date": "2024-10-04"
}
```

#### Response Fields

- `total_healths`: Total number of health habits selected (favorited) by the user
- `total_habits`: Total number of habits selected (favorited) by the user
- `total_filled_healths`: Number of health habits that have been filled in for the specified date
- `total_filled_habits`: Number of habits that have been filled in for the specified date
- `date`: The date for which stats were calculated (YYYY-MM-DD format)

#### Example Requests

**Get stats for today:**

```bash
GET /dashboard/stats
```

**Get stats for a specific date:**

```bash
GET /dashboard/stats?date=2024-10-04
```

**Get stats with full ISO timestamp:**

```bash
GET /dashboard/stats?date=2024-10-04T00:00:00Z
```

---

### GET `/dashboard/health-habits`

Get favorite health habits with their data for a specific date, separated into health and habits arrays. Returns up to 4 health habits and 4 habits. If data is not filled for a particular health habit, the `data` field will be `null`.

#### Authentication
Requires authentication via `@CurrentUser` decorator.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | No | Date in ISO 8601 format (e.g., `2024-10-04` or `2024-10-04T00:00:00Z`). If not provided, defaults to today. |

#### Response

```json
{
  "date": "2024-10-04",
  "healths": [
    {
      "id": "uuid-1",
      "healthHabitId": "1",
      "healthHabit": {
        "id": 1,
        "name": "Blood Pressure",
        "description": "Monitor blood pressure levels",
        "icon": "https://example.com/icon.png",
        "bgImage": "https://example.com/bg.png",
        "color": "#FF5733",
        "type": "health"
      },
      "data": [
        {
          "id": "data-uuid-1",
          "resultValue": "120/80",
          "numericResult": 120,
          "unitUsed": "mmHg",
          "contextNote": "Measured after morning exercise",
          "reportedAt": "2024-10-04T08:30:00Z",
          "componentDefinition": {
            "id": "comp-uuid-1",
            "componentName": "Systolic",
            "resultType": "QUANTITATIVE",
            "normalRangeText": "90-120 mmHg"
          }
        }
      ]
    },
    {
      "id": "uuid-2",
      "healthHabitId": "2",
      "healthHabit": {
        "id": 2,
        "name": "Blood Sugar",
        "description": "Track blood glucose levels",
        "icon": "https://example.com/sugar-icon.png",
        "bgImage": "https://example.com/sugar-bg.png",
        "color": "#E74C3C",
        "type": "health"
      },
      "data": null
    }
  ],
  "habits": [
    {
      "id": "uuid-3",
      "healthHabitId": "3",
      "healthHabit": {
        "id": 3,
        "name": "Water Intake",
        "description": "Track daily water consumption",
        "icon": "https://example.com/water-icon.png",
        "bgImage": "https://example.com/water-bg.png",
        "color": "#3498DB",
        "type": "habit"
      },
      "data": [
        {
          "id": "data-uuid-2",
          "resultValue": "2000ml",
          "numericResult": 2000,
          "unitUsed": "ml",
          "contextNote": null,
          "reportedAt": "2024-10-04T14:30:00Z",
          "componentDefinition": {
            "id": "comp-uuid-2",
            "componentName": "Volume",
            "resultType": "QUANTITATIVE",
            "normalRangeText": "2000-3000 ml"
          }
        }
      ]
    }
  ]
}
```

#### Response Fields

- `date`: The date for which data was retrieved (YYYY-MM-DD format)
- `healths`: Array of up to 4 favorite health habits (type: "health") with their data
- `habits`: Array of up to 4 favorite habits (type: "habit") with their data

Each health habit/habit object contains:
  - `id`: User health habit ID
  - `healthHabitId`: Health habit ID
  - `healthHabit`: Health habit details
    - `id`: Health habit ID
    - `name`: Health habit name
    - `description`: Health habit description
    - `icon`: URL to habit icon
    - `bgImage`: URL to background image
    - `color`: Theme color for the habit
    - `type`: Either "health" or "habit"
  - `data`: Array of data entries for the date, or `null` if no data exists
    - `id`: Data entry ID
    - `resultValue`: The recorded result value
    - `numericResult`: Numeric representation of the result (if applicable)
    - `unitUsed`: Unit of measurement used
    - `contextNote`: Additional context or notes
    - `reportedAt`: Timestamp when the data was recorded
    - `componentDefinition`: Component definition details
      - `id`: Component definition ID
      - `componentName`: Name of the component
      - `resultType`: Type of result (QUANTITATIVE, QUALITATIVE, TEXTUAL, CALCULATED)
      - `normalRangeText`: Normal range description

#### Example Requests

**Get health habits with data for today:**
```bash
GET /dashboard/health-habits
```

**Get health habits with data for a specific date:**
```bash
GET /dashboard/health-habits?date=2024-10-04
```

**Get health habits with full ISO timestamp:**
```bash
GET /dashboard/health-habits?date=2024-10-04T00:00:00Z
```

#### Notes

- Only returns health habits that are:
  - Marked as favorite (`isFavorite = true`) by the user
  - Active (`isActive = true`)
- Returns up to 4 health habits and 4 habits separately
- Health habits and habits are sorted alphabetically by name
- Data entries are sorted by `reportedAt` in descending order (most recent first)
- If no data exists for a health habit on the specified date, the `data` field will be `null`
- Multiple data entries can exist for the same health habit on a single date

---

## Error Responses

**400 Bad Request - Invalid date format:**
```json
{
  "statusCode": 400,
  "message": "Invalid date format. Please use ISO 8601 format (e.g., 2024-10-04 or 2024-10-04T00:00:00Z).",
  "error": "Bad Request"
}
```

**400 Bad Request - Invalid date:**
```json
{
  "statusCode": 400,
  "message": "Invalid date provided.",
  "error": "Bad Request"
}
```

## Implementation Details

- Only counts health habits and habits that are:
  - Marked as favorite (`isFavorite = true`) by the user
  - Active (`isActive = true`)
- The filled counts represent unique health habits that have at least one data entry for the specified date
- Date filtering uses UTC timezone and covers the full day (00:00:00 to 23:59:59)

## Dependencies

- `UserHealtHabitService`: Provides service methods for health habit operations
  - `getUserHealthHabitStatsByDate`: Get statistics for health habits
  - `getUserFavoriteHealthHabitsWithData`: Get favorite health habits with their data
- `@CurrentUser` decorator: Extracts the authenticated user from the request
- `class-validator`: Validates ISO 8601 date format
