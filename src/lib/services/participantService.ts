import { connectDB } from "@/lib/db/connection";
import {
  Participant as ParticipantModel,
  IParticipant,
  ParticipantStatus,
} from "@/models/Participant";
import { Event as EventModel } from "@/models/Event";
import crypto from "crypto";

// Cast models to any to avoid TypeScript union type issues with Mongoose
const Participant = ParticipantModel as any;
const Event = EventModel as any;

/**
 * Generate a secure guest token for event participation
 * Token includes participant ID and can be used for JWT verification
 */
export function generateGuestToken(participantId: string): string {
  // Generate random token (will be used as JWT subject)
  const randomBytes = crypto.randomBytes(32).toString("hex");
  return randomBytes;
}

/**
 * Add a participant to an event
 * Creates a guest token for unauthenticated access or links to existing user
 */
export async function addParticipant(
  eventId: string,
  participantData: {
    name: string;
    email: string;
    locale?: "pt-BR" | "en";
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<IParticipant> {
  const connection = await connectDB();

  // Check if event exists
  const event = await Event.findById(eventId);
  if (!event) {
    throw new Error(`Event with ID ${eventId} not found`);
  }

  // Check if participant already exists in this event
  const existingParticipant = await Participant.findOne({
    email: participantData.email,
    eventId,
  });

  if (existingParticipant) {
    throw new Error(
      `Participant with email ${participantData.email} already joined this event`
    );
  }

  // Generate guest token if no userId provided
  let guestToken: string | undefined;
  let status = ParticipantStatus.JOINED;

  if (!participantData.userId) {
    guestToken = generateGuestToken(eventId);
  } else {
    status = ParticipantStatus.ACCOUNT_CREATED;
  }

  // Create new participant
  const participant = new Participant({
    name: participantData.name,
    email: participantData.email,
    eventId,
    userId: participantData.userId,
    guestToken,
    status,
    locale: participantData.locale || "pt-BR",
    ipAddress: participantData.ipAddress,
    userAgent: participantData.userAgent,
  });

  await participant.save();

  // Add participant to event's participant list
  await Event.findByIdAndUpdate(eventId, {
    $addToSet: { participants: participant._id },
  });

  return participant;
}

/**
 * Get all participants for a specific event
 */
export async function getParticipantsByEvent(
  eventId: string,
  options?: {
    includeEmails?: boolean;
    status?: ParticipantStatus;
  }
): Promise<IParticipant[]> {
  const query = Participant.find({ eventId });

  if (options?.status) {
    query.where("status", options.status);
  }

  const participants = await query.select(
    options?.includeEmails
      ? "" // Return all fields
      : "-guestToken -ipAddress -userAgent" // Exclude sensitive fields
  );

  return participants;
}

/**
 * Get a participant by ID with validation
 */
export async function getParticipant(
  participantId: string
): Promise<IParticipant | null> {
  const participant = await Participant.findById(participantId);
  return participant;
}

/**
 * Get a participant by email in a specific event
 */
export async function getParticipantByEmail(
  email: string,
  eventId: string
): Promise<IParticipant | null> {
  const participant = await Participant.findOne({ email, eventId });
  return participant;
}

/**
 * Update participant status
 */
export async function updateParticipantStatus(
  participantId: string,
  newStatus: ParticipantStatus,
  additionalData?: Record<string, any>
): Promise<IParticipant | null> {
  const updateData: any = { status: newStatus };

  // Add timestamp fields based on status transition
  if (newStatus === ParticipantStatus.ACCOUNT_CREATED) {
    updateData.accountCreatedAt = new Date();
  } else if (newStatus === ParticipantStatus.DRAWN) {
    updateData.drawnAt = new Date();
  }

  // Merge any additional data
  if (additionalData) {
    Object.assign(updateData, additionalData);
  }

  const updatedParticipant = await Participant.findByIdAndUpdate(
    participantId,
    updateData,
    { new: true }
  );

  return updatedParticipant;
}

/**
 * Link a guest participant to a newly created user account
 */
export async function linkParticipantToUser(
  participantId: string,
  userId: string
): Promise<IParticipant | null> {
  const updatedParticipant = await Participant.findByIdAndUpdate(
    participantId,
    {
      userId,
      status: ParticipantStatus.ACCOUNT_CREATED,
      accountCreatedAt: new Date(),
      guestToken: undefined, // Remove guest token once account is created
    },
    { new: true }
  );

  return updatedParticipant;
}

/**
 * Verify guest token validity
 * Returns participant if token is valid and not yet upgraded
 */
export async function verifyGuestToken(
  token: string,
  eventId: string
): Promise<IParticipant | null> {
  const participant = await Participant.findOne({
    guestToken: token,
    eventId,
    status: ParticipantStatus.JOINED, // Only valid for guest participants
  });

  return participant;
}

/**
 * Get count of participants in an event by status
 */
export async function getParticipantCountByStatus(
  eventId: string,
  status: ParticipantStatus
): Promise<number> {
  const count = await Participant.countDocuments({ eventId, status });
  return count;
}

/**
 * Get all participants who have drawn
 */
export async function getParticipantsWhoDrawn(
  eventId: string
): Promise<IParticipant[]> {
  const participants = await Participant.find({
    eventId,
    status: ParticipantStatus.DRAWN,
  });
  return participants;
}

/**
 * Check if participant has drawn
 */
export async function hasParticipantDrawn(
  participantId: string
): Promise<boolean> {
  const participant = await Participant.findById(participantId);
  return participant?.status === ParticipantStatus.DRAWN || false;
}

/**
 * Get participant's drawing target (Secret Santa assignment)
 */
export async function getParticipantAssignment(
  participantId: string
): Promise<IParticipant | null> {
  const participant = await Participant.findById(participantId);

  if (!participant?.assignedToId) {
    return null;
  }

  // Get the participant they drew
  const assignment = await Participant.findById(participant.assignedToId);
  return assignment;
}

/**
 * Cleanup: Delete all participants from an event
 * (Used when deleting events)
 */
export async function deleteEventParticipants(eventId: string): Promise<void> {
  await Participant.deleteMany({ eventId });
}

export default {
  generateGuestToken,
  addParticipant,
  getParticipantsByEvent,
  getParticipant,
  getParticipantByEmail,
  updateParticipantStatus,
  linkParticipantToUser,
  verifyGuestToken,
  getParticipantCountByStatus,
  getParticipantsWhoDrawn,
  hasParticipantDrawn,
  getParticipantAssignment,
  deleteEventParticipants,
};
