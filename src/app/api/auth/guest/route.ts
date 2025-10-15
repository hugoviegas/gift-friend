import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose";
import { connectDB } from "@/lib/db/connection";
import { validateAndFormat } from "@/lib/validations/schemas";
import { z } from "zod";

// Validation schema for guest token request
const guestTokenSchema = z.object({
  participantId: z.string().min(24).max(24), // MongoDB ObjectId
  name: z.string().min(2).max(100),
  email: z.string().email(),
});

type GuestTokenRequest = z.infer<typeof guestTokenSchema>;

/**
 * POST /api/auth/guest
 *
 * Generates a guest JWT token for event participants who haven't created an account.
 * This allows them to view public event information without a password.
 *
 * Request body:
 * {
 *   participantId: string,  // MongoDB participant ID
 *   name: string,
 *   email: string
 * }
 *
 * Response:
 * {
 *   token: string,          // JWT token for guest access
 *   expiresIn: number,      // Token expiration in seconds
 *   type: "bearer"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Ensure database connection
    await connectDB();

    // Parse request body
    const body = await request.json();

    // Validate using Zod schema
    const validation = validateAndFormat(guestTokenSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          errors: (
            validation as { success: false; errors: Record<string, string> }
          ).errors,
        },
        { status: 422 }
      );
    }

    const { participantId, name, email } = (
      validation as { success: true; data: GuestTokenRequest }
    ).data;

    // Create guest JWT token
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error("[Guest Auth] NEXTAUTH_SECRET not configured");
      return NextResponse.json(
        { success: false, errors: { server: "Authentication not configured" } },
        { status: 500 }
      );
    }

    // Token expiration: 30 days for guests
    const expiresIn = 30 * 24 * 60 * 60;
    const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;

    // Create JWT with guest-specific claims
    const token = await new SignJWT({
      sub: participantId,
      email,
      name,
      type: "guest", // Mark as guest token
      iat: Math.floor(Date.now() / 1000),
      exp: expiresAt,
    })
      .setProtectedHeader({ alg: "HS256" })
      .sign(new TextEncoder().encode(secret));

    // Log successful guest token generation
    console.log("[Guest Auth] Token generated", {
      participantId,
      email,
      expiresAt: new Date(expiresAt * 1000).toISOString(),
    });

    // Return token
    return NextResponse.json(
      {
        success: true,
        data: {
          token,
          expiresIn,
          type: "bearer",
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[Guest Auth] Error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, errors: { server: "Invalid JSON in request body" } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        errors: { server: "Failed to generate guest token" },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/guest
 *
 * Returns information about guest token requirements and limitations
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      message: "Guest authentication endpoint",
      usage: "POST with participantId, name, and email to generate token",
      tokenType: "JWT",
      expiresIn: 30 * 24 * 60 * 60,
      limitations: [
        "Cannot view Secret Santa assignments",
        "Cannot manage event settings",
        "Cannot access wishlists",
      ],
      upgradeTo: "Create account with password for full access",
    },
  });
}
