import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui";
import AdminUsersClient from "./AdminUsersClient";

export const metadata: Metadata = { title: "Users – Admin" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; search?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const { role, search, page = "1" } = sp;
  const pageNum = Math.max(1, parseInt(page));
  const limit = 20;
  const skip = (pageNum - 1) * limit;

  const where: Record<string, unknown> = {};
  if (role && role !== "ALL") where.role = role;
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        address: true,
        _count: { select: { bookings: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1b1d21] tracking-[-0.5px]">Users</h1>
          <p className="text-sm text-[#8f92a1] mt-1">{total} total users</p>
        </div>
      </div>

      <AdminUsersClient
        users={users.map((u) => ({
          id: u.id,
          fullName: u.fullName,
          email: u.email,
          phone: u.phone,
          role: u.role,
          isActive: u.isActive,
          isEmailVerified: u.isEmailVerified,
          isPhoneVerified: u.isPhoneVerified,
          bookingCount: u._count.bookings,
          city: u.address?.city ?? "—",
          createdAt: u.createdAt.toISOString(),
        }))}
        total={total}
        page={pageNum}
        limit={limit}
        activeRole={role}
        search={search}
      />
    </div>
  );
}
