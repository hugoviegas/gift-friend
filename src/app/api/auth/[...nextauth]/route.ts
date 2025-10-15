import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/models/User";
import bcrypt from "bcrypt";
import NextAuth from "next-auth";

// Extend the built-in JWT and Session types
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role?: string;
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role?: string;
    };
  }
}

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email and Password",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "user@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        // Validate input
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          // Connect to database
          await connectDB();

          // Find user by email
          const user = await (User as any).findOne({
            email: credentials.email,
          });

          if (!user) {
            throw new Error("No user found with this email");
          }

          // Verify password
          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!passwordMatch) {
            throw new Error("Incorrect password");
          }

          // Return user object for the session
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || "user",
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw new Error(
            error instanceof Error ? error.message : "Authentication failed"
          );
        }
      },
    }),
  ],

  callbacks: {
    /**
     * JWT callback - called whenever JWT is created or updated
     * Used to add custom claims to the token
     */
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id as string;
        token.email = user.email as string;
        token.name = user.name as string;
        if ("role" in user) {
          token.role = (user as any).role;
        }
      }
      return token;
    },

    /**
     * Session callback - called whenever session is checked
     * Used to add custom claims to the session
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role;
      }
      return session;
    },

    /**
     * Redirect callback - determines where user is redirected after sign in/out
     */
    async redirect({ url, baseUrl }) {
      // Redirect to home page if redirecting to base URL
      // Otherwise, redirect to the requested URL if it's allowed
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      } else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },

    /**
     * SignIn callback - controls whether a user is allowed to sign in
     * Can be used for additional validation
     */
    async signIn({ user, account, profile, email, credentials }) {
      console.log("User signed in:", user?.email);
      return true;
    },
  },

  // Configure NextAuth pages
  pages: {
    signIn: "/login",
    error: "/login",
  },

  // Session configuration
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update every 24 hours
  },

  // JWT configuration
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Enable debug in development
  debug: process.env.NODE_ENV === "development",

  // Use secure cookies in production
  useSecureCookies: process.env.NODE_ENV === "production",
};

// Create the NextAuth handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
