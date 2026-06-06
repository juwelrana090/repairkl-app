import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const SESSION_COOKIE = "repairkl_session";
const TOKEN_COOKIE = "repairkl_token";
const JWT_SECRET = process.env.JWT_SECRET ?? "repairkl-secret-change-in-production";
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  fullName: string;
}

export async function createSession(payload: SessionPayload): Promise<string> {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: SESSION_DURATION });
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });
  return token;
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_COOKIE)?.value;
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE);
  cookieStore.delete(SESSION_COOKIE);
}

export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    const { redirect } = await import("next/navigation");
    redirect("/login");
  }
  return session as SessionPayload;
}
