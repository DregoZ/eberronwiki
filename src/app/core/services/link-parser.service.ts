import { Injectable } from '@angular/core';

export interface TextSegmentLink {
  isLink: true;
  label: string;
  slug: string;
}

export interface TextSegmentString {
  isLink: false;
  text: string;
  isBold?: boolean;
  isItalic?: boolean;
}

export type TextSegment = TextSegmentLink | TextSegmentString;

@Injectable({
  providedIn: 'root',
})
export class LinkParserService {
  parse(text: string): TextSegment[] {
    if (!text) return [];

    // First parse internal links: [[target|label]] or [[target]]
    const regex = /\[\[(.+?)\]\]/g;
    const initialSegments: TextSegment[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        initialSegments.push({
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

      initialSegments.push({
        isLink: true,
        label,
        slug,
      });

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      initialSegments.push({
        isLink: false,
        text: text.substring(lastIndex),
      });
    }

    // Second pass: Parse inline markdown (bold/italic) on text segments (non-links)
    const finalSegments: TextSegment[] = [];

    for (const segment of initialSegments) {
      if (segment.isLink) {
        finalSegments.push(segment);
      } else {
        const formattedSegments = this.parseFormatting(segment.text);
        finalSegments.push(...formattedSegments);
      }
    }

    return finalSegments;
  }

  private parseFormatting(text: string): TextSegmentString[] {
    if (!text) return [];

    // Match ***bold+italic***, **bold**, *italic*, __bold__, _italic_
    const fmtRegex = /(\*\*\*|___)(.*?)\1|(\*\*|__)(.*?)\3|(\*|_)(.*?)\5/g;
    const result: TextSegmentString[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = fmtRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        result.push({
          isLink: false,
          text: text.substring(lastIndex, match.index),
        });
      }

      if (match[1]) {
        // ***bold italic***
        result.push({
          isLink: false,
          text: match[2],
          isBold: true,
          isItalic: true,
        });
      } else if (match[3]) {
        // **bold**
        result.push({
          isLink: false,
          text: match[4],
          isBold: true,
        });
      } else if (match[5]) {
        // *italic*
        result.push({
          isLink: false,
          text: match[6],
          isItalic: true,
        });
      }

      lastIndex = fmtRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      result.push({
        isLink: false,
        text: text.substring(lastIndex),
      });
    }

    return result;
  }
}

