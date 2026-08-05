export type ContentBlock =
  | TextBlock
  | BulletBlock
  | ImageBlock
  | QuoteBlock
  | InfoBlock
  | TableBlock
  | SeparatorBlock
  | RelatedBlock
  | MapBlock;

export interface BaseBlock {
  type: string;
  id: string;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  title?: string;
  content: string;
}

export interface BulletBlock extends BaseBlock {
  id: string;
  type: 'bullet';
  title?: string;
  items: string[];
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  src: string;
  caption?: string;
  title?: string;
  align?: 'left' | 'right' | 'center';
  size?: 'small' | 'medium' | 'full';
}

export interface QuoteBlock extends BaseBlock {
  type: 'quote';
  text: string;
  author?: string;
}

export interface InfoBlock extends BaseBlock {
  type: 'info';
  variant: 'note' | 'warning' | 'lore';
  content: string;
}

export interface TableBlock extends BaseBlock {
  type: 'table';
  headers: string[];
  rows: string[][];
}

export interface SeparatorBlock extends BaseBlock {
  type: 'separator';
}

export interface RelatedBlock extends BaseBlock {
  type: 'related';
  items: { label: string; slug: string }[];
}

export interface MapBlock extends BaseBlock {
  type: 'map';
  image: string;
  pins?: MapPin[];
}

export interface MapPin {
  id: string;
  x: number; // porcentaje (0-100)
  y: number; // porcentaje (0-100)
  icon?: string;
  label: string;
  linkSlug?: string;
}
