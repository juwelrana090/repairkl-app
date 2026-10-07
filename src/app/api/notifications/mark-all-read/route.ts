import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// HTML-form friendly: the notifications page posts here without JS,
// so redirect back instead of returning JSON.
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  await prisma.notification.updateMany({
    where: { userId: session.userId, isRead: false },
    data: { isRead: true },
  });

  return NextResponse.redirect(new URL("/notifications", request.url), 303);
}
