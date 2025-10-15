"use client";

import { jwtVerify } from "jose";

/**
 * Guest Authentication Utilities (T029)
 *
 * Functions to check user authentication status:
 * - isGuest(): Checks if user is a guest participant (has guest token)
 * - isFullUser(): Checks if user is a logged-in account holder
 * - checkAuth(): Returns authentication status and user info
 *
 * Used by components to:
 * - Show/hide protected features
 * - Display upgrade prompts
 * - Enforce access control
 */

interface AuthToken {
  sub?: string;
  email?: string;
  name?: string;
  type?: "guest" | "user";
  iat?: number;
  exp?: number;
}

interface AuthStatus {
  isAuthenticated: boolean;
  isGuest: boolean;
  isFullUser: boolean;
  user?: AuthToken;
  token?: string;
}

/**
 * Decode and verify JWT token without making API call
 * Safe for client-side use as it only validates structure
 */
export async function decodeToken(token: string): Promise<AuthToken | null> {
  if (!token) return null;

  try {
    // Client-side JWT decoding (base64 without verification)
    // In production, always verify tokens server-side!
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const decoded = JSON.parse(
      Buffer.from(parts[1], "base64").toString("utf-8")
    );
    return decoded;
  } catch (err) {
    console.error("Failed to decode token:", err);
    return null;
  }
}

/**
 * Check if user is a guest participant
 * Guest: Has valid guest token with type='guest'
 */
export async function isGuest(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    // Check session storage for guest token
    const guestToken = sessionStorage.getItem("guestToken");
    if (!guestToken) return false;

    const decoded = await decodeToken(guestToken);
    return decoded?.type === "guest";
  } catch (err) {
    return false;
  }
}

/**
 * Check if user is a full authenticated account holder
 * Full User: Has valid auth token with type='user' (from NextAuth.js)
 */
export async function isFullUser(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    // Check for NextAuth session via API
    const response = await fetch("/api/auth/session");
    if (!response.ok) return false;

    const session = await response.json();
    return !!session?.user;
  } catch (err) {
    return false;
  }
}

/**
 * Get complete authentication status
 */
export async function checkAuth(): Promise<AuthStatus> {
  if (typeof window === "undefined") {
    return {
      isAuthenticated: false,
      isGuest: false,
      isFullUser: false,
    };
  }

  try {
    // Check for guest token
    const guestToken = sessionStorage.getItem("guestToken");
    if (guestToken) {
      const decoded = await decodeToken(guestToken);
      if (decoded?.type === "guest") {
        return {
          isAuthenticated: true,
          isGuest: true,
          isFullUser: false,
          user: decoded,
          token: guestToken,
        };
      }
    }

    // Check for full user auth (NextAuth.js)
    const sessionResponse = await fetch("/api/auth/session");
    if (sessionResponse.ok) {
      const session = await sessionResponse.json();
      if (session?.user) {
        return {
          isAuthenticated: true,
          isGuest: false,
          isFullUser: true,
          user: {
            sub: session.user.id,
            email: session.user.email,
            name: session.user.name,
            type: "user",
          },
        };
      }
    }

    return {
      isAuthenticated: false,
      isGuest: false,
      isFullUser: false,
    };
  } catch (err) {
    console.error("Auth check error:", err);
    return {
      isAuthenticated: false,
      isGuest: false,
      isFullUser: false,
    };
  }
}

/**
 * Store guest token in session storage
 * Called after successful join as guest
 */
export function storeGuestToken(eventId: string, token: string): void {
  if (typeof window === "undefined") return;

  // Store with event ID for multi-event scenarios
  sessionStorage.setItem(`guestToken_${eventId}`, token);
  sessionStorage.setItem("guestToken", token); // Also store global for easy access
}

/**
 * Retrieve guest token for specific event
 */
export function getGuestToken(eventId?: string): string | null {
  if (typeof window === "undefined") return null;

  if (eventId) {
    return sessionStorage.getItem(`guestToken_${eventId}`);
  }

  return sessionStorage.getItem("guestToken");
}

/**
 * Clear all authentication tokens
 * Called on logout
 */
export function clearAuth(): void {
  if (typeof window === "undefined") return;

  // Clear all guest tokens
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key?.startsWith("guestToken")) {
      sessionStorage.removeItem(key);
    }
  }
}

/**
 * Hook-like wrapper for React components
 * Usage in components:
 * const { isGuest, isFullUser } = useAuth();
 */
export async function useAuthStatus(): Promise<AuthStatus> {
  return checkAuth();
}

/**
 * Check if specific feature requires upgrade
 * Guest users cannot:
 * - View Secret Santa assignments
 * - View wishlists
 * - Send messages
 * - Create events (admin)
 * - Manage event settings
 */
export async function canAccessFeature(
  feature:
    | "viewAssignment"
    | "viewWishlist"
    | "sendMessage"
    | "createEvent"
    | "manageEvent"
): Promise<boolean> {
  const status = await checkAuth();

  // Full users can access all features
  if (status.isFullUser) return true;

  // Guests cannot access protected features
  if (status.isGuest) {
    return ![
      "viewAssignment",
      "viewWishlist",
      "sendMessage",
      "createEvent",
      "manageEvent",
    ].includes(feature);
  }

  // Non-authenticated users cannot access any protected features
  return false;
}

/**
 * Require authentication middleware
 * Redirect to login if not authenticated
 */
export function requireAuth(redirectTo: string = "/login"): void {
  if (typeof window === "undefined") return;

  checkAuth().then((status) => {
    if (!status.isAuthenticated) {
      window.location.href = redirectTo;
    }
  });
}

/**
 * Require full user authentication middleware
 * Redirect to upgrade if only guest authenticated
 */
export function requireFullUser(redirectTo: string = "/register"): void {
  if (typeof window === "undefined") return;

  checkAuth().then((status) => {
    if (!status.isFullUser) {
      window.location.href = redirectTo;
    }
  });
}
