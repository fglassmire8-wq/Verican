"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

export function ProductPhotoEditor({
  reviewId,
  photos,
}: {
  reviewId: string;
  photos: { id: string; path: string; alt: string; sortOrder: number }[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (![...data.getAll("photos")].some((item) => item instanceof File && item.size > 0)) {
      setError("Choose at least one photo.");
      return;
    }
    setPending(true);
    setError("");
    const res = await fetch(`/api/admin/reviews/${reviewId}/photos`, { method: "POST", body: data });
    const json = (await res.json().catch(() => null)) as { error?: string } | null;
    setPending(false);
    if (!res.ok) {
      setError(json?.error || "Upload failed.");
      return;
    }
    form.reset();
    router.refresh();
  }

  async function setCover(coverId: string) {
    setPending(true);
    setError("");
    const res = await fetch(`/api/admin/reviews/${reviewId}/photos`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coverId }),
    });
    const json = (await res.json().catch(() => null)) as { error?: string } | null;
    setPending(false);
    if (!res.ok) {
      setError(json?.error || "Could not set the cover photo.");
      return;
    }
    router.refresh();
  }

  async function move(id: string, direction: -1 | 1) {
    const ids = photos.map((photo) => photo.id);
    const index = ids.indexOf(id);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= ids.length) return;
    const order = [...ids];
    [order[index], order[next]] = [order[next], order[index]];
    setPending(true);
    setError("");
    const res = await fetch(`/api/admin/reviews/${reviewId}/photos`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order }),
    });
    const json = (await res.json().catch(() => null)) as { error?: string } | null;
    setPending(false);
    if (!res.ok) {
      setError(json?.error || "Could not reorder photos.");
      return;
    }
    router.refresh();
  }

  return (
    <section className="mt-8 border border-line bg-panel-2 p-4 rounded-[14px]">
      <p className="text-[11px] uppercase tracking-[0.12em] text-gold">Founder only</p>
      <h2 className="font-display text-2xl mt-1">Manage photos</h2>
      <p className="mt-1 text-sm text-muted">
        Visitors do not see these controls. The cover photo is first in the gallery and on the reviews grid.
      </p>
      {error ? <p className="mt-3 text-sm text-dont">{error}</p> : null}

      <form onSubmit={onUpload} className="mt-4 flex flex-wrap items-end gap-3">
        <label className="block text-sm">
          <span className="text-[11px] uppercase tracking-[0.12em] text-gold">Add photos</span>
          <input
            type="file"
            name="photos"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="mt-1 block text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="border border-gold bg-gold text-ink px-4 py-2 text-sm disabled:opacity-60"
        >
          {pending ? "Uploading…" : "Add photos"}
        </button>
      </form>

      {photos.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No photos yet.</p>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {photos.map((photo, index) => (
            <li key={photo.id} className="border border-line bg-panel p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.path} alt={photo.alt} className="max-h-40 w-auto mb-3" />
              <p className="text-xs text-muted mb-2">
                {index === 0 ? "Cover" : `Photo ${index + 1}`} · {photo.alt}
              </p>
              <div className="flex flex-wrap gap-2">
                {index === 0 ? null : (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => setCover(photo.id)}
                    className="border border-line px-3 py-1.5 text-sm hover:border-gold disabled:opacity-60"
                  >
                    Set as cover
                  </button>
                )}
                {index > 0 ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => move(photo.id, -1)}
                    className="border border-line px-3 py-1.5 text-sm hover:border-gold disabled:opacity-60"
                  >
                    Move up
                  </button>
                ) : null}
                {index < photos.length - 1 ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => move(photo.id, 1)}
                    className="border border-line px-3 py-1.5 text-sm hover:border-gold disabled:opacity-60"
                  >
                    Move down
                  </button>
                ) : null}
                <ConfirmButton
                  url={`/api/admin/photos/${photo.id}`}
                  confirmText={`Delete this photo (${photo.alt})? The file will be removed too.`}
                  label="Delete photo"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
