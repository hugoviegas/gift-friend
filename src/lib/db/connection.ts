/**
 * MongoDB Connection Module
 * Handles connection pooling, error handling, and automatic reconnection
 * Works with both MongoDB Atlas and local MongoDB
 */

import mongoose from "mongoose";

// Load MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is not defined in .env.local or environment variables"
  );
}

// Global mongoose instance (for development hot reload)
interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: GlobalMongoose;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB
 * Uses cached connection in development to avoid multiple connections
 * Implements connection pooling and error handling
 */
export async function connectDB() {
  // Return cached connection if available
  if (cached.conn) {
    console.log("📦 Using cached MongoDB connection");
    return cached.conn;
  }

  // Return existing connection promise if currently connecting
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 5,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 1 as any,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then((mongoose) => {
        console.log("✅ MongoDB connected successfully");
        console.log(`📊 Database: ${mongoose.connection.name}`);
        console.log(`🔌 Connection state: ${mongoose.connection.readyState}`);

        // Log connection events
        mongoose.connection.on("disconnected", () => {
          console.warn("⚠️ MongoDB disconnected");
        });

        mongoose.connection.on("error", (error) => {
          console.error("❌ MongoDB connection error:", error);
        });

        mongoose.connection.on("reconnected", () => {
          console.log("🔄 MongoDB reconnected");
        });

        return mongoose;
      })
      .catch((error) => {
        console.error("❌ Error connecting to MongoDB:", error);
        cached.promise = null; // Reset promise on error to retry next time
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

/**
 * Disconnect from MongoDB
 * Useful for cleanup in tests or graceful shutdowns
 */
export async function disconnectDB() {
  if (cached.conn) {
    await cached.conn.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log("✅ MongoDB disconnected");
  }
}

/**
 * Get current connection status
 */
export function getConnectionStatus() {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  const state = mongoose.connection.readyState;
  return {
    ready: state === 1, // 1 = connected
    state: states[state] || "unknown",
    db: mongoose.connection.name,
  };
}

export default connectDB;
