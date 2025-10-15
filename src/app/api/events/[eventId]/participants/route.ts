import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { validateAndFormat } from "@/lib/validations/schemas";
import { addParticipant } from "@/lib/services/participantService";
import { Event } from "@/models/Event";
import { z } from "zod";

// Validation schema for joining an event
const joinEventSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().lowercase(),
  locale: z.enum(["pt-BR", "en"]).optional().default("pt-BR"),
});

type JoinEventRequest = z.infer<typeof joinEventSchema>;

/**
 * POST /api/events/[eventId]/participants
 *
 * Adds a new participant to an event.
 * Participants can join with just name and email (guest access).
 *
 * URL Parameters:
 * - eventId: MongoDB Event ID
 *
 * Request body:
 * {
 *   name: string,           // Participant's name
 *   email: string,          // Participant's email
 *   locale?: "pt-BR" | "en" // Language preference (default: pt-BR)
 * }
 *
 * Response (201 Created):
 * {
 *   success: true,
 *   data: {
 *     participantId: string,
 *     name: string,
 *     email: string,
 *     status: "JOINED",
 *     guestToken: string,
 *     joinedAt: ISO8601
 *   }
 * }
 *
 * Error Responses:
 * - 404: Event not found
 * - 409: Participant already joined (duplicate email in event)
 * - 422: Validation error
 * - 500: Server error
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;

    // Ensure database connection
    await connectDB();

    // Validate event ID format
    if (!eventId || eventId.length !== 24) {
      return NextResponse.json(
        {
          success: false,
          errors: { eventId: "Invalid event ID format" },
        },
        { status: 400 }
      );
    }

    // Check if event exists
    const event = await (Event as any).findById(eventId);
    if (!event) {
      return NextResponse.json(
        {
          success: false,
          errors: { eventId: `Event with ID ${eventId} not found` },
        },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate using Zod schema
    const validation = validateAndFormat(joinEventSchema, body);

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

    const { name, email, locale } = (
      validation as { success: true; data: JoinEventRequest }
    ).data;

    // Get client IP for logging
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const userAgent = request.headers.get("user-agent") || undefined;

    // Add participant to event
    const participant = await addParticipant(eventId, {
      name,
      email,
      locale,
      ipAddress,
      userAgent,
    });

    // Log successful participant addition
    console.log("[Join Event] Participant added", {
      eventId,
      participantId: participant._id,
      email,
      timestamp: new Date().toISOString(),
    });

    // Return created participant
    return NextResponse.json(
      {
        success: true,
        data: {
          participantId: participant._id.toString(),
          name: participant.name,
          email: participant.email,
          status: participant.status,
          guestToken: participant.guestToken,
          locale: participant.locale,
          joinedAt: participant.joinedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Join Event] Error:", error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes("already exists")) {
        return NextResponse.json(
          {
            success: false,
            errors: { email: error.message },
          },
          { status: 409 }
        );
      }

      if (error.message.includes("not found")) {
        return NextResponse.json(
          {
            success: false,
            errors: { eventId: error.message },
          },
          { status: 404 }
        );
      }

      if (error instanceof SyntaxError) {
        return NextResponse.json(
          {
            success: false,
            errors: { server: "Invalid JSON in request body" },
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        errors: { server: "Failed to add participant to event" },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/events/[eventId]/participants
 *
 * Returns list of participants for an event.
 * Does not include email addresses or sensitive data.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;

    // Ensure database connection
    await connectDB();

    // Check if event exists
    const event = await (Event as any).findById(eventId);
    if (!event) {
      return NextResponse.json(
        {
          success: false,
          errors: { eventId: "Event not found" },
        },
        { status: 404 }
      );
    }

    // Get participants (public info only)
    const participants = await event.populate({
      path: "participants",
      select: "name email status locale joinedAt",
    });

    return NextResponse.json({
      success: true,
      data: {
        eventId: event._id.toString(),
        participantCount: event.participants.length,
        participants: event.participants.map((p: any) => ({
          id: p._id.toString(),
          name: p.name,
          email: p.email,
          status: p.status,
          locale: p.locale,
          joinedAt: p.joinedAt,
        })),
      },
    });
  } catch (error) {
    console.error("[Get Participants] Error:", error);

    return NextResponse.json(
      {
        success: false,
        errors: { server: "Failed to get participants" },
      },
      { status: 500 }
    );
  }
}
