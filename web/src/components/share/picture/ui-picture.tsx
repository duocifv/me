import { srcUrl } from "@/share/utils/srcUrl";

interface ImageFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  path: string | null;
  width: number;
  height: number;
  size: number;
  sizeInBytes: number;
  url: string;
}

interface ImageData {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  url: string;
  formats: {
    thumbnail?: ImageFormat;
    small?: ImageFormat;
    medium?: ImageFormat;
    large?: ImageFormat;
  };
  hash?: string;
  ext?: string;
  mime?: string;
  size?: number;
  previewUrl?: string;
  provider?: string;
  provider_metadata?: null;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

interface ResponsivePictureProps {
  image?: ImageData;
  alt?: string;
  class?: string;
  loading?: "lazy" | "eager";
}

export const UiPicture = ({
  image,
  alt,
  loading = "lazy",
  ...rest
}: ResponsivePictureProps) => {
  if (!image) return null;
  const { formats, name, url, width, height } = image;
  const defaultAlt = alt || name;
  return (
    <div>
      <picture {...rest}>
        {formats?.large && (
          <source
            media="(min-width: 1200px)"
            srcSet={srcUrl(formats?.large.url)}
            type={formats.large.mime}
          />
        )}
        {formats?.medium && (
          <source
            media="(min-width: 800px)"
            srcSet={srcUrl(formats.medium.url)}
            type={formats.medium.mime}
          />
        )}
        {formats?.small && (
          <source
            media="(min-width: 400px)"
            srcSet={srcUrl(formats.small.url)}
            type={formats.small.mime}
          />
        )}
        {formats?.thumbnail && (
          <source
            media="(max-width: 399px)"
            srcSet={srcUrl(formats.thumbnail.url)}
            type={formats.thumbnail.mime}
          />
        )}
        <img
          src={url ? srcUrl(url) : name}
          alt={defaultAlt}
          width={width}
          height={height}
          loading={loading}
          style={{ width: "100%", height: "100%" }}
        />
      </picture>
    </div>
  );
};
