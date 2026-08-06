import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageBlock, ImagePin } from '../../core/models/block.model';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-image-block',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <figure
      class="image-block"
      [ngClass]="['align-' + (block().align || 'center'), 'size-' + (block().size || 'medium')]"
    >
      <div class="image-wrapper">
        <img
          (click)="open()"
          style="cursor:pointer;"
          [src]="block().src"
          [alt]="block().caption || block().title || 'Wiki image'"
        />
        @if (block().pins?.length) {
          @for (pin of block().pins; track pin.id || pin.label) {
            <span
              class="pin"
              [style.left.%]="pin.x"
              [style.top.%]="pin.y"
              [attr.title]="pin.label"
              (click)="navigate(pin)"
            ></span>
          }
        }
      </div>
      @if (block().caption) {
        <figcaption>{{ block().caption }}</figcaption>
      }
    </figure>

    @if (enlarged) {
      <div class="overlay" (click)="close()">
        <div class="overlay-content" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="close()" aria-label="Close">✕</button>
          <img [src]="block().src" [alt]="block().caption || block().title || 'Wiki image'" />
        </div>
      </div>
    }
  `,
  styles: [
    `
      .image-block {
        margin: 1.5rem 0;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .image-wrapper {
        position: relative;
        display: inline-block;
      }

      .image-wrapper img {
        max-width: 100%;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
      }

      .pin {
        position: absolute;
        width: 30px;
        height: 30px;
        background: #ff6b6b;
        border-radius: 50% 50% 50% 0;
        transform: translate(-50%, -100%) rotate(-45deg);
        cursor: pointer;

        /* Crea un borde blanco perfecto de 2px alrededor de toda la silueta del pin */
        filter: drop-shadow(0px 0px 0px #fff) drop-shadow(2px 2px 0px #fff)
          drop-shadow(-2px -2px 0px #fff) drop-shadow(-2px 2px 0px #fff)
          drop-shadow(2px -2px 0px #fff);
      }

      /* El punto blanco interior */
      .pin::after {
        content: '';
        position: absolute;
        width: 12px;
        height: 12px;
        background: #fff;
        border-radius: 50%;
        top: 9px;
        left: 9px;
        transform: rotate(45deg);
      }
      /* Sombra proyectada en el suelo (debajo del borde blanco) */
      .pin::before {
        content: '';
        position: absolute;
        width: 8px;
        height: 5px;
        background: rgba(0, 0, 0, 0.35);
        border-radius: 50%;
        bottom: -9px;
        left: -9px;
        transform: rotate(45deg);
        filter: blur(1.5px);
        z-index: -1; /* Se asegura de quedar por detrás del pin y su borde */
      }

      figcaption {
        margin-top: 0.5rem;
        font-size: 0.9rem;
        font-style: italic;
        color: var(--text-muted, #666);
      }

      .align-left {
        align-items: flex-start;
      }
      .align-right {
        align-items: flex-end;
      }
      .align-center {
        align-items: center;
      }

      .size-small img {
        max-width: 300px;
      }
      .size-medium img {
        max-width: 600px;
      }
      .size-full img {
        width: 100%;
      }

      @media (max-width: 991px) {
        .image-block {
          width: 100%;
          max-width: 100%;
        }

        .image-wrapper {
          display: block;
          width: 100%;
          max-width: 100%;
        }

        .image-wrapper img {
          display: block;
          width: 100%;
          max-width: 100%;
          height: auto;
        }

        .size-small img,
        .size-medium img,
        .size-full img {
          width: 100%;
          max-width: 100%;
        }

        .close-btn {
          top: 0.5rem;
          right: 0.5rem;
        }
      }

      /* Lightbox overlay */
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
    `,
  ],
})
export class ImageBlockComponent {
  readonly block = input.required<ImageBlock>();
  constructor(private router: Router) {}

  /** Navigate to the pin's link if defined */
  navigate(pin: ImagePin): void {
    if (pin.linkSlug) {
      this.router.navigateByUrl('/wiki/' + pin.linkSlug);
    }
  }

  /** Lightbox state */
  enlarged = false;

  open(): void {
    this.enlarged = true;
  }

  close(): void {
    this.enlarged = false;
  }
}
