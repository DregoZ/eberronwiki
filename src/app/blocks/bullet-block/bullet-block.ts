import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ParseInternalLinksPipe } from '../../shared/pipes/parse-internal-links.pipe';
import { BulletBlock } from '../../core/models/block.model';

@Component({
  selector: 'app-bullet-block',
  standalone: true,
  imports: [CommonModule, RouterLink, ParseInternalLinksPipe],
  template: `
    <div class="bullet-block">
      @if (block().title) {
        <div class="bullet-title">
          {{ block().title }}
        </div>
      }

      <ul>
        @for (item of block().items; track $index) {
          <li>
            @for (segment of item | parseInternalLinks; track $index) {
              @if (segment.isLink) {
                <a [routerLink]="'/wiki/' + segment.slug" class="internal-link">
                  {{ segment.label }}
                </a>
              } @else {
                <span>{{ segment.text }}</span>
              }
            }
          </li>
        }
      </ul>
    </div>
  `,
  styles: [
    `
      .bullet-block {
        margin-bottom: 1.5rem;
      }

      .bullet-title {
        font-weight: 700;
        margin-bottom: 0.5rem;
        font-size: 1.05rem;
        color: var(--text-color);
      }

      ul {
        margin: 0;
        padding-left: 1.5rem;
      }

      li {
        margin-bottom: 0.5rem;
        line-height: 1.7;
      }

      .internal-link {
        color: var(--primary-color, #8b1e0f);
        font-weight: 600;
        text-decoration: underline;
        text-decoration-color: rgba(139, 30, 15, 0.4);
      }

      .internal-link:hover {
        color: var(--primary-hover, #b22612);
      }
    `,
  ],
})
export class BulletBlockComponent {
  readonly block = input.required<BulletBlock>();
}
