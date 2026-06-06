import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { StatusBadge } from "@/components/ui";
import WorkerJobActions from "./WorkerJobActions";

export default async function WorkerJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAuth();

  const assignment = await prisma.bookingWorker.findUnique({
    where: { id },
    include: {
      booking: {
        include: {
          service: { select: { name: true } },
          customer: {
            select: {
              fullName: true,
              phone: true,
              address: true,
            },
          },
        },
      },
    },
  });

  if (!assignment || assignment.booking.customerId !== session.userId) {
    redirect("/worker/jobs");
  }

  const { booking } = assignment;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1b1d21]">
              Job #{booking.bookingCode}
            </h1>
            <p className="text-sm text-[#8f92a1] mt-1">
              Assigned on {new Date(assignment.assignedAt).toLocaleDateString()}
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
        </div>

        <div className="border-t border-[#e8e6ea] pt-4 mb-6">
          <h3 className="font-bold text-[#1b1d21] mb-3">Customer Details</h3>
          <div className="space-y-2">
            <p className="text-[#8f92a1]">
              <span className="font-medium">{booking.customer.fullName}</span>
            </p>
            <p className="text-[#8f92a1]">{booking.customer.phone}</p>
            <p className="text-[#8f92a1]">
              {booking.customer.address ? `${booking.customer.address.street}, ${booking.customer.address.city}, ${booking.customer.address.state} ${booking.customer.address.zipCode}` : 'No address provided'}
            </p>
          </div>
        </div>
      </div>

      <WorkerJobActions assignment={assignment} />
    </div>
  );
}
