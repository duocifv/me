import * as React from "react";

export function srcUrl(url?: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const base = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") || "";
  const path = url.replace(/^\/+/, "");
  return `${base}/${path}`;
}

export interface ImageFormat {
  url: string;
  mime: string;
}

export interface ImageData {
  url: string;
  alt?: string;
  width: number;
  height: number;
  formats?: Partial<
    Record<"thumbnail" | "small" | "medium" | "large", ImageFormat>
  >;
}

export interface ResponsivePictureProps
  extends Omit<
    React.ImgHTMLAttributes<HTMLImageElement>,
    "src" | "alt" | "width" | "height"
  > {
  /** Either a string URL or ImageData object */
  src: string | ImageData;
  alt?: string;
  loading?: "lazy" | "eager";
  className?: string;
}

export const Picture: React.FC<ResponsivePictureProps> = ({
  src,
  alt,
  loading = "lazy",
  className,
  ...imgProps
}) => {
  // If src is string, render simple img
  if (typeof src === "string") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={srcUrl(src)}
        alt={alt || ""}
        loading={loading}
        className={className}
        {...imgProps}
      />
    );
  }

  // Destructure imageData
  const { url, width, height, formats, alt: dataAlt } = src;
  const defaultAlt = alt ?? dataAlt ?? "";

  return (
    <picture className={className}>
      {formats?.large && (
        <source
          srcSet={srcUrl(formats.large.url)}
          media="(min-width: 1200px)"
          type={formats.large.mime}
        />
      )}
      {formats?.medium && (
        <source
          srcSet={srcUrl(formats.medium.url)}
          media="(min-width: 800px)"
          type={formats.medium.mime}
        />
      )}
      {formats?.small && (
        <source
          srcSet={srcUrl(formats.small.url)}
          media="(min-width: 400px)"
          type={formats.small.mime}
        />
      )}
      {formats?.thumbnail && (
        <source
          srcSet={srcUrl(formats.thumbnail.url)}
          media="(max-width: 399px)"
          type={formats.thumbnail.mime}
        />
      )}
      <img
        src={srcUrl(url)}
        width={width}
        height={height}
        alt={defaultAlt}
        loading={loading}
        style={{ width: "100%", height: "auto" }}
        {...imgProps}
      />
    </picture>
  );
};
