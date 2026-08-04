import { ContentBlock } from './block.model';

export interface PageContent {
  slug: string;
  title: string;
  tags?: string[];
  aliases?: string[];
  unlockCondition?: string | null;
  blocks: ContentBlock[];
}
