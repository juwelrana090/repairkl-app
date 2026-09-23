import { NextResponse, type NextRequest } from "next/server";

const AUTH_COOKIES = ["repairkl_token", "repairkl_session"];

// Same attributes the cookie was created with (see src/lib/auth/session.ts),
// otherwise some browsers keep the old cookie.
const EXPIRED_COOKIE = {
  path: "/",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 0,
  expires: new Date(0),
};

function clearAuth(res: NextResponse): NextResponse {
  for (const name of AUTH_COOKIES) res.cookies.set(name, "", EXPIRED_COOKIE);
  res.headers.set("Cache-Control", "no-store, max-age=0");
  return res;
}

/** fetch()/XHR callers that explicitly ask for JSON get JSON; browser form posts / links get redirected. */
function wantsJson(req: NextRequest): boolean {
  const accept = req.headers.get("accept") ?? "";
  return accept.includes("application/json") && !accept.includes("text/html");
}

function logout(req: NextRequest): NextResponse {
  if (wantsJson(req)) {
    return clearAuth(
      NextResponse.json({ message: "Logged out", redirectTo: "/login" }),
    );
  }
  // 303 → browser follows with GET /login. Relative Location avoids leaking the
  // internal host (e.g. localhost:3000) when running behind a reverse proxy.
  return clearAuth(
    new NextResponse(null, { status: 303, headers: { Location: "/login" } }),
  );
}

export async function POST(req: NextRequest) {
  return logout(req);
}

export async function GET(req: NextRequest) {
  return logout(req);
}
