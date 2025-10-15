import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Enhanced middleware for Gift Friend
 * Handles language routing, authentication checks, and protected routes
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
 * Protected routes that require authentication
 * Users must be logged in to access these
 */
const protectedRoutes = [
  "/dashboard",
  "/events/create",
  "/profile",
  "/wishlists",
];

/**
 * Public routes accessible without authentication
 */
const publicRoutes = ["/", "/login", "/register", "/join"];

/**
 * Check if a route requires authentication
 */
function isProtectedRoute(pathname: string): boolean {
  // Remove locale prefix from pathname for checking
  const pathWithoutLocale = locales.some((locale) =>
    pathname.startsWith(`/${locale}`)
  )
    ? pathname.split("/").slice(2).join("/")
    : pathname;

  return protectedRoutes.some(
    (route) =>
      pathWithoutLocale.startsWith(route) || pathWithoutLocale === route
  );
}

/**
 * Check if a route is public
 */
function isPublicRoute(pathname: string): boolean {
  const pathWithoutLocale = locales.some((locale) =>
    pathname.startsWith(`/${locale}`)
  )
    ? pathname.split("/").slice(2).join("/")
    : pathname;

  return publicRoutes.some(
    (route) =>
      pathWithoutLocale.startsWith(route) || pathWithoutLocale === route
  );
}

/**
 * Main middleware function
 * Orchestrates language detection, routing, and authentication
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply next-intl middleware for language detection and routing
  const intlResponse = intlMiddleware(request);

  // Get authentication token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Check if route requires authentication
  if (isProtectedRoute(pathname)) {
    // If not authenticated, redirect to login
    if (!token) {
      const locale =
        locales.find((l) => pathname.includes(`/${l}`)) || defaultLocale;
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If user is authenticated and tries to access login/register, redirect to dashboard
  if (
    token &&
    (pathname.includes("/login") || pathname.includes("/register"))
  ) {
    const locale =
      locales.find((l) => pathname.includes(`/${l}`)) || defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  // Return the i18n response with auth headers
  const response = NextResponse.next(intlResponse);

  // Add locale to response headers for use in server components
  const locale =
    locales.find((l) => pathname.startsWith(`/${l}`)) || defaultLocale;
  response.headers.set("x-locale", locale);

  // Add auth info to response headers if available
  if (token) {
    response.headers.set("x-user-id", token.sub || "");
    response.headers.set("x-user-email", token.email || "");
  }

  return response;
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
    // - api routes (except those needing auth)
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};
