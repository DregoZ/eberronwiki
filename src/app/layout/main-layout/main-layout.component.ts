import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { ThemeService } from '../../core/services/theme.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    SearchBarComponent,
    BreadcrumbComponent,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
  ],
  template: `
    <mat-sidenav-container class="layout-container" autosize>
      <mat-sidenav mode="side" opened class="sidenav">
        <app-sidebar />
      </mat-sidenav>

      <mat-sidenav-content class="main-content-area">
        <header class="top-header">
          <app-search-bar />
          <div class="actions">
            <button mat-icon-button (click)="themeService.toggleTheme()" [title]="themeService.isDarkMode() ? 'Modo claro' : 'Modo oscuro'">
              <mat-icon>{{ themeService.isDarkMode() ? 'light_mode' : 'dark_mode' }}</mat-icon>
            </button>
          </div>
        </header>

        <main class="page-container">
          <app-breadcrumb />
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .layout-container {
      height: 100vh;
      width: 100vw;
      background-color: var(--bg-main, #faf8f5);
    }

    .sidenav {
      border-right: none;
    }

    .main-content-area {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow-y: auto;
    }

    .top-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.8rem 2rem;
      background-color: var(--bg-header, #ffffff);
      border-bottom: 1px solid var(--border-color, #e2dcd3);
      sticky: top 0;
      z-index: 10;

      .actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }

    .page-container {
      flex: 1;
      padding: 2rem 3rem;
      max-width: 960px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
    }
  `]
})
export class MainLayoutComponent {
  readonly themeService = inject(ThemeService);
}
