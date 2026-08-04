import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuoteBlock } from '../../core/models/block.model';

@Component({
  selector: 'app-quote-block',
  standalone: true,
  imports: [CommonModule],
  template: `
    <blockquote class="quote-block">
      <p>"{{ block().text }}"</p>
      @if (block().author) {
        <cite>— {{ block().author }}</cite>
      }
    </blockquote>
  `,
  styles: [`
    .quote-block {
      margin: 1.5rem 0;
      padding: 1.25rem 1.5rem;
      border-left: 4px solid var(--accent-color, #c9933b);
      background: var(--bg-card, rgba(201, 147, 59, 0.08));
      border-radius: 0 8px 8px 0;
      font-style: italic;

      p {
        margin: 0;
        font-size: 1.1rem;
        line-height: 1.6;
        color: var(--text-color, #222);
      }

      cite {
        display: block;
        margin-top: 0.75rem;
        font-weight: 600;
        font-style: normal;
        font-size: 0.95rem;
        color: var(--primary-color, #8b1e0f);
      }
    }
  `]
})
export class QuoteBlockComponent {
  readonly block = input.required<QuoteBlock>();
}
