import Image, { type ImageProps } from "next/image";
import { PHOTO_BLUR_DATA_URL, photoNeedsOriginalFile } from "@/lib/photo";

type CatalogImageProps = Omit<
  ImageProps,
  "src" | "alt" | "placeholder" | "blurDataURL" | "unoptimized"
> & {
  src: string;
  alt: string;
};

export function CatalogImage({ src, alt, ...rest }: CatalogImageProps) {
  return (
    <Image
      {...rest}
      src={src}
      alt={alt}
      placeholder="blur"
      blurDataURL={PHOTO_BLUR_DATA_URL}
      unoptimized={photoNeedsOriginalFile(src)}
    />
  );
}
