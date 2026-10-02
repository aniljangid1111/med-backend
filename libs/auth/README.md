# Auth Module Documentation

## Overview
The Auth module provides complete authentication functionality for the Medii Track application, including user registration, login, JWT-based authentication, and refresh token management.

## Features

### 1. User Registration
- **Endpoint**: `POST /auth/register`
- **Description**: Register a new user
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**: User object without password

### 2. User Login
- **Endpoint**: `POST /auth/login`
- **Description**: Authenticate user and receive tokens
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "user": { ... },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
  ```

### 3. Refresh Token
- **Endpoint**: `POST /auth/refresh`
- **Description**: Get new access token using refresh token
- **Body**:
  ```json
  {
    "refreshToken": "your-refresh-token"
  }
  ```
- **Response**:
  ```json
  {
    "accessToken": "...",
    "refreshToken": "..."
  }
  ```

### 4. User Profile
- **Endpoint**: `GET /auth/profile`
- **Description**: Get current user profile (requires authentication)
- **Headers**: `Authorization: Bearer <access-token>`
- **Response**: User object

### 5. Logout
- **Endpoint**: `POST /auth/logout`
- **Description**: Logout user and invalidate refresh token
- **Headers**: `Authorization: Bearer <access-token>`
- **Response**: Success message

## Authentication Flow

1. **Registration**: User registers with email and password
2. **Login**: User logs in and receives access token (15 minutes) and refresh token (7 days)
3. **Protected Routes**: Include JWT token in Authorization header
4. **Token Refresh**: Use refresh token to get new access token when expired
5. **Logout**: Invalidate refresh token

## Guards

### JwtAuthGuard
- Protects routes that require authentication
- Automatically applied to all routes except those marked with `@Public()`

### LocalAuthGuard
- Used for login endpoint
- Validates email/password credentials

## Decorators

### @Public()
- Mark routes that don't require authentication
- Used on registration and login endpoints

## Strategies

### LocalStrategy
- Handles email/password authentication
- Used during login process

### JwtStrategy
- Handles JWT token validation
- Used for protected routes

## Environment Variables

```env
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
```

## Security Features

- Password hashing using bcrypt (12 rounds)
- JWT tokens with expiration
- Refresh token rotation
- Email uniqueness validation
- Input validation using class-validator

## Usage in Controllers

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard, Public } from '@auth/auth';

@Controller('example')
export class ExampleController {
  
  @Public() // No authentication required
  @Get('public')
  getPublicData() {
    return { message: 'This is public' };
  }

  @UseGuards(JwtAuthGuard) // Authentication required
  @Get('private')
  getPrivateData(@Request() req) {
    return { user: req.user };
  }
}
```
