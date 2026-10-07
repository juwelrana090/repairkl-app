import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    // Honeypot — hidden field real users never fill. Pretend success for bots.
    if (String(body.website ?? "").trim() !== "") {
      return NextResponse.json({ ok: true });
    }

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim().slice(0, 30);
    const subject = String(body.subject ?? "").trim().slice(0, 120);
    const message = String(body.message ?? "").trim();

    if (!name || name.length > 100) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }
    if (!EMAIL_RE.test(email) || email.length > 200) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (message.length < 10 || message.length > 5000) {
      return NextResponse.json(
        { error: "Please enter a message between 10 and 5000 characters." },
        { status: 400 },
      );
    }

    const session = await getSession();

    // Logged-in visitors get their ticket attached to their account;
    // guests are stored with guest contact fields so support can still reply.
    const ticket = await prisma.supportTicket.create({
      data: {
        ...(session
          ? { customerId: session.userId }
          : { guestName: name, guestEmail: email, guestPhone: phone || null }),
        subject: subject || "Website Enquiry",
        category: "Website Contact",
        messages: {
          create: {
            message,
            ...(session ? { senderId: session.userId } : {}),
          },
        },
      },
    });

    return NextResponse.json({ ok: true, ticketId: ticket.id }, { status: 201 });
  } catch (error) {
    console.error("[CONTACT_FORM]", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again or WhatsApp us instead." },
      { status: 500 },
    );
  }
}
