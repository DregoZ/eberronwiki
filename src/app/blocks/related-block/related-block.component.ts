import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RelatedBlock } from '../../core/models/block.model';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-related-block',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatChipsModule],
  template: `
    <div class="related-block">
      <h3><mat-icon>auto_awesome</mat-icon> Contenido Relacionado</h3>
      <div class="related-items">
        @for (item of block().items; track item.slug) {
          <a [routerLink]="'/wiki/' + item.slug" class="related-chip">
            <mat-icon>article</mat-icon>
            {{ item.label }}
          </a>
        }
      </div>
    </div>
  `,
  styles: [`
    .related-block {
      margin: 2rem 0;
      padding: 1.25rem;
      background: var(--bg-card, #fcfaf7);
      border: 1px dashed var(--accent-color, #c9933b);
      border-radius: 8px;

      h3 {
        margin: 0 0 0.85rem 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.05rem;
        color: var(--primary-color, #8b1e0f);
      }

      .related-items {
        display: flex;
        flex-wrap: wrap;
        gap: 0.6rem;
      }

      .related-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.4rem 0.8rem;
        background-color: var(--chip-bg, #eee);
        color: var(--text-color, #333);
        border-radius: 16px;
        font-size: 0.9rem;
        text-decoration: none;
        transition: background-color 0.2s, transform 0.1s;

        mat-icon {
          font-size: 1.1rem;
          width: 1.1rem;
          height: 1.1rem;
        }

        &:hover {
          background-color: var(--primary-color, #8b1e0f);
          color: #fff;
          transform: translateY(-1px);
        }
      }
    }
  `]
})
export class RelatedBlockComponent {
  readonly block = input.required<RelatedBlock>();
}
