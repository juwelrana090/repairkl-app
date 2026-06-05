"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { showToast } from "@/components/ui";

export default function TicketReplyForm({ ticketId }: { ticketId: string }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/support/tickets/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, message }),
      });
      if (!res.ok) throw new Error();
      setMessage("");
      router.refresh();
    } catch { showToast("Failed to send", "error"); }
    finally { setLoading(false); }
  };

  const QUICK_REPLIES = [
    "Thank you for contacting us. We're looking into this.",
    "Could you please provide more details?",
    "This has been resolved. Please let us know if you need further help.",
    "We apologize for the inconvenience.",
  ];

  return (
    <form onSubmit={handleSubmit} className="border-t border-[#e8e6ea] pt-4">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {QUICK_REPLIES.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setMessage(q)}
            className="text-[10px] text-[#2196f3] bg-blue-50 px-2.5 py-1 rounded-full hover:bg-blue-100 font-medium truncate max-w-[200px]"
          >
            {q.slice(0, 32)}…
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Type your reply..."
          className="flex-1 border-2 border-[#e6e8ec] rounded-[14px] px-4 py-3 text-sm outline-none focus:border-[#2196f3] resize-none"
        />
        <Button type="submit" loading={loading} disabled={!message.trim()} className="self-end bg-[#2196f3] hover:bg-[#1976d2] px-5 h-12">
          Send
        </Button>
      </div>
    </form>
  );
}
