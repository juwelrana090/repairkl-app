import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import ProfileForm from "./ProfileForm";

export const metadata: Metadata = { title: "My Profile – RepairKL" };

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-lg font-bold text-[#1b1d21]">Please log in first</p>
        <Link href="/login" className="text-[#fd6b22] mt-2">Return to login</Link>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { address: true },
  });

  if (!user) return null;

  const stats = await prisma.booking.aggregate({
    where: { customerId: session.userId },
    _count: true,
  });
  const completed = await prisma.booking.count({
    where: { customerId: session.userId, status: "COMPLETED" },
  });

  return (
    <div className="max-w-2xl mx-auto pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-[#1b1d21] rounded-[24px] p-6 text-white mb-6 relative overflow-hidden">
        <div className="absolute -right-4 -top-6 w-28 h-28 bg-[#fd6b22]/20 rounded-full" />
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#fd6b22] flex items-center justify-center text-2xl font-bold text-white shrink-0">
            {user.fullName.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold">{user.fullName}</h1>
            <p className="text-white/60 text-sm mt-0.5">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-[#fd6b22] px-2 py-0.5 rounded-full font-bold capitalize">{user.role.toLowerCase()}</span>
              {user.isPhoneVerified && <span className="text-xs bg-[#4fbf67] px-2 py-0.5 rounded-full font-bold">✓ Verified</span>}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-6 bg-white/10 rounded-[16px] p-4">
          <div className="text-center">
            <p className="text-xl font-bold">{stats._count}</p>
            <p className="text-xs text-white/60">Total Orders</p>
          </div>
          <div className="text-center border-x border-white/20">
            <p className="text-xl font-bold">{completed}</p>
            <p className="text-xs text-white/60">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold">4.8</p>
            <p className="text-xs text-white/60">Avg Rating</p>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="bg-white rounded-[24px] border border-[#e8e6ea] divide-y divide-[#e8e6ea] mb-6 overflow-hidden">
        {[
          { href: "/orders", icon: "📋", label: "My Orders", sub: `${stats._count} total` },
          { href: "/saved", icon: "❤️", label: "Saved Services", sub: "View favorites" },
          { href: "/notifications", icon: "🔔", label: "Notifications", sub: "Manage alerts" },
          { href: "/support/new", icon: "🎧", label: "Support", sub: "Get help" },
        ].map((item) => (
          <a key={item.href} href={item.href} className="flex items-center gap-4 px-5 py-4 hover:bg-[#f9fafb] transition-colors">
            <div className="w-10 h-10 rounded-[12px] bg-[#fff0e8] flex items-center justify-center text-lg shrink-0">{item.icon}</div>
            <div className="flex-1">
              <p className="font-medium text-sm text-[#1b1d21]">{item.label}</p>
              <p className="text-xs text-[#8f92a1]">{item.sub}</p>
            </div>
            <span className="text-[#8f92a1]">→</span>
          </a>
        ))}
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-[24px] border border-[#e8e6ea] p-6">
        <h2 className="text-lg font-bold text-[#1b1d21] tracking-[-0.4px] mb-5">Edit Profile</h2>
        <ProfileForm
          user={{
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            address: user.address?.street ?? "",
            city: user.address?.city ?? "",
            state: user.address?.state ?? "",
            zipCode: user.address?.zipCode ?? "",
          }}
        />
      </div>

      {/* Sign out */}
      <form action="/api/auth/logout" method="POST" className="mt-4">
        <button type="submit" className="w-full h-14 rounded-[16px] border-2 border-[#f15223] text-[#f15223] font-bold text-sm hover:bg-red-50 transition-colors">
          Sign Out
        </button>
      </form>
    </div>
  );
}
