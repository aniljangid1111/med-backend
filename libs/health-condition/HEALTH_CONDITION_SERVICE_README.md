# Health Condition Service Implementation

## Overview
This document describes the implementation of the Health Condition Service, which manages health conditions and user health conditions in the Medii-Track application.

## Features Implemented

### 1. Health Condition Management

#### Create Health Condition
- **Method**: `createHealthCondition(createDto: CreateHealthConditionDto)`
- **Description**: Creates a new health condition
- **Validations**:
  - Checks for duplicate names
  - Throws `ConflictException` if name already exists
- **Returns**: Created `HealthCondition` entity

#### Update Health Condition
- **Method**: `updateHealthCondition(id: string, updateDto: UpdateHealthConditionDto)`
- **Description**: Updates an existing health condition
- **Validations**:
  - Verifies health condition exists
  - Checks for duplicate names when updating
- **Returns**: Updated `HealthCondition` entity

#### Get Health Condition by ID
- **Method**: `getHealthConditionById(id: string)`
- **Description**: Retrieves a specific health condition
- **Returns**: `HealthCondition` entity

#### Get All Health Conditions
- **Method**: `getAllHealthConditions(isActive?: boolean)`
- **Description**: Retrieves all health conditions with optional filtering by active status
- **Returns**: Array of `HealthCondition` entities

### 2. User Health Condition Management

#### Add User Health Condition
- **Method**: `addUserHealthCondition(userId: string, addDto: AddUserHealthConditionDto)`
- **Description**: Associates a health condition with a user
- **Two modes of operation**:
  1. **Using existing health condition**: Provide `healthConditionId`
  2. **Creating new health condition**: Provide `healthConditionName`
     - If the condition name already exists, it will use the existing one
     - If not, it will create a new health condition automatically
- **Validations**:
  - At least one field must be provided
  - Prevents duplicate assignments
  - Verifies health condition exists (when using ID)
- **Returns**: Created `UserHealthCondition` entity

#### Remove User Health Condition
- **Method**: `removeUserHealthCondition(userId: string, healthConditionId: string)`
- **Description**: Removes a health condition from a user by userId and healthConditionId
- **Validations**:
  - Verifies the assignment exists
- **Returns**: Success message

#### Remove User Health Condition by ID
- **Method**: `removeUserHealthConditionById(userHealthConditionId: string)`
- **Description**: Removes a user health condition by its unique ID
- **Validations**:
  - Verifies the record exists
- **Returns**: Success message

#### Get User Health Conditions
- **Method**: `getUserHealthConditions(userId: string)`
- **Description**: Retrieves all health conditions for a specific user
- **Returns**: Array of `UserHealthCondition` entities with related `HealthCondition` data

## DTOs Created

### CreateHealthConditionDto
```typescript
{
  name: string;        // Required
  isActive?: boolean;  // Optional, defaults to true
}
```

### UpdateHealthConditionDto
```typescript
{
  name?: string;       // Optional
  isActive?: boolean;  // Optional
}
```

### AddUserHealthConditionDto
```typescript
{
  healthConditionId?: string;    // UUID - Use existing condition
  healthConditionName?: string;  // Use or create condition by name
}
```
**Note**: At least one field must be provided. They are mutually validated.

## Error Handling

The service implements comprehensive error handling:
- **NotFoundException**: When entities are not found
- **ConflictException**: When trying to create duplicates or assign existing conditions
- **BadRequestException**: When invalid input is provided

## Usage Examples

### 1. Create a new health condition
```typescript
const condition = await healthConditionService.createHealthCondition({
  name: 'Diabetes Type 2',
  isActive: true
});
```

### 2. Update a health condition
```typescript
const updated = await healthConditionService.updateHealthCondition(
  'uuid-here',
  { name: 'Type 2 Diabetes', isActive: true }
);
```

### 3. Add health condition to user (using existing ID)
```typescript
const userCondition = await healthConditionService.addUserHealthCondition(
  'user-uuid',
  { healthConditionId: 'condition-uuid' }
);
```

### 4. Add health condition to user (using name - will create if not exists)
```typescript
const userCondition = await healthConditionService.addUserHealthCondition(
  'user-uuid',
  { healthConditionName: 'Hypertension' }
);
```

### 5. Remove health condition from user
```typescript
await healthConditionService.removeUserHealthCondition(
  'user-uuid',
  'condition-uuid'
);
```

### 6. Get all user's health conditions
```typescript
const conditions = await healthConditionService.getUserHealthConditions('user-uuid');
```

## Database Entities

### HealthCondition
- `id`: UUID (Primary Key)
- `name`: Text (Unique)
- `isActive`: Boolean (Default: false)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### UserHealthCondition
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key to User)
- `healthConditionId`: UUID (Foreign Key to HealthCondition)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

## Module Configuration

The `HealthConditionModule` is configured with:
- TypeORM repositories for both entities
- Service exported for use in other modules
- Ready to be imported into any feature module

## Next Steps

To use this service in a controller:
1. Import `HealthConditionModule` into your feature module
2. Inject `HealthConditionService` into your controller
3. Create endpoints for the service methods
4. Add authentication/authorization guards as needed
