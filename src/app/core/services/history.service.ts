import { Injectable, inject, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

export interface HistoryItem {
  slug: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  private router = inject(Router);
  private readonly STORAGE_KEY = 'eberron_history';
  readonly history = signal<HistoryItem[]>(this.loadHistory());

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        const url = decodeURIComponent(event.urlAfterRedirects);
        if (url.startsWith('/wiki/')) {
          const slug = url.replace('/wiki/', '').split('?')[0].split('#')[0];
          if (slug) {
            this.addHistory(slug);
          }
        }
      });
  }

  private addHistory(slug: string): void {
    this.history.update((current) => {
      const filtered = current.filter((h) => h.slug !== slug);
      const updated = [{ slug, timestamp: Date.now() }, ...filtered].slice(0, 10);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  private loadHistory(): HistoryItem[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }
}
