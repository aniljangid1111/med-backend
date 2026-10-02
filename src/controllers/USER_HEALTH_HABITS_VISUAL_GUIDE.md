# Enhanced API Response Structure - Visual Guide

## Data Hierarchy

```
UserHealthHabit
├── id (UUID)
├── userId (UUID)
├── healthHabitId (number)
├── isFavorite (boolean)
└── healthHabit (HealthHabit)
    ├── id (number)
    ├── name (string)
    ├── description (string)
    ├── type ("health" | "habit")
    ├── icon (string)
    ├── bgImage (string)
    ├── color (string)
    ├── isActive (boolean)
    └── components[] (TestComponent[])
        ├── id (UUID)
        ├── componentName (string)
        ├── resultType ("QUANTITATIVE" | "QUALITATIVE" | "TEXTUAL" | "CALCULATED")
        ├── calculationFormula (string | null)
        ├── normalRangeText (string)
        ├── contextFactors (string | null)
        ├── labTestId (number)
        └── unitReferences[] (LabUnitReference[])
            ├── id (UUID)
            ├── unit (string)
            ├── normalRangeMin (number | null)
            ├── normalRangeMax (number | null)
            ├── conversionFactor (string | null)
            └── componentId (UUID)
```

## UserHealthHabitData Hierarchy

```
UserHealthHabitData
├── id (UUID)
├── healthHabitId (number)
├── userId (UUID)
├── componentDefinitionId (UUID)
├── date (timestamp)
├── resultValue (string)
├── numericResult (number | null)
├── unitUsed (string | null)
├── contextNote (string | null)
├── reportedAt (timestamp)
├── healthHabit (HealthHabit)
│   ├── id (number)
│   ├── name (string)
│   ├── type ("health" | "habit")
│   └── components[] (TestComponent[])
│       └── unitReferences[] (LabUnitReference[])
├── componentDefinition (TestComponent)
│   ├── id (UUID)
│   ├── componentName (string)
│   ├── resultType (string)
│   ├── normalRangeText (string)
│   ├── contextFactors (string | null)
│   └── unitReferences[] (LabUnitReference[])
│       ├── unit (string)
│       ├── normalRangeMin (number)
│       ├── normalRangeMax (number)
│       └── conversionFactor (string | null)
└── user (User)
    ├── id (UUID)
    └── email (string)
```

---

## Relationship Diagram

```
┌─────────────────────┐
│   UserHealthHabit   │
│  (User's tracked    │
│   health habits)    │
└──────────┬──────────┘
           │
           │ has one
           ▼
┌─────────────────────┐
│    HealthHabit      │
│  (e.g., Blood Test, │
│   Blood Pressure)   │
└──────────┬──────────┘
           │
           │ has many
           ▼
┌─────────────────────┐
│   TestComponent     │
│ (e.g., Hemoglobin,  │
│  Systolic Pressure) │
└──────────┬──────────┘
           │
           │ has many
           ▼
┌─────────────────────┐
│ LabUnitReference    │
│ (e.g., g/dL, mmHg,  │
│   with ranges)      │
└─────────────────────┘
```

---

## Data Flow for Filling Health Data

```
1. User selects Health Habit
   ↓
2. App fetches Health Habit with Components
   GET /api/v1/user-health-habits
   ↓
3. User sees all available Test Components
   (e.g., Systolic, Diastolic for Blood Pressure)
   ↓
4. User fills values for specific Component
   ↓
5. App submits data with componentDefinitionId
   POST /api/v1/user-health-habits/data
   {
     "healthHabitId": 1,
     "componentDefinitionId": "uuid",
     "resultValue": "120",
     "numericResult": 120,
     "unitUsed": "mmHg"
   }
   ↓
6. Response includes full hierarchy:
   - UserHealthHabitData entry
   - HealthHabit with all components
   - Specific ComponentDefinition used
   - All unit references for validation
```

---

## Example: Blood Pressure Health Habit

### Complete Structure

```json
{
  "id": "user-habit-uuid",
  "userId": "user-uuid",
  "healthHabitId": 1,
  "isFavorite": true,
  "healthHabit": {
    "id": 1,
    "name": "Blood Pressure",
    "description": "Monitor cardiovascular health",
    "type": "health",
    "icon": "bp-icon.svg",
    "color": "#FF5733",
    "isActive": true,
    "components": [
      {
        "id": "comp-uuid-1",
        "componentName": "Systolic Pressure",
        "resultType": "QUANTITATIVE",
        "calculationFormula": null,
        "normalRangeText": "90-120 mmHg",
        "contextFactors": "At rest, seated",
        "labTestId": 1,
        "unitReferences": [
          {
            "id": "unit-uuid-1",
            "unit": "mmHg",
            "normalRangeMin": 90,
            "normalRangeMax": 120,
            "conversionFactor": null,
            "componentId": "comp-uuid-1"
          }
        ]
      },
      {
        "id": "comp-uuid-2",
        "componentName": "Diastolic Pressure",
        "resultType": "QUANTITATIVE",
        "calculationFormula": null,
        "normalRangeText": "60-80 mmHg",
        "contextFactors": "At rest, seated",
        "labTestId": 1,
        "unitReferences": [
          {
            "id": "unit-uuid-2",
            "unit": "mmHg",
            "normalRangeMin": 60,
            "normalRangeMax": 80,
            "conversionFactor": null,
            "componentId": "comp-uuid-2"
          }
        ]
      },
      {
        "id": "comp-uuid-3",
        "componentName": "Pulse Pressure",
        "resultType": "CALCULATED",
        "calculationFormula": "component:Systolic - component:Diastolic",
        "normalRangeText": "30-50 mmHg",
        "contextFactors": null,
        "labTestId": 1,
        "unitReferences": [
          {
            "id": "unit-uuid-3",
            "unit": "mmHg",
            "normalRangeMin": 30,
            "normalRangeMax": 50,
            "conversionFactor": null,
            "componentId": "comp-uuid-3"
          }
        ]
      }
    ]
  }
}
```

### What This Enables

1. **Smart Form**:
   - App shows 2 input fields (Systolic, Diastolic)
   - Pulse Pressure is auto-calculated
   - Each field shows its normal range

2. **Real-time Validation**:
   - User enters 140 for Systolic → Warning: Above normal (120)
   - User enters 70 for Diastolic → OK: Within normal (60-80)
   - Pulse Pressure = 70 → Warning: Above normal (50)

3. **Historical View**:
   - Chart shows Systolic trend with 90-120 range band
   - Chart shows Diastolic trend with 60-80 range band
   - Color-coded: Green (normal), Yellow (borderline), Red (abnormal)

---

## Example: Complete Blood Count (CBC)

### Structure with Multiple Units

```json
{
  "healthHabit": {
    "name": "Complete Blood Count",
    "components": [
      {
        "componentName": "Hemoglobin",
        "resultType": "QUANTITATIVE",
        "normalRangeText": "13.0-17.0 g/dL (Male)",
        "contextFactors": "Gender-specific",
        "unitReferences": [
          {
            "unit": "g/dL",
            "normalRangeMin": 13.0,
            "normalRangeMax": 17.0,
            "conversionFactor": null
          },
          {
            "unit": "g/L",
            "normalRangeMin": 130,
            "normalRangeMax": 170,
            "conversionFactor": "multiply by 10"
          },
          {
            "unit": "mmol/L",
            "normalRangeMin": 8.1,
            "normalRangeMax": 10.6,
            "conversionFactor": "multiply by 0.6206"
          }
        ]
      }
    ]
  }
}
```

### Multi-Unit Support

User enters: `14.5 g/dL`

App can convert to:

- **g/L**: 14.5 × 10 = 145 g/L ✅
- **mmol/L**: 14.5 × 0.6206 = 9.0 mmol/L ✅

All three units validate against their respective ranges!

---

## ResultType Examples

### QUANTITATIVE

```json
{
  "componentName": "Blood Glucose",
  "resultType": "QUANTITATIVE",
  "normalRangeText": "70-100 mg/dL (fasting)",
  "unitReferences": [
    {
      "unit": "mg/dL",
      "normalRangeMin": 70,
      "normalRangeMax": 100
    }
  ]
}
```

→ Input: Numeric value, validated against range

### QUALITATIVE

```json
{
  "componentName": "HIV Test",
  "resultType": "QUALITATIVE",
  "normalRangeText": "Negative",
  "unitReferences": []
}
```

→ Input: Dropdown (Positive/Negative/Indeterminate)

### TEXTUAL

```json
{
  "componentName": "Blood Group",
  "resultType": "TEXTUAL",
  "normalRangeText": "A+, A-, B+, B-, AB+, AB-, O+, O-",
  "unitReferences": []
}
```

→ Input: Text or dropdown with options

### CALCULATED

```json
{
  "componentName": "BMI",
  "resultType": "CALCULATED",
  "calculationFormula": "component:Weight / (component:Height * component:Height)",
  "normalRangeText": "18.5-24.9",
  "unitReferences": [
    {
      "unit": "kg/m²",
      "normalRangeMin": 18.5,
      "normalRangeMax": 24.9
    }
  ]
}
```

→ Input: Auto-calculated from other components

---

## Query Performance

### Before Enhancement

```
Query 1: Get UserHealthHabit
Query 2: Get HealthHabit details
Query 3: Get TestComponents
Query 4: Get LabUnitReferences for each component
Total: 4+ queries (N+1 problem)
```

### After Enhancement

```
Single Query: Get UserHealthHabit with ALL joins
- healthHabit
- healthHabit.components
- components.unitReferences
Total: 1 query ✅
```

**Performance Gain**: 75% reduction in database queries!

---

## Client Implementation Example

```typescript
// TypeScript interface for the enhanced response
interface UserHealthHabit {
  id: string;
  userId: string;
  healthHabitId: number;
  isFavorite: boolean;
  healthHabit: HealthHabit;
}

interface HealthHabit {
  id: number;
  name: string;
  description: string;
  type: 'health' | 'habit';
  isActive: boolean;
  components: TestComponent[];
}

interface TestComponent {
  id: string;
  componentName: string;
  resultType: 'QUANTITATIVE' | 'QUALITATIVE' | 'TEXTUAL' | 'CALCULATED';
  calculationFormula: string | null;
  normalRangeText: string;
  contextFactors: string | null;
  labTestId: number;
  unitReferences: LabUnitReference[];
}

interface LabUnitReference {
  id: string;
  unit: string;
  normalRangeMin: number | null;
  normalRangeMax: number | null;
  conversionFactor: string | null;
  componentId: string;
}

// Usage
const habits = await fetch('/api/v1/user-health-habits', {
  headers: { Authorization: `Bearer ${token}` },
}).then((r) => r.json());

// Access components directly
habits.data.forEach((habit) => {
  console.log(`Health Habit: ${habit.healthHabit.name}`);
  habit.healthHabit.components.forEach((component) => {
    console.log(`  Component: ${component.componentName}`);
    component.unitReferences.forEach((unit) => {
      console.log(
        `    Unit: ${unit.unit} (${unit.normalRangeMin}-${unit.normalRangeMax})`,
      );
    });
  });
});
```

---

## Summary

✅ **Complete hierarchy loaded in single request**  
✅ **All components with their unit references**  
✅ **Support for multiple units per component**  
✅ **Calculation formulas for derived metrics**  
✅ **Normal ranges for validation**  
✅ **Context factors for interpretation**  
✅ **Efficient query with proper joins**  
✅ **Consistent ordering for predictable responses**

The enhanced API provides everything needed to build sophisticated health tracking applications! 🚀
