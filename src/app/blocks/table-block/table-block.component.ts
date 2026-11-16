import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableBlock } from '../../core/models/block.model';
import { ParseInternalLinksPipe } from '../../shared/pipes/parse-internal-links.pipe';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-table-block',
  standalone: true,
  imports: [CommonModule, ParseInternalLinksPipe, RouterLink],
  template: `
    <div class="table-container" [id]="block().id || null">
      <table>
        <thead>
          <tr>
            @for (header of block().headers; track $index) {
              <th>{{ header }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of block().rows; track $index) {
            <tr>
              @for (cell of row; track $index) {
                <td [attr.data-label]="block().headers[$index]">
                  @for (segment of (cell | parseInternalLinks); track $index) {
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
                </td>
              }
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .table-container {
      overflow-x: auto;
      margin: 1.5rem 0;
      border-radius: 8px;
      border: 1px solid var(--border-color, #e0e0e0);

      .bold {
        font-weight: 700;
      }

      .italic {
        font-style: italic;
      }

      .internal-link,
      .external-link {
        color: var(--primary-color, #8b1e0f);
        font-weight: 600;
        text-decoration: underline;
        text-decoration-color: rgba(139, 30, 15, 0.4);
      }

      .internal-link:hover,
      .external-link:hover {
        color: var(--primary-hover, #b22612);
      }

      .external-link {
        text-decoration-style: dotted;
      }

      .external-link::after {
        content: '↗';
        font-size: 0.75em;
        vertical-align: super;
        margin-left: 0.15em;
      }
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.95rem;
    }

    th, td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border-color, #e0e0e0);
    }

    th {
      background-color: var(--bg-card, rgba(0, 0, 0, 0.02));
      font-weight: 600;
      color: var(--heading-color, var(--text-color, #2c2c2c));
    }

    tbody tr:last-child td {
      border-bottom: none;
    }

    tbody tr:hover {
      background-color: var(--bg-card-hover, rgba(0, 0, 0, 0.01));
    }

    @media (max-width: 768px) {
      table, thead, tbody, th, td, tr {
        display: block;
      }

      thead tr {
        position: absolute;
        top: -9999px;
        left: -9999px;
      }

      tr {
        border-bottom: 2px solid var(--border-color, #e0e0e0);
        margin-bottom: 0.5rem;
      }

      tr:last-child {
        border-bottom: none;
        margin-bottom: 0;
      }

      td {
        border: none;
        position: relative;
        padding-left: 50%;
        text-align: right;
        min-height: 2rem;
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }

      td:before {
        position: absolute;
        top: 50%;
        left: 1rem;
        transform: translateY(-50%);
        width: 45%;
        padding-right: 10px;
        white-space: nowrap;
        text-align: left;
        font-weight: 600;
        content: attr(data-label);
        color: var(--text-muted, #666);
      }
    }
  `]
})
export class TableBlockComponent {
  readonly block = input.required<TableBlock>();
}
