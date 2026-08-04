import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageBlock } from '../../core/models/block.model';

@Component({
  selector: 'app-image-block',
  standalone: true,
  imports: [CommonModule],
  template: `
    <figure class="image-block" [ngClass]="['align-' + (block().align || 'center'), 'size-' + (block().size || 'medium')]">
      <img [src]="block().src" [alt]="block().caption || block().title || 'Wiki image'" />
      @if (block().caption) {
        <figcaption>{{ block().caption }}</figcaption>
      }
    </figure>
  `,
  styles: [`
    .image-block {
      margin: 1.5rem 0;
      display: flex;
      flex-direction: column;
      align-items: center;

      img {
        max-width: 100%;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
      }

      figcaption {
        margin-top: 0.5rem;
        font-size: 0.9rem;
        font-style: italic;
        color: var(--text-muted, #666);
      }

      &.align-left { align-items: flex-start; }
      &.align-right { align-items: flex-end; }
      &.align-center { align-items: center; }

      &.size-small img { max-width: 300px; }
      &.size-medium img { max-width: 600px; }
      &.size-full img { width: 100%; }
    }
  `]
})
export class ImageBlockComponent {
  readonly block = input.required<ImageBlock>();
}
