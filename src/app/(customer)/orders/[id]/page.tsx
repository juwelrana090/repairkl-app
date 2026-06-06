import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { StatusBadge } from "@/components/ui";
import OrderActions from "./OrderActions";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAuth();

  const booking = await prisma.booking.findUnique({
    where: { bookingCode: id },
    include: {
      service: { select: { name: true, slug: true } },
      details: true,
      workers: {
        include: {
          worker: {
            include: {
              user: { select: { fullName: true, phone: true } },
            },
          },
        },
      },
      payment: true,
    },
  });

  if (!booking || booking.customerId !== session.userId) {
    redirect("/orders");
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1b1d21]">
              Booking #{booking.bookingCode}
            </h1>
            <p className="text-sm text-[#8f92a1] mt-1">
              Booked on {new Date(booking.createdAt).toLocaleDateString()}
            </p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-bold text-[#1b1d21] mb-2">Service</h3>
            <p className="text-[#8f92a1]">{booking.service.name}</p>
          </div>
          <div>
            <h3 className="font-bold text-[#1b1d21] mb-2">Scheduled</h3>
            <p className="text-[#8f92a1]">
              {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}
            </p>
          </div>
          <div>
            <h3 className="font-bold text-[#1b1d21] mb-2">Address</h3>
            <p className="text-[#8f92a1]">{booking.address}</p>
          </div>
          <div>
            <h3 className="font-bold text-[#1b1d21] mb-2">Payment</h3>
            <div className="flex items-center gap-2">
              <StatusBadge status={booking.paymentStatus} />
              <span className="text-[#8f92a1]">
                {booking.paymentMethod || "Pending"}
              </span>
            </div>
          </div>
        </div>

        {booking.notes && (
          <div className="mb-6">
            <h3 className="font-bold text-[#1b1d21] mb-2">Notes</h3>
            <p className="text-[#8f92a1]">{booking.notes}</p>
          </div>
        )}

        <div className="border-t border-[#e8e6ea] pt-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="font-bold text-[#1b1d21]">Total Amount</span>
            <span className="text-2xl font-bold text-[#fd6b22]">
              RM{Number(booking.totalAmount).toLocaleString()}
            </span>
          </div>
        </div>

        {booking.workers.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-[#1b1d21] mb-3">Assigned Workers</h3>
            <div className="space-y-3">
              {booking.workers.map((assignment) => (
                <div
                  key={assignment.workerId}
                  className="flex items-center justify-between p-3 bg-[#f9fafb] rounded-xl"
                >
                  <div>
                    <p className="font-medium">{assignment.worker.user.fullName}</p>
                    <p className="text-sm text-[#8f92a1]">{assignment.worker.user.phone}</p>
                  </div>
                  <div className="text-sm text-[#8f92a1]">
                    {assignment.worker.speciality}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <OrderActions booking={booking} />
    </div>
  );
}
