import { Pipe, PipeTransform, inject } from '@angular/core';
import { LinkParserService, TextSegment } from '../../core/services/link-parser.service';

@Pipe({
  name: 'parseInternalLinks',
  standalone: true,
  pure: true,
})
export class ParseInternalLinksPipe implements PipeTransform {
  private linkParser = inject(LinkParserService);

  transform(text: string): TextSegment[] {
    return this.linkParser.parse(text);
  }
}
