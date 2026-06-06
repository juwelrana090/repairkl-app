import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const session = await requireAuth();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: { select: { name: true } },
      review: true,
    },
  });

  if (
    !booking ||
    booking.customerId !== session.userId ||
    booking.status !== "COMPLETED" ||
    booking.review
  ) {
    redirect("/orders");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-[#1b1d21] mb-2">
          Write a Review
        </h1>
        <p className="text-[#8f92a1] mb-6">
          Review your experience with {booking.service.name}
        </p>

        <div className="mb-6">
          <div className="flex items-center gap-4 p-4 bg-[#f9fafb] rounded-xl">
            <div>
              <p className="font-medium">{booking.service.name}</p>
              <p className="text-sm text-[#8f92a1]">
                Booking #{booking.bookingCode}
              </p>
            </div>
          </div>
        </div>

        <ReviewForm bookingId={booking.id} serviceId={booking.serviceId} />
      </div>
    </div>
  );
}

function ReviewForm({
  bookingId,
  serviceId,
}: {
  bookingId: string;
  serviceId: string;
}) {
  return (
    <div className="text-center py-8">
      <p className="text-[#8f92a1] mb-4">Review form component</p>
      <p className="text-sm text-[#8f92a1]">
        This will be a client component for submitting reviews
      </p>
    </div>
  );
}
