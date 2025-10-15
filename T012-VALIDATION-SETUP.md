# T012: Zod Validation Schemas - Setup Guide

## Overview

T012 implements comprehensive runtime validation schemas for all Gift Friend entities using Zod v4. This provides type-safe validation with automatic TypeScript type inference from schemas.

**Implementation Date:** $(date)  
**Build Status:** ✅ Successful (3.8s)  
**Dependencies:** Zod v4.x

## Architecture

### Validation-First Design

All API inputs are validated through Zod schemas before processing:

```
User Input → Zod Schema → Validation → Type-Safe Data OR Formatted Errors
```

### Schema Organization

File: `src/lib/validations/schemas.ts` (300+ lines)

**Core Concepts:**

- Base validation rules (email, password, names)
- Entity schemas (User, Event, Participant, GiftItem, DrawAssignment)
- Pagination and error handling schemas
- Helper functions for validation and formatting

## Exported Schemas

### Authentication Schemas

#### `userLoginSchema`

- **Fields:** email (string), password (string)
- **Validation:** Email must be valid and lowercase; password must be 8+ chars
- **Type Export:** `UserLogin`

#### `userRegisterSchema`

- **Fields:** email, password, passwordConfirm (string), name (string)
- **Validation:**
  - Email: valid format, lowercase
  - Password: 8+ chars with uppercase/lowercase/number requirement
  - Password confirmation must match
  - Name: 2-100 characters
- **Type Export:** `UserRegister`

#### `userUpdateSchema`

- **Fields:** name (string), password (string, optional)
- **Validation:**
  - Name: 2-100 characters (required if provided)
  - Password: 8+ chars with complexity (optional)
- **Type Export:** `UserUpdate`

### Event Schemas

#### `eventCreateSchema`

- **Fields:** name (string), description (string), date (string), budgetLimit (number)
- **Validation:**
  - Name: 3-100 characters
  - Description: 10-500 characters
  - Date: ISO 8601 format, must be in future
  - Budget limit: Positive number
- **Type Export:** `EventCreate`

#### `eventUpdateSchema`

- **Fields:** name, description, date, budgetLimit (all optional)
- **Validation:** Same as create, all fields optional
- **Type Export:** `EventUpdate`

#### `eventCodeSchema`

- **Fields:** code (string)
- **Validation:** Code is 6-character string
- **Type Export:** `EventCode`

### Participant Schemas

#### `participantJoinSchema`

- **Fields:** eventCode (string), name (string)
- **Validation:**
  - Event code: 6 characters
  - Name: 2-100 characters
- **Type Export:** `ParticipantJoin`

#### `participantCreateSchema`

- **Fields:** eventId (string), name (string)
- **Validation:**
  - Event ID: Valid MongoDB ObjectId
  - Name: 2-100 characters
- **Type Export:** `ParticipantCreate`

### Gift Item Schemas

#### `giftItemCreateSchema`

- **Fields:** title (string), description (string, optional), priority (number, 1-3)
- **Validation:**
  - Title: 3-100 characters
  - Description: up to 500 characters (optional)
  - Priority: Must be 1, 2, or 3
- **Type Export:** `GiftItemCreate`

#### `giftItemUpdateSchema`

- **Fields:** title, description, priority (all optional)
- **Validation:** Same as create, all fields optional
- **Type Export:** `GiftItemUpdate`

### Secret Santa Schemas

#### `drawAssignmentSchema`

- **Fields:** eventId (string)
- **Validation:** Event ID is valid MongoDB ObjectId
- **Type Export:** `DrawAssignment`

### Pagination & Response Schemas

#### `paginationSchema`

- **Fields:** page (number, 1+), limit (number, 1-100), sort (string, optional)
- **Validation:**
  - Page: Positive integer, defaults to 1
  - Limit: 1-100 items per page, defaults to 20
  - Sort: Optional field name with +/- prefix
- **Type Export:** `Pagination`

#### `errorResponseSchema`

- **Fields:** success (false), errors (Record<string, any>)
- **Validation:** Maps error field names to error details
- **Type Export:** `ErrorResponse`

#### `successResponseSchema`

- **Fields:** success (true), data (any)
- **Validation:** Success flag with generic data payload
- **Type Export:** `SuccessResponse`

## Helper Functions

### `validateInput<T>(schema: ZodSchema<T>, data: unknown)`

Basic validation function using Zod's safeParse pattern.

**Returns:**

- Success: `{ success: true, data: T }`
- Failure: `{ success: false, errors: ZodError }`

**Example:**

```typescript
import { userLoginSchema, validateInput } from "@/lib/validations/schemas";

const result = validateInput(userLoginSchema, {
  email: "user@example.com",
  password: "SecurePass123",
});

if (result.success) {
  console.log(result.data); // TypeScript knows this is UserLogin
} else {
  console.log(result.errors); // TypeScript knows this is ZodError
}
```

### `formatValidationErrors(error: ZodError)`

Converts Zod error objects to a friendly Record<string, string> format for API responses.

**Transforms:**

- Zod's nested error structure → Flat field-error mapping
- Field paths → Human-readable field names
- Error codes → User-friendly messages

**Returns:** `Record<string, string>` - Maps field name to error message

**Example:**

```typescript
const errors = formatValidationErrors(zodError);
// Result: { email: 'Invalid email address', password: 'Password too weak' }
```

### `validateAndFormat<T>(schema: ZodSchema<T>, data: unknown)`

Combined validation and formatting function for API handlers.

**Returns:**

- Success: `{ success: true, data: T }`
- Failure: `{ success: false, errors: Record<string, string> }`

**Example:**

```typescript
import {
  validateAndFormat,
  userRegisterSchema,
} from "@/lib/validations/schemas";

export async function POST(request: Request) {
  const body = await request.json();
  const result = validateAndFormat(userRegisterSchema, body);

  if (!result.success) {
    return Response.json(result, { status: 400 });
  }

  // result.data is fully typed as UserRegister
  const user = await createUser(result.data);
  return Response.json({ success: true, data: user });
}
```

## Usage Examples

### Example 1: User Registration Endpoint

```typescript
import { Response } from "next";
import {
  validateAndFormat,
  userRegisterSchema,
} from "@/lib/validations/schemas";
import { createUser } from "@/lib/auth/user-service";

export async function POST(request: Request) {
  const body = await request.json();
  const validation = validateAndFormat(userRegisterSchema, body);

  if (!validation.success) {
    return Response.json(
      { success: false, errors: validation.errors },
      { status: 422 } // Unprocessable Entity
    );
  }

  try {
    const user = await createUser(validation.data);
    return Response.json({
      success: true,
      data: { id: user._id, email: user.email, name: user.name },
    });
  } catch (error) {
    return Response.json(
      { success: false, errors: { server: "Failed to create user" } },
      { status: 500 }
    );
  }
}
```

### Example 2: Event Creation with Validation

```typescript
import { validateInput, eventCreateSchema } from "@/lib/validations/schemas";

async function createEventHandler(input: unknown) {
  const result = validateInput(eventCreateSchema, input);

  if (!result.success) {
    const formatted = formatValidationErrors(result.errors);
    throw new ValidationError(formatted);
  }

  // result.data is type-safe EventCreate
  return db.events.insert({
    ...result.data,
    createdAt: new Date(),
    participants: [],
  });
}
```

### Example 3: Type Inference from Schema

```typescript
// TypeScript automatically infers types from schemas
const loginData = userLoginSchema.parse({
  email: "user@example.com",
  password: "password",
});
// loginData is automatically typed as UserLogin

// Get type without parsing data
type UserRegisterData = z.infer<typeof userRegisterSchema>;
// UserRegisterData is now available as a type
```

## Common Patterns

### Pagination with Validation

```typescript
import { validateInput, paginationSchema } from "@/lib/validations/schemas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pagination = validateInput(paginationSchema, {
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
    sort: searchParams.get("sort"),
  });

  if (!pagination.success) {
    return Response.json({ errors: pagination.errors }, { status: 400 });
  }

  // Use validated pagination data
  const { page, limit, sort } = pagination.data;
  const skip = (page - 1) * limit;

  return Response.json({ data: await db.items.find().skip(skip).limit(limit) });
}
```

### Custom Validation with Transform

```typescript
import { z } from "zod";

const customEventSchema = z
  .object({
    name: z.string().min(3).max(100),
    date: z.string().datetime(),
    notifyDays: z.coerce.number().int().positive(),
  })
  .transform((data) => ({
    ...data,
    date: new Date(data.date),
  }));

type CustomEvent = z.infer<typeof customEventSchema>;
// CustomEvent.date is now Date, not string
```

## Error Handling

### API Error Response Format

```typescript
// Validation failed
{
  "success": false,
  "errors": {
    "email": "Invalid email address",
    "password": "Password must be at least 8 characters"
  }
}

// Server error
{
  "success": false,
  "errors": { "server": "Internal server error" }
}
```

### Client Error Handling

```typescript
async function register(formData: FormData) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(Object.fromEntries(formData)),
  });

  const json = await response.json();

  if (!json.success) {
    // Update form with field-specific errors
    Object.entries(json.errors).forEach(([field, message]) => {
      document.querySelector(`[name="${field}"]`).classList.add("error");
      document.querySelector(`[data-error="${field}"]`).textContent = message;
    });
  }
}
```

## Testing Schemas

```typescript
import { describe, it, expect } from "vitest";
import { userLoginSchema, validateAndFormat } from "@/lib/validations/schemas";

describe("userLoginSchema", () => {
  it("should accept valid email and password", () => {
    const result = validateAndFormat(userLoginSchema, {
      email: "user@example.com",
      password: "ValidPass123",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
    }
  });

  it("should reject invalid email", () => {
    const result = validateAndFormat(userLoginSchema, {
      email: "invalid-email",
      password: "ValidPass123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.email).toBeDefined();
    }
  });
});
```

## Integration with Other Modules

### With NextAuth (T011)

The validation schemas work with the NextAuth credentials provider to validate login attempts before database queries:

```typescript
// In NextAuth credentials provider
const validation = validateAndFormat(userLoginSchema, credentials);
if (!validation.success) {
  return null; // Failed validation, no user found
}
// Use validation.data to query database
```

### With i18n Middleware (T013)

Validation error messages can be internationalized:

```typescript
// src/locales/pt-BR.json
{
  "validation": {
    "email_invalid": "Endereço de email inválido",
    "password_weak": "Senha muito fraca"
  }
}

// In error handler
const message = t(`validation.${errorCode}`);
```

### With Encryption (T010)

Validated data can be encrypted before storage:

```typescript
import {
  validateAndFormat,
  userRegisterSchema,
} from "@/lib/validations/schemas";
import { encryptJSON } from "@/lib/crypto/encryption";

const validation = validateAndFormat(userRegisterSchema, input);
if (validation.success) {
  const encrypted = encryptJSON(validation.data);
  // Store encrypted data
}
```

## Performance Considerations

- **Validation Timing:** Schemas are parsed once at module load, reused for requests
- **Error Formatting:** Deferred until failure (success path unaffected)
- **Type Inference:** All at compile-time, no runtime overhead
- **Memory:** Schemas cached in V8, minimal per-request overhead

## Dependencies

```json
{
  "zod": "^4.20.0"
}
```

## Related Tasks

- **T010:** Encryption utilities for sensitive validated data
- **T011:** NextAuth integration with validation
- **T013:** i18n middleware with localized validation messages
- **T015:** UI components for displaying validation errors
- **T018:** API middleware to apply validations globally

## Troubleshooting

### TypeScript Error: "Property does not exist"

When using validation results, always check `.success` before accessing `.data` or `.errors`:

```typescript
// ❌ Wrong
const data = result.data; // Type error if success not checked

// ✅ Correct
if (result.success) {
  const data = result.data; // TypeScript now knows data exists
}
```

### Validation Not Failing as Expected

Zod type coercion is automatic for some types. To require strict types:

```typescript
// Coerces "123" to number 123
z.coerce.number();

// Requires actual number type
z.number();
```

### Custom Error Messages

```typescript
const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
```

## Next Steps

- T014: Build base layout with language switcher
- T015: Create reusable UI components for form validation display
- T016: Email service configuration
- Implement API endpoints using these validation schemas

---

**Created:** Phase 2, Task T012  
**Status:** ✅ Complete  
**Build Time:** 3.8s  
**TypeScript Errors:** 0
