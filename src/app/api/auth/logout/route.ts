import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ message: "Logged out" });
  res.cookies.delete("repairkl_token");
  res.headers.set("Location", "/login");
  return res;
}

export async function GET() {
  return POST();
}
