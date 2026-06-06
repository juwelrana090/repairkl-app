import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Customers – Support" };

export default async function SupportCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const sp = await searchParams;
  const search = sp.search?.trim();

  const customers = await prisma.user.findMany({
    where: {
      role: "CUSTOMER",
      ...(search ? {
        OR: [
          { fullName: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
        ],
      } : {}),
    },
    include: {
      _count: { select: { bookings: true, tickets: true } },
      address: { select: { city: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1b1d21] tracking-[-0.5px]">Customers</h1>
      </div>

      {/* Search */}
      <form className="flex gap-2">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by name, email, or phone…"
          className="flex-1 h-11 px-4 border border-[#e6e8ec] rounded-[12px] text-sm outline-none focus:border-[#2196f3]"
        />
        <button type="submit" className="h-11 px-5 bg-[#2196f3] text-white rounded-[12px] text-sm font-bold">
          Search
        </button>
        {search && <a href="/support/customers" className="h-11 px-4 bg-[#f3f6f8] rounded-[12px] text-sm font-bold flex items-center text-[#8f92a1]">Clear</a>}
      </form>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {customers.map((c) => (
          <div key={c.id} className="bg-white rounded-[20px] border border-[#e8e6ea] p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-[#fff0e8] flex items-center justify-center font-bold text-[#fd6b22] shrink-0">
                {c.fullName.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-[#1b1d21] truncate">{c.fullName}</p>
                <p className="text-xs text-[#8f92a1] truncate">{c.email}</p>
                <p className="text-xs text-[#8f92a1]">{c.phone}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center mb-4">
              <div className="bg-[#f9fafb] rounded-[10px] p-2">
                <p className="text-sm font-bold text-[#1b1d21]">{c._count.bookings}</p>
                <p className="text-[10px] text-[#8f92a1]">Bookings</p>
              </div>
              <div className="bg-[#f9fafb] rounded-[10px] p-2">
                <p className="text-sm font-bold text-[#1b1d21]">{c._count.tickets}</p>
                <p className="text-[10px] text-[#8f92a1]">Tickets</p>
              </div>
              <div className="bg-[#f9fafb] rounded-[10px] p-2">
                <p className="text-sm font-bold text-[#1b1d21]">{c.address?.city || "—"}</p>
                <p className="text-[10px] text-[#8f92a1]">City</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/support/tickets?customer=${c.id}`}
                className="flex-1 h-8 bg-[#f3f6f8] rounded-[8px] text-xs font-bold text-[#1b1d21] flex items-center justify-center"
              >
                View Tickets
              </Link>
              <Link
                href={`mailto:${c.email}`}
                className="h-8 w-8 bg-[#2196f3] rounded-[8px] flex items-center justify-center text-white text-sm"
              >
                ✉
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
