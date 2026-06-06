import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { RatingStars } from "@/components/ui";
import WorkerProfileForm from "./WorkerProfileForm";

export const metadata: Metadata = { title: "My Profile – Worker" };

export default async function WorkerProfilePage() {
  const session = await getSession();
  const user = await prisma.user.findUnique({
    where: { id: session!.userId },
    include: {
      workerProfile: { include: { reviews: { include: { customer: { select: { fullName: true } } }, take: 5, orderBy: { createdAt: "desc" } } } },
    },
  });
  if (!user?.workerProfile) return <p className="text-center py-20">Worker profile not found.</p>;

  const { workerProfile: worker } = user;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {/* Header card */}
      <div className="bg-[#1b1d21] rounded-[24px] p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-[#4fbf67] flex items-center justify-center text-2xl font-bold text-white shrink-0">
            {user.fullName.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold">{user.fullName}</h1>
            <p className="text-white/60 text-sm">{worker.speciality}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-[#4fbf67] px-2 py-0.5 rounded-full font-bold">✓ Verified</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${worker.isAvailable ? "bg-green-600" : "bg-gray-600"}`}>
                {worker.isAvailable ? "Available" : "Unavailable"}
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 bg-white/10 rounded-[16px] p-4 mt-2">
          <div className="text-center">
            <p className="text-xl font-bold">{worker.rating.toFixed(1)}</p>
            <p className="text-xs text-white/60">Rating</p>
          </div>
          <div className="text-center border-x border-white/20">
            <p className="text-xl font-bold">{worker.reviewCount}</p>
            <p className="text-xs text-white/60">Reviews</p>
          </div>
          <div className="text-center border-r border-white/20">
            <p className="text-xl font-bold">{worker.totalJobs}</p>
            <p className="text-xs text-white/60">Jobs Done</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold">{worker.experience}yr</p>
            <p className="text-xs text-white/60">Experience</p>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-[24px] border border-[#e8e6ea] p-6">
        <h2 className="font-bold text-[#1b1d21] tracking-[-0.4px] mb-5">Edit Profile</h2>
        <WorkerProfileForm
          data={{
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            speciality: worker.speciality,
            bio: worker.bio ?? "",
            hourlyRate: Number(worker.hourlyRate),
            experience: worker.experience,
          }}
        />
      </div>

      {/* Recent reviews */}
      {worker.reviews.length > 0 && (
        <div className="bg-white rounded-[24px] border border-[#e8e6ea] p-6">
          <h2 className="font-bold text-[#1b1d21] mb-4">Recent Reviews</h2>
          <div className="space-y-4">
            {worker.reviews.map((r) => (
              <div key={r.id} className="pb-4 border-b border-[#e8e6ea] last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <RatingStars rating={r.rating} size={12} />
                  <span className="text-xs text-[#8f92a1]">by {r.customer.fullName}</span>
                </div>
                {r.comment && <p className="text-sm text-[#1b1d21]/70">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
