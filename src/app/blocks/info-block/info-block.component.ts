import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoBlock } from '../../core/models/block.model';
import { MatIconModule } from '@angular/material/icon';
import { ParseInternalLinksPipe } from '../../shared/pipes/parse-internal-links.pipe';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-info-block',
  standalone: true,
  imports: [CommonModule, MatIconModule, ParseInternalLinksPipe, RouterLink],
  template: `
    <div class="info-block" [id]="block().id || null" [ngClass]="block().variant">
      <div class="icon-container">
        <mat-icon>{{ getIcon(block().variant) }}</mat-icon>
      </div>
      <div class="info-content">
        @for (paragraph of paragraphs; track $index) {
          <p class="info-paragraph">
            @for (segment of (paragraph | parseInternalLinks); track $index) {
              @if (segment.isLink) {
                @if (segment.isExternal) {
                  <a [href]="segment.url" class="external-link" target="_blank" rel="noopener noreferrer">{{ segment.label }}</a>
                } @else {
                  <a
                    [routerLink]="segment.slug ? '/wiki/' + segment.slug : []"
                    [fragment]="segment.fragment"
                    class="internal-link"
                  >{{ segment.label }}</a>
                }
              } @else {
                <span [class.bold]="segment.isBold" [class.italic]="segment.isItalic">{{ segment.text }}</span>
              }
            }
          </p>
        }
      </div>
    </div>
  `,
  styles: [`
    .info-block {
      display: flex;
      gap: 1rem;
      padding: 1rem 1.25rem;
      border-radius: 8px;
      margin: 1.25rem 0;
      border: 1px solid transparent;

      .icon-container {
        display: flex;
        align-items: center;
      }

      .info-content {
        flex: 1;
        line-height: 1.6;
      }

      .info-paragraph {
        margin: 0 0 0.5rem 0;
        &:last-child {
          margin-bottom: 0;
        }
      }

      .internal-link, .external-link {
        font-weight: 600;
        text-decoration: underline;
      }

      .external-link {
        text-decoration-style: dotted;
        &::after {
          content: '↗';
          font-size: 0.75em;
          vertical-align: super;
          margin-left: 0.15em;
        }
      }

      .bold {
        font-weight: 700;
      }

      .italic {
        font-style: italic;
      }

      /* Variantes */
      &.note {
        background-color: rgba(21, 101, 192, 0.08);
        border-color: rgba(21, 101, 192, 0.3);
        .icon-container mat-icon { color: #1565c0; }
      }

      &.lore {
        background-color: var(--bg-card, rgba(0, 0, 0, 0.03));
        border-color: var(--border-color, #e0e0e0);
        .icon-container mat-icon { color: var(--primary-color, #8b1e0f); }
      }

      &.warning {
        background-color: rgba(230, 81, 0, 0.08);
        border-color: rgba(230, 81, 0, 0.3);
        .icon-container mat-icon { color: #e65100; }
      }

      &.mechanics {
        background-color: rgba(21, 101, 192, 0.08);
        border-color: rgba(21, 101, 192, 0.3);
        .icon-container mat-icon { color: #1565c0; }
      }

      &.secret {
        background-color: rgba(106, 27, 154, 0.08);
        border-color: rgba(106, 27, 154, 0.3);
        .icon-container mat-icon { color: #6a1b9a; }
      }
    }
  `]
})
export class InfoBlockComponent {
  readonly block = input.required<InfoBlock>();

  get paragraphs(): string[] {
    const raw = this.block().content;
    if (Array.isArray(raw)) {
      return raw;
    }
    return raw ? raw.split('\n\n') : [];
  }

  getIcon(variant: string): string {
    switch (variant) {
      case 'note':
        return 'info';
      case 'warning':
        return 'warning';
      case 'mechanics':
        return 'settings';
      case 'secret':
        return 'visibility_off';
      case 'lore':
      default:
        return 'auto_stories';
    }
  }
}
