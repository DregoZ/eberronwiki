import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TextBlock } from '../../core/models/block.model';
import { ParseInternalLinksPipe } from '../../shared/pipes/parse-internal-links.pipe';

@Component({
  selector: 'app-text-block',
  standalone: true,
  imports: [CommonModule, RouterLink, ParseInternalLinksPipe],
  template: `
    <div class="text-block">
      @if (block().title) {
        <h3 class="text-block-title" [id]="block().id || ('heading-' + block().title)">{{ block().title }}</h3>
      }

      @for (segment of block().content | parseInternalLinks; track $index) {
        @if (segment.isLink) {
          <a [routerLink]="'/wiki/' + segment.slug" class="internal-link">{{ segment.label }}</a>
        } @else {
          <span [class.bold]="segment.isBold" [class.italic]="segment.isItalic">{{ segment.text }}</span>
        }
      }
    </div>
  `,
  styles: [
    `
      .text-block-title {
        font-size: 1.5rem; // un h3 aprox
        font-weight: 700;
        margin: 0 0 0.75rem 0;
        color: var(--heading-color, var(--text-color, #2c2c2c));
      }
      .text-block {
        line-height: 1.7;
        font-size: 1.05rem;
        margin-bottom: 1.25rem;
        color: var(--text-color, #2c2c2c);
      }
      .internal-link {
        color: var(--primary-color, #8b1e0f);
        font-weight: 600;
        text-decoration: underline;
        text-decoration-color: rgba(139, 30, 15, 0.4);
        transition:
          color 0.2s,
          text-decoration-color 0.2s;
        &:hover {
          color: var(--primary-hover, #b22612);
          text-decoration-color: var(--primary-hover, #b22612);
        }
      }
      .bold {
        font-weight: 700;
      }
      .italic {
        font-style: italic;
      }
    `,
  ],
})
export class TextBlockComponent {
  readonly block = input.required<TextBlock>();
}
