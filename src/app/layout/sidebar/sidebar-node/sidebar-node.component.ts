import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavNode } from '../../../core/models/nav-node.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar-node',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <div class="nav-item">
      @if (node().children && node().children!.length > 0) {
        <div class="nav-header" (click)="toggleExpanded()">
          <mat-icon class="expand-icon" [class.expanded]="expanded()">chevron_right</mat-icon>
          @if (node().icon) {
            <mat-icon class="node-icon">{{ node().icon }}</mat-icon>
          }
          <span class="label">{{ node().label }}</span>
          @if (node().locked) {
            <mat-icon class="lock-icon">lock</mat-icon>
          }
        </div>
        @if (expanded()) {
          <div class="nav-children">
            @for (child of node().children; track child.id) {
              <app-sidebar-node [node]="child" (linkClick)="linkClick.emit()" />
            }
          </div>
        }
      } @else {
        <a
          [routerLink]="'/wiki/' + node().slug"
          routerLinkActive="active"
          class="nav-link"
          (click)="linkClick.emit()"
        >
          @if (node().icon) {
            <mat-icon class="node-icon">{{ node().icon }}</mat-icon>
          }
          <span class="label">{{ node().label }}</span>
          @if (node().locked) {
            <mat-icon class="lock-icon">lock</mat-icon>
          }
        </a>
      }
    </div>
  `,
  styles: [
    `
      .nav-item {
        display: flex;
        flex-direction: column;
      }

      .nav-header,
      .nav-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        border-radius: 6px;
        color: var(--text-color, #333);
        text-decoration: none;
        font-size: 0.95rem;
        cursor: pointer;
        user-select: none;
        transition:
          background-color 0.15s,
          color 0.15s;

        &:hover {
          background-color: rgba(139, 30, 15, 0.08);
          color: var(--primary-color, #8b1e0f);
        }

        &.active {
          background-color: var(--primary-color, #8b1e0f);
          color: #fff;
          font-weight: 600;

          .expand-icon,
          .node-icon,
          .lock-icon {
            color: #fff;
          }
        }
      }

      .expand-icon {
        font-size: 1.1rem;
        width: 1.1rem;
        height: 1.1rem;
        transition: transform 0.2s;
        &.expanded {
          transform: rotate(90deg);
        }
      }

      .node-icon,
      .lock-icon {
        font-size: 1.1rem;
        width: 1.1rem;
        height: 1.1rem;
        opacity: 0.8;
      }

      .lock-icon {
        margin-left: auto;
        font-size: 0.9rem;
        width: 0.9rem;
        height: 0.9rem;
        color: var(--accent-color, #c9933b);
      }

      .label {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .nav-children {
        margin-left: 1.2rem;
        border-left: 1px solid var(--border-color, #e0e0e0);
        padding-left: 0.3rem;
      }

      @media (max-width: 991px) {
        .nav-header,
        .nav-link {
          min-height: 44px;
          padding: 0.65rem 0.75rem;
        }
      }
    `,
  ],
})
export class SidebarNodeComponent {
  readonly node = input.required<NavNode>();
  readonly expanded = signal<boolean>(true);
  readonly linkClick = output<void>();

  toggleExpanded(): void {
    this.expanded.update((v) => !v);
  }
}
