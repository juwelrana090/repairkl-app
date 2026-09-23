"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { showToast } from "@/components/ui";

export default function TicketReplyForm({ ticketId }: { ticketId: string }) {
  const [message, setMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/support/tickets/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId,
          message: message.trim(),
          isInternal,
        }),
      });

      if (res.ok) {
        showToast("Reply sent successfully", "success");
        setMessage("");
        window.location.reload();
      } else {
        showToast("Failed to send reply", "error");
      }
    } catch (error) {
      showToast("Error sending reply", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="font-bold text-[#001353] mb-4">Reply to Ticket</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your reply..."
          rows={4}
          className="w-full p-3 border border-[#ddddee] rounded-xl focus:outline-none focus:border-[#034795] resize-none"
          required
        />
        
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
              className="w-4 h-4 accent-[#034795]"
            />
            <span className="text-sm text-[#5b6480]">Internal note</span>
          </label>
          
          <Button
            type="submit"
            disabled={loading || !message.trim()}
          >
            {loading ? "Sending..." : "Send Reply"}
          </Button>
        </div>
      </form>
    </div>
  );
}
