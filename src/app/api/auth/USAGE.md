// Quick Reference: Using NextAuth.js
// Location: src/app/api/auth/[...nextauth]/route.ts

// ============================================================================
// 1. CHECKING AUTHENTICATION IN SERVER COMPONENTS
// ============================================================================

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function ProtectedPage() {
const session = await getServerSession(authOptions);

if (!session) {
return <p>Not authenticated</p>;
}

return (
<div>
<p>User: {session.user.name}</p>
<p>Email: {session.user.email}</p>
<p>ID: {session.user.id}</p>
<p>Role: {session.user.role}</p>
</div>
);
}

// ============================================================================
// 2. PROTECTING API ROUTES
// ============================================================================

import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
const session = await getServerSession(authOptions);

if (!session) {
return Response.json({ error: "Unauthorized" }, { status: 401 });
}

// Now you can use session.user
const userId = session.user.id;

// Your protected logic here
return Response.json({ message: "Success", userId });
}

// ============================================================================
// 3. USING SESSIONS IN CLIENT COMPONENTS
// ============================================================================

"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function UserProfile() {
const { data: session, status } = useSession();

if (status === "loading") {
return <p>Loading...</p>;
}

if (status === "unauthenticated") {
return (
<button onClick={() => signIn()}>
Sign In
</button>
);
}

return (
<div>
<p>Welcome, {session?.user?.name}!</p>
<button onClick={() => signOut()}>
Sign Out
</button>
</div>
);
}

// ============================================================================
// 4. SIGN IN EXAMPLE
// ============================================================================

"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginForm() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");

async function handleSubmit(e: React.FormEvent) {
e.preventDefault();
setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/dashboard",
    });

    if (!result?.ok) {
      setError(result?.error || "Authentication failed");
    }

}

return (
<form onSubmit={handleSubmit}>
{error && <p style={{ color: "red" }}>{error}</p>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit">Sign In</button>
    </form>

);
}

// ============================================================================
// 5. CREATING A NEW USER
// ============================================================================

import { User } from "@/models/User";
import { connectDB } from "@/lib/db/connection";

export async function createUser(
email: string,
name: string,
password: string
) {
try {
await connectDB();

    // Check if user exists
    const existing = await (User as any).findOne({ email });
    if (existing) {
      throw new Error("User already exists");
    }

    // Create new user (password will be hashed automatically)
    const user = new User({ email, name, password });
    await user.save();

    return {
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    };

} catch (error) {
return {
success: false,
error: error instanceof Error ? error.message : "Failed to create user",
};
}
}

// ============================================================================
// 6. ROLE-BASED PROTECTION
// ============================================================================

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function requireAdmin() {
const session = await getServerSession(authOptions);

if (!session || session.user.role !== "admin") {
throw new Error("Admin access required");
}

return session;
}

export async function requireAuth() {
const session = await getServerSession(authOptions);

if (!session) {
throw new Error("Authentication required");
}

return session;
}

// Usage:
export async function GET() {
const session = await requireAdmin();
// Proceed with admin logic
return Response.json({ admin: session.user });
}

// ============================================================================
// 7. SESSION PROVIDER FOR CLIENT
// ============================================================================

// app/layout.tsx
import { SessionProvider } from "next-auth/react";

export default function RootLayout({
children,
}: {
children: React.ReactNode;
}) {
return (
<html>
<body>
<SessionProvider>
{children}
</SessionProvider>
</body>
</html>
);
}

// ============================================================================
// 8. MIDDLEWARE - REDIRECT UNAUTHENTICATED USERS
// ============================================================================

// src/middleware.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
const session = await getServerSession(authOptions);

// Check if accessing protected routes
if (request.nextUrl.pathname.startsWith("/dashboard")) {
if (!session) {
return NextResponse.redirect(new URL("/login", request.url));
}
}

return NextResponse.next();
}

export const config = {
matcher: ["/dashboard/:path*", "/admin/:path*"],
};

// ============================================================================
// 9. ENVIRONMENT VARIABLES REQUIRED
// ============================================================================

/\*

# .env.local

# NextAuth

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-min-32-chars

# MongoDB

MONGODB_URI=mongodb+srv://...

# Email (for password reset, future)

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASSWORD=password
\*/

// ============================================================================
// 10. COMMON ERRORS & SOLUTIONS
// ============================================================================

/\*
ERROR: "No user found with this email"
SOLUTION: Ensure user exists in database with that email

ERROR: "Incorrect password"
SOLUTION: Check password matches (case-sensitive)

ERROR: "NEXTAUTH_SECRET not defined"
SOLUTION: Add NEXTAUTH_SECRET to .env.local

ERROR: "MONGODB_URI not defined"
SOLUTION: Add MONGODB_URI to .env.local

ERROR: "Email already exists"
SOLUTION: User with that email already registered

ERROR: Session null in middleware
SOLUTION: Make sure SessionProvider wraps your app
and getServerSession is used server-side
\*/
