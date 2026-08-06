import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageBlock } from '../../core/models/block.model';

@Component({
  selector: 'app-image-block',
  standalone: true,
  imports: [CommonModule],
  template: `
    <figure
      class="image-block"
      [ngClass]="['align-' + (block().align || 'center'), 'size-' + (block().size || 'medium')]"
    >
      <div class="image-wrapper">
        <img [src]="block().src" [alt]="block().caption || block().title || 'Wiki image'" />
        <ng-container *ngIf="block().pins?.length">
          <ng-container *ngFor="let pin of block().pins">
            <span
              class="pin"
              [style.left.%]="pin.x"
              [style.top.%]="pin.y"
              [attr.title]="pin.label"
            ></span>
          </ng-container>
        </ng-container>
      </div>
      @if (block().caption) {
        <figcaption>{{ block().caption }}</figcaption>
      }
    </figure>
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
    `,
  ],
})
export class ImageBlockComponent {
  readonly block = input.required<ImageBlock>();
}
