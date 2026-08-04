import { Injectable } from '@angular/core';

export interface TextSegmentLink {
  isLink: true;
  label: string;
  slug: string;
}

export interface TextSegmentString {
  isLink: false;
  text: string;
}

export type TextSegment = TextSegmentLink | TextSegmentString;

@Injectable({
  providedIn: 'root',
})
export class LinkParserService {
  parse(text: string): TextSegment[] {
    if (!text) return [];

    const regex = /\[\[(.+?)\]\]/g;
    const segments: TextSegment[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        segments.push({
          isLink: false,
          text: text.substring(lastIndex, match.index),
        });
      }

      const rawContent = match[1]; // e.g. "Sharn" or "Khorvaire|El continente"
      const parts = rawContent.split('|');
      const target = parts[0].trim();
      const label = parts.length > 1 ? parts[1].trim() : target;
      
      // Generate slug from target
      const slug = target
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\/]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      segments.push({
        isLink: true,
        label,
        slug,
      });

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      segments.push({
        isLink: false,
        text: text.substring(lastIndex),
      });
    }

    return segments;
  }
}
