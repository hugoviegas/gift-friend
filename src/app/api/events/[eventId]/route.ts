import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Event } from "@/models/Event";
import { Participant } from "@/models/Participant";

/**
 * GET /api/events/[eventId]
 *
 * Returns public event information.
 * Accessible without authentication to allow guest participants to view event details.
 *
 * URL Parameters:
 * - eventId: MongoDB Event ID
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     id: string,
 *     name: string,
 *     description?: string,
 *     date: ISO8601,
 *     time?: string,
 *     location?: string,
 *     budgetMin: number,
 *     budgetMax: number,
 *     currency: string,
 *     status: string,
 *     participantCount: number,
 *     adminName: string
 *   }
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;

    // Ensure database connection
    await connectDB();

    // Validate event ID format (MongoDB ObjectId)
    if (!eventId || eventId.length !== 24) {
      return NextResponse.json(
        {
          success: false,
          errors: { eventId: "Invalid event ID format" },
        },
        { status: 400 }
      );
    }

    // Fetch event with admin info
    const event = await (Event as any).findById(eventId).populate({
      path: "adminId",
      select: "name email",
    });

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          errors: { eventId: "Event not found" },
        },
        { status: 404 }
      );
    }

    // Get participant count
    const participantCount = await Participant.countDocuments({
      eventId,
    });

    // Format response
    const eventData = {
      id: event._id.toString(),
      name: event.name,
      description: event.description || undefined,
      date: event.date.toISOString(),
      time: event.time || undefined,
      location: event.location || undefined,
      budgetMin: event.budgetMin,
      budgetMax: event.budgetMax,
      currency: event.currency,
      status: event.status,
      participantCount,
      adminName: (event.adminId as any)?.name || "Unknown",
      suggestedDrawDate: event.suggestedDrawDate
        ? event.suggestedDrawDate.toISOString()
        : undefined,
      createdAt: event.createdAt.toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: eventData,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=60", // Cache for 1 minute
        },
      }
    );
  } catch (error) {
    console.error("[Get Event] Error:", error);

    return NextResponse.json(
      {
        success: false,
        errors: { server: "Failed to retrieve event details" },
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/events/[eventId]
 *
 * Updates event details (admin only).
 * Not implemented in User Story 1 - will be part of User Story 2.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  return NextResponse.json(
    {
      success: false,
      message: "Event updates coming in User Story 2",
    },
    { status: 501 }
  );
}

/**
 * DELETE /api/events/[eventId]
 *
 * Deletes an event (admin only).
 * Not implemented in User Story 1 - will be part of User Story 2.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  return NextResponse.json(
    {
      success: false,
      message: "Event deletion coming in User Story 2",
    },
    { status: 501 }
  );
}
