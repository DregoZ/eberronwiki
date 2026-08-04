import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../core/services/navigation.service';
import { SidebarNodeComponent } from './sidebar-node/sidebar-node.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, SidebarNodeComponent, MatProgressSpinnerModule, MatIconModule, RouterLink],
  template: `
    <aside class="sidebar">
      <div class="sidebar-header">
        <a routerLink="/" class="logo-link">
          <mat-icon class="dragon-icon">shield</mat-icon>
          <span class="title">Eberron Wiki</span>
        </a>
      </div>

      <div class="sidebar-nav">
        @if (navService.isLoading()) {
          <div class="loading">
            <mat-spinner diameter="32"></mat-spinner>
          </div>
        } @else {
          @for (node of navService.navTree(); track node.id) {
            <app-sidebar-node [node]="node" />
          }
        }
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      display: flex;
      flex-direction: column;
      height: 100%;
      background-color: var(--sidebar-bg, #f7f4ef);
      border-right: 1px solid var(--border-color, #e2dcd3);
      width: 280px;
    }

    .sidebar-header {
      padding: 1.2rem;
      border-bottom: 1px solid var(--border-color, #e2dcd3);
      .logo-link {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        text-decoration: none;
        color: var(--primary-color, #8b1e0f);
        .dragon-icon {
          font-size: 1.8rem;
          width: 1.8rem;
          height: 1.8rem;
        }
        .title {
          font-family: 'Cinzel', serif, system-ui;
          font-size: 1.3rem;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
      }
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 0.6rem;
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }
  `]
})
export class SidebarComponent {
  readonly navService = inject(NavigationService);
}
