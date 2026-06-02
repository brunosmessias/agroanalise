import { NextResponse, type NextRequest } from "next/server";
import { auth } from "~/server/better-auth";

// Auth pages — logged-in users are bounced away from these.
const authRoutes = ["/login", "/register"];
// Public pages anyone can view (landing handled separately as exact "/").
const publicPrefixes = ["/a"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isPublic =
    pathname === "/" ||
    isAuthRoute ||
    publicPrefixes.some((route) => pathname.startsWith(route));

  if (!session && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
