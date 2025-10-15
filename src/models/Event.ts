import mongoose, { Schema, Document } from "mongoose";

export enum EventStatus {
  PLANNING = "PLANNING", // Before draw date
  DRAW_ACTIVE = "DRAW_ACTIVE", // Draw in progress
  DRAWN = "DRAWN", // All participants have drawn
  COMPLETED = "COMPLETED", // Event date passed
  REVEALED = "REVEALED", // Reveal activated by admin
  CANCELLED = "CANCELLED", // Event cancelled
}

export type CurrencyType = "EUR" | "BRL" | "USD";

export interface IEvent extends Document {
  // Basic info
  name: string; // Event name
  description?: string; // Event description
  code: string; // Unique event code for joining

  // Admin & participants
  adminId: mongoose.Types.ObjectId; // Event creator (User)
  participants: mongoose.Types.ObjectId[]; // Participant IDs

  // Timing
  date: Date; // Event date
  time?: string; // Event time (e.g., "18:00")
  suggestedDrawDate?: Date; // Suggested date for the draw

  // Location & gift info
  location?: string; // Event location
  budgetMin: number; // Minimum gift value
  budgetMax: number; // Maximum gift value
  currency: CurrencyType; // Currency code

  // Status
  status: EventStatus;
  drawInitiatedAt?: Date;
  revealActivatedAt?: Date;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    // Basic info
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: undefined,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      match: /^[A-Z0-9]{6}$/, // 6-character alphanumeric code
    },

    // Admin & participants
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "Participant",
      },
    ],

    // Timing
    date: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          // Event date must be in the future
          return value > new Date();
        },
        message: "Event date must be in the future",
      },
    },
    time: {
      type: String,
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format
      default: undefined,
    },
    suggestedDrawDate: {
      type: Date,
      default: undefined,
    },

    // Location & gift info
    location: {
      type: String,
      trim: true,
      maxlength: 500,
      default: undefined,
    },
    budgetMin: {
      type: Number,
      required: true,
      min: 0,
      default: 10,
    },
    budgetMax: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: function (value) {
          return value > (this as any).budgetMin;
        },
        message: "Budget max must be greater than budget min",
      },
    },
    currency: {
      type: String,
      enum: ["EUR", "BRL", "USD"],
      required: true,
      default: "BRL",
    },

    // Status
    status: {
      type: String,
      enum: Object.values(EventStatus),
      default: EventStatus.PLANNING,
      required: true,
    },
    drawInitiatedAt: {
      type: Date,
      sparse: true,
      default: undefined,
    },
    revealActivatedAt: {
      type: Date,
      sparse: true,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries (note: unique: true in schema creates index automatically)
EventSchema.index({ adminId: 1 });
EventSchema.index({ status: 1 });
EventSchema.index({ date: 1 });
EventSchema.index({ createdAt: -1 });

export const Event =
  mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);

export default Event;
