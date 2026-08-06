import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { ThemeService } from '../../core/services/theme.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';

const MOBILE_BREAKPOINT = '(max-width: 991px)';

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
    <mat-sidenav-container class="layout-container">
      <mat-sidenav
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="sidenavOpen()"
        (openedChange)="sidenavOpen.set($event)"
        class="sidenav"
      >
        <app-sidebar (linkClick)="onLinkClick()" />
      </mat-sidenav>

      <mat-sidenav-content class="main-content-area">
        <header class="top-header">
          @if (isMobile()) {
            <button
              mat-icon-button
              class="menu-btn"
              (click)="toggleSidenav()"
              aria-label="Abrir menú de navegación"
            >
              <mat-icon>menu</mat-icon>
            </button>
          }
          <!-- <app-search-bar /> -->
          <div class="actions">
            <button
              mat-icon-button
              (click)="themeService.toggleTheme()"
              [title]="themeService.isDarkMode() ? 'Modo claro' : 'Modo oscuro'"
            >
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
  styles: [
    `
      .layout-container {
        height: 100vh;
        width: 100vw;
        background-color: var(--bg-main, #faf8f5);
      }

      /* APLICAR ANCHO FIJO Y CLIP A MAT-SIDENAV */
      .sidenav {
        width: 280px;
        max-width: 85vw; /* Evita desbordar en móviles súper pequeños */
        overflow: hidden;
        border-right: 1px solid var(--border-color, #e2dcd3);
        box-shadow: none;
      }

      .main-content-area {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow-y: auto;
      }

      .top-header {
        position: sticky;
        top: 0;
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1.5rem;
        padding: 0.8rem 2rem;
        background-color: var(--bg-header, #ffffff);
        border-bottom: 1px solid var(--border-color, #e2dcd3);
        width: 100%;
        box-sizing: border-box;

        app-search-bar {
          flex: 1;
          max-width: 650px;
          min-width: 0;
        }

        .menu-btn {
          flex-shrink: 0;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }
      }

      .page-container {
        flex: 1;
        padding: 2rem 3rem;
        max-width: 1600px;
        margin: 0 auto;
        width: 100%;
        box-sizing: border-box;
      }

      @media (max-width: 991px) {
        .top-header {
          gap: 0.75rem;
          padding: 0.65rem 1rem;
        }

        .page-container {
          padding: 1.25rem 1rem;
        }
      }
    `,
  ],
})
export class MainLayoutComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly router = inject(Router);

  readonly themeService = inject(ThemeService);
  readonly sidenavOpen = signal(true);

  readonly isMobile = toSignal(
    this.breakpointObserver.observe(MOBILE_BREAKPOINT).pipe(map((r) => r.matches)),
    { initialValue: false },
  );

  constructor() {
    // Sincroniza la apertura inicial según el tamaño de pantalla
    effect(() => {
      this.sidenavOpen.set(!this.isMobile());
    });

    // Cierra en móvil tras navegar
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.isMobile()) {
          this.sidenavOpen.set(false);
        }
      });
  }

  toggleSidenav(): void {
    this.sidenavOpen.update((open) => !open);
  }

  onLinkClick(): void {
    if (this.isMobile()) {
      this.sidenavOpen.set(false);
    }
  }
}
