import { Injectable } from '@angular/core';

export interface TextSegmentInternalLink {
  isLink: true;
  isExternal?: false;
  label: string;
  slug: string;
}

export interface TextSegmentExternalLink {
  isLink: true;
  isExternal: true;
  label: string;
  url: string;
}

export type TextSegmentLink = TextSegmentInternalLink | TextSegmentExternalLink;

export interface TextSegmentString {
  isLink: false;
  text: string;
  isBold?: boolean;
  isItalic?: boolean;
}

export type TextSegment = TextSegmentLink | TextSegmentString;

// Protocolos permitidos en enlaces externos (evita javascript:, data:, etc.)
const EXTERNAL_PROTOCOL = String.raw`(?:https?:\/\/|mailto:)`;

@Injectable({
  providedIn: 'root',
})
export class LinkParserService {
  parse(text: string): TextSegment[] {
    if (!text) return [];

    // Primera pasada, en un solo recorrido:
    //   1. enlaces internos:  [[destino|etiqueta]] o [[destino]]
    //   2. enlaces externos:  [etiqueta](https://ejemplo.com)
    //   3. URLs sueltas:      https://ejemplo.com
    const regex = new RegExp(
      String.raw`\[\[(.+?)\]\]` +
        String.raw`|\[([^\[\]]+?)\]\((${EXTERNAL_PROTOCOL}[^\s)]+)\)` +
        String.raw`|(${EXTERNAL_PROTOCOL}[^\s<>"']+)`,
      'g',
    );
    const initialSegments: TextSegment[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const [full, internalContent, externalLabel, externalUrl, bareUrl] = match;
      let matchEnd = regex.lastIndex;

      let segment: TextSegmentLink;

      if (internalContent !== undefined) {
        const parts = internalContent.split('|');
        const target = parts[0].trim();
        const label = parts.length > 1 ? parts[1].trim() : target;

        segment = {
          isLink: true,
          label,
          slug: this.toSlug(target),
        };
      } else if (externalUrl !== undefined) {
        segment = {
          isLink: true,
          isExternal: true,
          label: externalLabel.trim(),
          url: externalUrl,
        };
      } else {
        // URL suelta: la puntuación final pertenece a la frase, no a la URL
        const trailing = bareUrl.match(/[.,;:!?)\]]+$/);
        const url = trailing ? bareUrl.slice(0, -trailing[0].length) : bareUrl;
        matchEnd -= full.length - url.length;

        segment = {
          isLink: true,
          isExternal: true,
          label: url,
          url,
        };
      }

      if (match.index > lastIndex) {
        initialSegments.push({
          isLink: false,
          text: text.substring(lastIndex, match.index),
        });
      }

      initialSegments.push(segment);

      lastIndex = matchEnd;
      regex.lastIndex = matchEnd;
    }

    if (lastIndex < text.length) {
      initialSegments.push({
        isLink: false,
        text: text.substring(lastIndex),
      });
    }

    // Segunda pasada: markdown inline (negrita/cursiva) sobre los segmentos de texto
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

  private toSlug(target: string): string {
    return target
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\/]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
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
