import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "repairkl-secret-change-in-production",
);

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/otp",
  "/forgot-password",
  "/reset-password",
  "/about",
  "/our-services",
  "/contact",
  "/faq",
  "/privacy",
  "/terms",
  "/onboarding",
];

// Roles allowed in the app (CUSTOMER goes to /home, others to role dashboards)
const ROLE_DEFAULT_PATHS: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  WORKER: "/worker/dashboard",
  SUPPORT: "/support/dashboard",
  CUSTOMER: "/home",
};

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Handle force-logout flag (set by API error handlers on 401)
  if (searchParams.get("logout") === "1") {
    const cleanUrl = new URL(request.url);
    cleanUrl.searchParams.delete("logout");
    const response = NextResponse.redirect(cleanUrl);
    response.cookies.delete("repairkl_token");
    return response;
  }

  const token = request.cookies.get("repairkl_token")?.value;

  const isPublicPath = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  // Skip auth check for API routes and static files
  if (pathname.startsWith("/api/") || pathname.startsWith("/_next/")) {
    return NextResponse.next();
  }

  // No token → redirect to login (except public paths)
  if (!token && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Has token on login/register page → redirect to correct dashboard
  if (token && (pathname === "/login" || pathname === "/register")) {
    try {
      const { payload } = await jwtVerify(token, SECRET);
      const role = (payload as { role: string }).role;
      const defaultPath = ROLE_DEFAULT_PATHS[role] ?? "/home";
      return NextResponse.redirect(new URL(defaultPath, request.url));
    } catch {
      // Invalid token — clear it and allow login page
      const response = NextResponse.next();
      response.cookies.delete("repairkl_token");
      return response;
    }
  }

  // Protected path with token — verify role access
  if (token && !isPublicPath) {
    try {
      const { payload } = await jwtVerify(token, SECRET);
      const role = (payload as { role: string }).role;

      // Block CUSTOMER from admin/worker/support panels
      if (role === "CUSTOMER") {
        const adminPaths = ["/admin/", "/worker/", "/support/"];
        if (adminPaths.some((p) => pathname.startsWith(p))) {
          return NextResponse.redirect(new URL("/home", request.url));
        }
      }

      // Block non-ADMIN from /admin/ paths
      if (role !== "ADMIN" && pathname.startsWith("/admin/")) {
        return NextResponse.redirect(
          new URL(ROLE_DEFAULT_PATHS[role] ?? "/home", request.url),
        );
      }

      // Block non-WORKER from /worker/ paths
      if (role !== "WORKER" && pathname.startsWith("/worker/")) {
        return NextResponse.redirect(
          new URL(ROLE_DEFAULT_PATHS[role] ?? "/home", request.url),
        );
      }

      // Block non-SUPPORT from /support/ paths
      if (
        role !== "SUPPORT" &&
        role !== "ADMIN" &&
        pathname.startsWith("/support/")
      ) {
        return NextResponse.redirect(
          new URL(ROLE_DEFAULT_PATHS[role] ?? "/home", request.url),
        );
      }
    } catch {
      // Invalid/expired token — clear and redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("repairkl_token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|assets/|images/|icons/|fonts/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
