"use client";

import Image from "next/image";
import { useState } from "react";

type Photo = { path: string; alt: string };

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(0);
  if (!photos.length) return null;
  const current = photos[index] ?? photos[0];

  return (
    <div>
      <div className="relative aspect-[4/5] bg-panel-2 border border-line overflow-hidden">
        <Image
          src={current.path}
          alt={current.alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
      {photos.length > 1 ? (
        <div className="mt-3 grid grid-cols-6 gap-2">
          {photos.map((photo, i) => (
            <button
              key={photo.path}
              type="button"
              onClick={() => setIndex(i)}
              className={`relative aspect-square overflow-hidden border ${
                i === index ? "border-gold" : "border-line"
              }`}
              aria-label={photo.alt}
            >
              <Image src={photo.path} alt="" fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      ) : null}
      <p className="mt-3 text-sm text-muted">{current.alt}</p>
    </div>
  );
}
