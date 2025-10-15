import mongoose, { Schema, Document } from "mongoose";

export enum ParticipantStatus {
  JOINED = "JOINED", // Just joined with name/email
  ACCOUNT_CREATED = "ACCOUNT_CREATED", // Created full account
  DRAWN = "DRAWN", // Completed the draw
  REVEALED = "REVEALED", // Seen the final reveal
}

export interface IParticipant extends Document {
  // Identity
  name: string; // Participant's name
  email: string; // Participant's email

  // Event reference
  eventId: mongoose.Types.ObjectId; // Reference to Event

  // Authentication
  guestToken?: string; // JWT for guest access (without password)
  userId?: mongoose.Types.ObjectId; // Reference to User if account created

  // Status tracking
  status: ParticipantStatus;
  joinedAt: Date;
  accountCreatedAt?: Date;

  // Draw information
  assignedToId?: mongoose.Types.ObjectId; // Who they drew (encrypted before storage)
  drawnAt?: Date;

  // Preferences
  locale: "pt-BR" | "en";

  // Metadata
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ParticipantSchema = new Schema<IParticipant>(
  {
    // Identity
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    // Event reference
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    // Authentication
    guestToken: {
      type: String,
      sparse: true, // Sparse index for optional field
      default: undefined,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
      default: undefined,
    },

    // Status tracking
    status: {
      type: String,
      enum: Object.values(ParticipantStatus),
      default: ParticipantStatus.JOINED,
      required: true,
    },
    joinedAt: {
      type: Date,
      default: () => new Date(),
      required: true,
    },
    accountCreatedAt: {
      type: Date,
      sparse: true,
      default: undefined,
    },

    // Draw information
    assignedToId: {
      type: Schema.Types.ObjectId,
      ref: "Participant",
      sparse: true,
      default: undefined,
    },
    drawnAt: {
      type: Date,
      sparse: true,
      default: undefined,
    },

    // Preferences
    locale: {
      type: String,
      enum: ["pt-BR", "en"],
      default: "pt-BR",
    },

    // Metadata
    ipAddress: {
      type: String,
      sparse: true,
    },
    userAgent: {
      type: String,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries (note: sparse: true on schema fields creates indexes automatically)
ParticipantSchema.index({ eventId: 1 });
ParticipantSchema.index({ email: 1, eventId: 1 }, { unique: true }); // Unique per event
ParticipantSchema.index({ status: 1 });

// Prevent duplicate email per event
ParticipantSchema.post("save", async function (doc, next) {
  try {
    // Check if another document exists with same email and eventId
    const existingCount = await mongoose.model("Participant").countDocuments({
      email: this.email,
      eventId: this.eventId,
      _id: { $ne: this._id },
    });

    if (existingCount > 0) {
      throw new Error(
        `Participant with email ${this.email} already exists in this event`
      );
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Export model with type safety
export const Participant =
  mongoose.models.Participant ||
  mongoose.model<IParticipant>("Participant", ParticipantSchema);

export default Participant;
