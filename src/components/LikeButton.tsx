"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LikeButton({
  reviewId,
  initialCount,
  initialLiked,
  canLike,
}: {
  reviewId: string;
  initialCount: number;
  initialLiked: boolean;
  canLike: boolean;
}) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(initialLiked);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function toggle() {
    if (!canLike) {
      setError("Sign in to like a verified review.");
      return;
    }
    setPending(true);
    setError("");
    const res = await fetch(`/api/reviews/${reviewId}/like`, { method: "POST" });
    const data = await res.json();
    setPending(false);
    if (!res.ok) {
      setError(data.error || "Could not like this review.");
      return;
    }
    setLiked(data.liked);
    setCount(data.count);
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={`text-sm tracking-wide border px-3 py-1.5 ${
          liked ? "border-gold text-gold" : "border-line text-muted hover:text-cream"
        }`}
      >
        {liked ? "Liked" : "Like"} · {count}
      </button>
      {error ? <p className="mt-2 text-xs text-dont">{error}</p> : null}
    </div>
  );
}
