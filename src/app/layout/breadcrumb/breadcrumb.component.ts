import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

export interface BreadcrumbItem {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <nav class="breadcrumb">
      <a routerLink="/wiki" class="crumb-link">
        <mat-icon>home</mat-icon>
        Wiki
      </a>
      @for (crumb of crumbs(); track crumb.url) {
        <span class="separator">/</span>
        <a [routerLink]="crumb.url" class="crumb-link">{{ crumb.label }}</a>
      }
    </nav>
  `,
  styles: [`
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.9rem;
      color: var(--text-muted, #777);
      margin-bottom: 1.25rem;

      .crumb-link {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        text-decoration: none;
        color: var(--text-muted, #777);
        text-transform: capitalize;
        transition: color 0.15s;

        mat-icon {
          font-size: 1rem;
          width: 1rem;
          height: 1rem;
        }

        &:hover {
          color: var(--primary-color, #8b1e0f);
        }
      }

      .separator {
        opacity: 0.5;
      }
    }
  `]
})
export class BreadcrumbComponent {
  private router = inject(Router);
  readonly crumbs = signal<BreadcrumbItem[]>([]);

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.updateCrumbs());

    this.updateCrumbs();
  }

  private updateCrumbs(): void {
    const url = this.router.url;
    if (!url.startsWith('/wiki')) {
      this.crumbs.set([]);
      return;
    }

    const segments = url.replace('/wiki', '').split('/').filter(Boolean);
    let accumulated = '/wiki';

    const items: BreadcrumbItem[] = segments.map((seg) => {
      accumulated += `/${seg}`;
      const label = seg.replace(/-/g, ' ');
      return { label, url: accumulated };
    });

    this.crumbs.set(items);
  }
}
