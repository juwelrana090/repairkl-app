"use client";

import { useEffect, useRef, useState } from "react";
import WhatsAppIcon from "@/components/marketing/WhatsAppIcon";
import { openWhatsApp, PHONE_DISPLAY } from "@/lib/whatsapp";

const QUICK_REPLIES = [
  "Fridge repair",
  "Washing machine repair",
  "Dryer repair",
  "Aircond service",
  "Aircond installation",
];

// Support hours in Malaysia time (8:00 AM – 10:00 PM)
const OPEN_HOUR = 8;
const CLOSE_HOUR = 22;

function isWithinSupportHours(): boolean {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hour12: false,
      timeZone: "Asia/Kuala_Lumpur",
    }).format(new Date()),
  );
  return hour >= OPEN_HOUR && hour < CLOSE_HOUR;
}

function currentTimeLabel(): string {
  return new Intl.DateTimeFormat("en-MY", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kuala_Lumpur",
  }).format(new Date());
}

export default function WhatsAppChat() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [online, setOnline] = useState(true);
  const [time, setTime] = useState("");
  const [showBadge, setShowBadge] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Online status + greeting time (client only, avoids hydration mismatch)
  useEffect(() => {
    const update = () => {
      setOnline(isWithinSupportHours());
      setTime(currentTimeLabel());
    };
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, []);

  // Show an unread badge after a few seconds to draw attention once
  useEffect(() => {
    const id = window.setTimeout(() => setShowBadge(true), 6000);
    return () => window.clearTimeout(id);
  }, []);

  // Focus the input when opened; close on Escape
  useEffect(() => {
    if (!open) return;
    setShowBadge(false);
    textareaRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = (text: string) => {
    const body =
      text.trim() || "Hi RepairKL, I need help with an appliance repair.";
    openWhatsApp(body);
    setMessage("");
  };

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[60] flex flex-col items-end gap-3">
      {/* Chat panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Chat with RepairKL on WhatsApp"
          className="w-[calc(100vw-2.5rem)] max-w-[360px] rounded-2xl overflow-hidden bg-white shadow-[0_24px_60px_-12px_rgba(0,0,0,0.35)] border border-black/5 motion-safe:animate-[waIn_0.2s_ease-out]"
        >
          {/* Header */}
          <div className="bg-[#075e54] text-white px-4 py-3.5 flex items-center gap-3">
            <div className="relative shrink-0">
              <img
                src="/images/logo/logo.png"
                alt=""
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover bg-white"
              />
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#075e54] ${
                  online ? "bg-[#25d366]" : "bg-gray-400"
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold leading-tight">RepairKL Support</p>
              <p className="text-xs text-white/75">
                {online
                  ? "Online · typically replies in minutes"
                  : "Away · we reply from 8AM"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                className="w-5 h-5"
                aria-hidden="true"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Conversation */}
          <div className="bg-[#efeae2] px-4 py-5 space-y-3 max-h-[46vh] overflow-y-auto">
            <div className="max-w-[85%] bg-white rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm">
              <p className="text-sm text-[#001353] leading-relaxed">
                Hi there, welcome to RepairKL.
                <br />
                Which appliance needs fixing? Pick one below or type your
                message.
              </p>
              {time && (
                <p className="text-[10px] text-[#5b6480] text-right mt-1">
                  {time}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() =>
                    send(`Hi RepairKL, I'd like to book ${q.toLowerCase()}.`)
                  }
                  className="text-xs font-semibold text-[#075e54] bg-white border border-[#075e54]/20 hover:bg-[#075e54] hover:text-white rounded-full px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075e54]"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(message);
            }}
            className="flex items-end gap-2 p-3 bg-[#f0f2f5]"
          >
            <label htmlFor="wa-message" className="sr-only">
              Your message
            </label>
            <textarea
              id="wa-message"
              ref={textareaRef}
              rows={1}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(message);
                }
              }}
              placeholder="Type a message"
              className="flex-1 resize-none max-h-28 rounded-2xl bg-white px-4 py-2.5 text-sm text-[#001353] placeholder:text-[#5b6480] outline-none focus:ring-2 focus:ring-[#25d366]"
            />
            <button
              type="submit"
              aria-label="Send on WhatsApp"
              className="w-11 h-11 rounded-full bg-[#25d366] hover:bg-[#1ebe5a] text-white flex items-center justify-center shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075e54] focus-visible:ring-offset-2"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
                aria-hidden="true"
              >
                <path d="M3.4 20.4 21 12 3.4 3.6l-.01 6.53L15 12 3.39 13.87z" />
              </svg>
            </button>
          </form>
          <p className="text-[10px] text-center text-[#5b6480] bg-[#f0f2f5] pb-2">
            Opens WhatsApp · {PHONE_DISPLAY}
          </p>
        </div>
      )}

      {/* Floating launcher */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close WhatsApp chat" : "Chat with us on WhatsApp"}
        aria-expanded={open}
        className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25d366] hover:bg-[#1ebe5a] text-white shadow-[0_12px_30px_-6px_rgba(37,211,102,0.6)] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25d366]/40"
      >
        {showBadge && !open && (
          <span
            className="absolute inset-0 rounded-full bg-[#25d366] motion-safe:animate-ping opacity-30"
            aria-hidden="true"
          />
        )}
        {open ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            className="relative w-7 h-7"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <WhatsAppIcon className="relative w-8 h-8" />
        )}
        {showBadge && !open && (
          <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-[#034795] text-white text-[11px] font-bold flex items-center justify-center border-2 border-white">
            1
          </span>
        )}
      </button>

      <style>{`
        @keyframes waIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
