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
    <div class="info-block" [ngClass]="block().variant">
      <div class="icon-container">
        <mat-icon>{{ getIcon(block().variant) }}</mat-icon>
      </div>
      <div class="info-content">
        @for (paragraph of paragraphs; track $index) {
          <p class="info-paragraph">
            @for (segment of (paragraph | parseInternalLinks); track $index) {
              @if (segment.isLink) {
                <a [routerLink]="'/wiki/' + segment.slug" class="internal-link">{{ segment.label }}</a>
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

      .bold {
        font-weight: 700;
      }

      .italic {
        font-style: italic;
      }

      .internal-link {
        font-weight: 600;
        text-decoration: underline;
      }

      &.note {
        background-color: rgba(33, 150, 243, 0.1);
        border-color: rgba(33, 150, 243, 0.3);
        color: #0d47a1;
        .icon-container { color: #1976d2; }
      }
      :host-context(.dark-theme) &.note {
        background-color: rgba(144, 202, 249, 0.1);
        border-color: rgba(144, 202, 249, 0.3);
        color: #bbdefb;
        .icon-container { color: #90caf9; }
      }

      &.warning {
        background-color: rgba(255, 152, 0, 0.1);
        border-color: rgba(255, 152, 0, 0.3);
        color: #e65100;
        .icon-container { color: #f57c00; }
      }
      :host-context(.dark-theme) &.warning {
        background-color: rgba(255, 183, 77, 0.1);
        border-color: rgba(255, 183, 77, 0.3);
        color: #ffe0b2;
        .icon-container { color: #ffb74d; }
      }

      &.lore {
        background-color: rgba(156, 39, 176, 0.1);
        border-color: rgba(156, 39, 176, 0.3);
        color: #4a148c;
        .icon-container { color: #7b1fa2; }
      }
      :host-context(.dark-theme) &.lore {
        background-color: rgba(186, 104, 200, 0.1);
        border-color: rgba(186, 104, 200, 0.3);
        color: #e1bee7;
        .icon-container { color: #ba68c8; }
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
      case 'warning': return 'warning';
      case 'lore': return 'auto_stories';
      case 'note':
      default: return 'info';
    }
  }
}
