import { z } from "zod";

/**
 * User Validation Schemas
 */

// Email validation (reusable)
const emailSchema = z
  .string()
  .email("Please provide a valid email address")
  .toLowerCase()
  .trim();

// Password validation (minimum 8 characters, at least one number, one uppercase, one lowercase)
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  );

// Simple password for guest login (no strength requirements)
const simplePasswordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters");

export const userLoginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const userRegisterSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .trim(),
});

export const userUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .trim()
    .optional(),
  email: emailSchema.optional(),
});

/**
 * Event Validation Schemas
 */

export const currencyEnum = z.enum(["EUR", "USD", "BRL"]);

export const eventCreateSchema = z.object({
  name: z
    .string()
    .min(3, "Event name must be at least 3 characters")
    .max(100, "Event name cannot exceed 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .trim()
    .optional(),
  date: z
    .string()
    .pipe(z.coerce.date())
    .refine((date) => date > new Date(), "Event date must be in the future"),
  time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format")
    .optional(),
  location: z
    .string()
    .max(200, "Location cannot exceed 200 characters")
    .trim()
    .optional(),
  minGiftValue: z
    .number()
    .positive("Minimum gift value must be greater than 0"),
  maxGiftValue: z
    .number()
    .positive("Maximum gift value must be greater than 0"),
  currency: currencyEnum,
  suggestedDrawDate: z.string().pipe(z.coerce.date()).optional(),
});

export const eventUpdateSchema = eventCreateSchema.partial();

export const eventCodeSchema = z.object({
  code: z
    .string()
    .length(8, "Event code must be exactly 8 characters")
    .toUpperCase(),
});

/**
 * Participant Validation Schemas
 */

export const participantJoinSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .trim(),
  email: emailSchema,
  eventCode: z
    .string()
    .length(8, "Event code must be exactly 8 characters")
    .toUpperCase(),
});

export const participantCreateSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .trim(),
  email: emailSchema,
  eventId: z.string().min(1, "Event ID is required"),
});

/**
 * Gift Item Validation Schemas
 */

export const giftItemCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Gift name is required")
    .max(100, "Gift name cannot exceed 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .trim()
    .optional(),
  link: z
    .string()
    .url("Please provide a valid URL")
    .optional()
    .or(z.literal("")),
  estimatedPrice: z
    .number()
    .positive("Price must be greater than 0")
    .optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

export const giftItemUpdateSchema = giftItemCreateSchema.partial();

/**
 * Draw Assignment Validation Schemas
 */

export const drawAssignmentSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  participantId: z.string().min(1, "Participant ID is required"),
  recipientId: z.string().min(1, "Recipient ID is required"),
  revealedAt: z.date().optional(),
});

/**
 * Pagination Validation Schemas
 */

export const paginationSchema = z.object({
  page: z
    .string()
    .default("1")
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .default("10")
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().int().positive().max(100)),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("asc"),
});

/**
 * Generic Response Schemas
 */

export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
  details: z.record(z.string(), z.any()).optional(),
});

export const successResponseSchema = z.object({
  success: z.literal(true),
  data: z.any().optional(),
  message: z.string().optional(),
});

/**
 * API Request/Response Helpers
 */

// Derive TypeScript types from schemas
export type UserLogin = z.infer<typeof userLoginSchema>;
export type UserRegister = z.infer<typeof userRegisterSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type EventCreate = z.infer<typeof eventCreateSchema>;
export type EventUpdate = z.infer<typeof eventUpdateSchema>;
export type EventCode = z.infer<typeof eventCodeSchema>;
export type ParticipantJoin = z.infer<typeof participantJoinSchema>;
export type ParticipantCreate = z.infer<typeof participantCreateSchema>;
export type GiftItemCreate = z.infer<typeof giftItemCreateSchema>;
export type GiftItemUpdate = z.infer<typeof giftItemUpdateSchema>;
export type DrawAssignment = z.infer<typeof drawAssignmentSchema>;
export type Pagination = z.infer<typeof paginationSchema>;

/**
 * Custom Validation Helper Functions
 */

/**
 * Validate and parse user input safely
 * Returns parsed data or null on validation error
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

/**
 * Format Zod error into user-friendly messages
 */
export function formatValidationErrors(
  error: z.ZodError
): Record<string, string> {
  const formatted: Record<string, string> = {};

  error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    const message = issue.message;
    formatted[path] = message;
  });

  return formatted;
}

/**
 * Combined validation with error formatting
 */
export function validateAndFormat<T>(
  schema: z.ZodSchema<T>,
  data: unknown
):
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> } {
  const result = validateInput(schema, data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = result as { success: false; errors: z.ZodError };
  return {
    success: false,
    errors: formatValidationErrors(errors.errors),
  };
}
