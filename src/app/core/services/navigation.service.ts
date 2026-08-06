import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavNode } from '../models/nav-node.model';
import { catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly navTree = signal<NavNode[]>([]);
  readonly isLoading = signal<boolean>(true);

  // Estado global de la barra en móvil
  readonly isMobileOpen = signal<boolean>(false);

  constructor() {
    this.loadNavTree();

    // Auto-cerrar el menú en móvil cuando el usuario navegue a otra página
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.closeMobileSidebar();
      });
  }

  private loadNavTree(): void {
    this.http
      .get<NavNode[]>('assets/content/nav.json')
      .pipe(
        catchError((err) => {
          console.error('Failed to load nav.json:', err);
          return of([]);
        }),
      )
      .subscribe((nodes) => {
        this.navTree.set(nodes);
        this.isLoading.set(false);
      });
  }

  toggleMobileSidebar(): void {
    this.isMobileOpen.update((open) => !open);
  }

  closeMobileSidebar(): void {
    this.isMobileOpen.set(false);
  }
}
