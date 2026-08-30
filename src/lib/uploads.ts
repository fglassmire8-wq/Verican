import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const MAX_SEGMENT_DEPTH = 3;
const SAFE_SEGMENT = /^[A-Za-z0-9._-]+$/;

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

/**
 * Runtime user uploads. Defaults to data/uploads (gitignored).
 * Point UPLOAD_DIR at a persistent volume on Fly/Railway so new photos
 * survive deploys. Vercel has no persistent disk — see README.
 *
 * Seed MAX A/C photos stay in public/uploads/max-ac/ and are served as
 * static files at /uploads/max-ac/... so they are not mixed with this dir.
 */
export function runtimeUploadDir(): string {
  return process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.join(process.cwd(), "data", "uploads");
}

export function contentTypeFor(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return CONTENT_TYPES[ext] || "application/octet-stream";
}

export function extFor(type: string, filename: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  const fromName = filename.split(".").pop()?.toLowerCase();
  if (fromName === "png" || fromName === "webp" || fromName === "jpg" || fromName === "jpeg") {
    return fromName === "jpeg" ? "jpg" : fromName;
  }
  return "jpg";
}

function safeJoin(root: string, segments: string[]): string | null {
  if (segments.length < 1 || segments.length > MAX_SEGMENT_DEPTH) return null;
  if (!segments.every((part) => SAFE_SEGMENT.test(part) && part !== "." && part !== "..")) {
    return null;
  }
  const resolved = path.resolve(root, ...segments);
  const rootResolved = path.resolve(root);
  if (resolved !== rootResolved && !resolved.startsWith(rootResolved + path.sep)) {
    return null;
  }
  return resolved;
}

export async function writeReviewPhoto(
  reviewId: string,
  filename: string,
  bytes: Buffer,
): Promise<string> {
  const dir = path.join(runtimeUploadDir(), reviewId);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);
  return `/media/${reviewId}/${filename}`;
}

export async function readRuntimeUpload(segments: string[]): Promise<{
  bytes: Buffer;
  contentType: string;
} | null> {
  const filename = segments[segments.length - 1];
  if (!filename) return null;
  const abs = safeJoin(runtimeUploadDir(), segments);
  if (!abs) return null;
  try {
    const bytes = await readFile(abs);
    return { bytes, contentType: contentTypeFor(filename) };
  } catch {
    return null;
  }
}
