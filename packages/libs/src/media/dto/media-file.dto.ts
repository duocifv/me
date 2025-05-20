export interface MediaFileDto {
  id: string;
  variants: Record<'thumbnail' | 'medium' | 'large', string>;
  mimetype: string;
  size: number;
  createdAt: Date;
}
