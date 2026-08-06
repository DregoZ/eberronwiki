import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageBlock, GalleryBlock } from '../../core/models/block.model';
import { ImageBlockComponent } from '../image-block/image-block.component';

/**
 * Gallery component: shows a collection of ImageBlock objects in a responsive 2‑column grid.
 * Clicking an image opens a fullscreen pop‑out (lightbox) using the same styling as ImageBlock.
 */
@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, ImageBlockComponent],
  template: `
    <h3 class="gallery-title">Galería de imágenes</h3>
    <div class="gallery-grid">
      @for (img of block().images; track img.id) {
        <div class="gallery-item" (click)="open(img)">
          <img [src]="img.src" [alt]="img.caption || img.title" class="gallery-thumb" />
        </div>
      }
    </div>

    @if (selected()) {
      <div class="overlay" (click)="close()">
        <div class="overlay-content" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="close()" aria-label="Close">✕</button>
          <app-image-block [block]="selected()!"></app-image-block>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .gallery-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
        margin: 2rem 0;
        /* rows will size automatically based on .gallery-item aspect ratio */
      }

      .gallery-item img,
      .gallery-thumb {
        width: 100%;
        height: 100%;
        object-fit: cover; /* fill area, cropping if needed */
        display: block;
      }

      .gallery-item {
        width: 100%;
        aspect-ratio: 16 / 9; /* uniform 16:9 thumbnail area */
        background: #e0e0e0; /* neutral background for empty space */
        cursor: pointer;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.2s ease-out;
      }

      .overlay-content {
        position: relative;
        max-width: 90vw;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        animation: scaleIn 0.2s ease-out;
      }

      .overlay-content img {
        max-height: 70vh;
        object-fit: contain;
      }

      .close-btn {
        position: absolute;
        top: -1.5rem;
        right: -1.5rem;
        background: #ff6b6b;
        border: none;
        color: #fff;
        font-size: 1.5rem;
        line-height: 1;
        border-radius: 50%;
        width: 2.5rem;
        height: 2.5rem;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      @keyframes scaleIn {
        from {
          transform: scale(0.9);
        }
        to {
          transform: scale(1);
        }
      }

      @media (max-width: 991px) {
        .gallery-grid {
          grid-template-columns: 1fr;
          margin: 1.25rem 0;
        }

        .close-btn {
          top: 0.5rem;
          right: 0.5rem;
        }
      }
    `,
  ],
})
export class GalleryComponent {
  /** Gallery block supplied by the page JSON */
  readonly block = input.required<GalleryBlock>();

  private _selected: ImageBlock | null = null;

  /** open lightbox */
  open(img: ImageBlock): void {
    this._selected = img;
  }

  /** close lightbox */
  close(): void {
    this._selected = null;
  }

  /** getter used in the template */
  selected(): ImageBlock | null {
    return this._selected;
  }
}
