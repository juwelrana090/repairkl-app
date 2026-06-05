"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { RatingStars, showToast } from "@/components/ui";

export default function ReviewPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return showToast("Please select a rating", "warning");
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, rating, comment }),
      });
      if (!res.ok) throw new Error("Failed to submit review");
      showToast("Review submitted! Thank you 🎉", "success");
      router.push(`/orders/${bookingId}`);
    } catch {
      showToast("Failed to submit review", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto pb-20 md:pb-0">
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/orders/${bookingId}`} className="w-10 h-10 rounded-full bg-[#f3f6f8] flex items-center justify-center">
          ←
        </Link>
        <h1 className="text-xl font-bold text-[#1b1d21] tracking-[-0.4px]">Write a Review</h1>
      </div>

      <div className="bg-white rounded-[24px] border border-[#e8e6ea] p-8">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">⭐</span>
          <h2 className="text-lg font-bold text-[#1b1d21]">How was your experience?</h2>
          <p className="text-sm text-[#8f92a1] mt-1">Your honest feedback helps others make better decisions</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Star rating */}
          <div className="flex flex-col items-center gap-3">
            <div className="transform scale-150">
              <RatingStars rating={rating} size={28} interactive onChange={setRating} />
            </div>
            {rating > 0 && (
              <p className="text-[#fd6b22] font-bold text-sm">{LABELS[rating]}</p>
            )}
          </div>

          {/* Quick tags */}
          <div>
            <p className="text-sm font-bold text-[#1b1d21] mb-3">What stood out? (optional)</p>
            <div className="flex flex-wrap gap-2">
              {["Punctual", "Professional", "Clean work", "Friendly", "Great value", "Would recommend"].map((tag) => {
                const sel = comment.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setComment(sel ? comment.replace(tag + ". ", "").replace(". " + tag, "").replace(tag, "") : comment + (comment ? ". " : "") + tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${sel ? "border-[#fd6b22] bg-[#fff0e8] text-[#fd6b22]" : "border-[#e6e8ec] text-[#8f92a1]"}`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment */}
          <div>
            <p className="text-sm font-bold text-[#1b1d21] mb-2">Additional comments (optional)</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Tell us more about your experience..."
              className="w-full border-2 border-[#e6e8ec] rounded-[16px] px-4 py-3 text-sm text-[#1b1d21] outline-none focus:border-[#fd6b22] resize-none placeholder:text-[#c4c4c4]"
            />
          </div>

          <Button type="submit" fullWidth loading={loading} size="lg">
            Submit Review
          </Button>
        </form>
      </div>
    </div>
  );
}
