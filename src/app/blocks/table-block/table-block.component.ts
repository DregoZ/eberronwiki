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
    <div class="table-container">
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
                      <a [routerLink]="'/wiki/' + segment.slug" class="internal-link">{{ segment.label }}</a>
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

      table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;

        th, td {
          padding: 0.85rem 1rem;
          border-bottom: 1px solid var(--border-color, #e0e0e0);
        }

        th {
          background-color: var(--table-header-bg, #f5f5f5);
          font-weight: 700;
          color: var(--primary-color, #8b1e0f);
        }

        tr:last-child td {
          border-bottom: none;
        }

        tr:nth-child(even) {
          background-color: var(--table-zebra-bg, rgba(0, 0, 0, 0.02));
        }
      }
    }

    @media (max-width: 991px) {
      .table-container {
        overflow-x: visible;
        border: none;
        background: transparent;
      }

      table,
      thead,
      tbody,
      th,
      td,
      tr {
        display: block;
      }

      thead {
        display: none;
      }

      tbody tr {
        margin-bottom: 1rem;
        border: 1px solid var(--border-color, #e0e0e0);
        border-radius: 8px;
        overflow: hidden;
        background: var(--bg-card, #fff);
      }

      tbody tr:last-child {
        margin-bottom: 0;
      }

      td {
        display: grid;
        grid-template-columns: minmax(0, 38%) 1fr;
        gap: 0.75rem;
        align-items: start;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--border-color, #e0e0e0);
        text-align: left;
      }

      td::before {
        content: attr(data-label);
        font-weight: 700;
        color: var(--primary-color, #8b1e0f);
        font-size: 0.85rem;
        line-height: 1.4;
      }

      td:last-child {
        border-bottom: none;
      }

      tr:nth-child(even) td {
        background-color: transparent;
      }
    }
  `]
})
export class TableBlockComponent {
  readonly block = input.required<TableBlock>();
}
