import createMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";

/**
 * next-intl middleware configuration
 * Handles language routing for PT-BR and EN
 */

// Supported locales
export const locales = ["en", "pt-BR"] as const;
export const defaultLocale = "pt-BR" as const;

/**
 * Language detection priority:
 * 1. URL path (e.g., /en/page or /pt-BR/page)
 * 2. Accept-Language header
 * 3. Cookies (if user saved preference)
 * 4. Default locale (pt-BR)
 */
export const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always", // Always show locale in URL
  pathnames: {
    // Map route names to localized paths (optional)
    "/": "/",
    "/login": "/login",
    "/register": "/register",
    "/dashboard": "/dashboard",
    "/events": "/events",
    "/events/[eventId]": "/events/[eventId]",
    "/profile": "/profile",
  },
});

/**
 * Main middleware function
 * Orchestrates language detection and routing
 */
export function middleware(request: NextRequest) {
  // Apply next-intl middleware for language detection and routing
  return intlMiddleware(request);
}

/**
 * Configure middleware to run on specific routes
 * Exclude static files, images, API routes, and public assets
 */
export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public folder
    // - api routes (except those needing i18n)
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};
