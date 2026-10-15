import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { defaultPathForRole } from "@/lib/auth/roles";

// Client-side nav check. Public pages are ISR-cached, so the logged-in state
// must come from this request, not from the page HTML.
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();

  const res = session
    ? NextResponse.json({
        authenticated: true,
        user: {
          id: session.userId,
          email: session.email,
          fullName: session.fullName,
          role: session.role,
          defaultPath: defaultPathForRole(session.role),
        },
      })
    : NextResponse.json({ authenticated: false, user: null });

  res.headers.set("Cache-Control", "private, no-store, max-age=0");
  return res;
}
