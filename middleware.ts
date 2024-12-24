import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("appwrite-session");
  const pathname = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ["/sign-in", "/sign-up"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // If there's no session and trying to access a protected route
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // If there's a session and trying to access auth routes
  if (session && isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Handle invalid session (user not found in database)
  if (session && request.nextUrl.searchParams.get("error") === "no_user") {
    const response = NextResponse.redirect(new URL("/sign-in", request.url));
    response.cookies.delete("appwrite-session");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}; 