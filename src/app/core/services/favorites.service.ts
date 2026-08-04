import { Injectable, signal, effect } from '@angular/core';

export interface FavoriteItem {
  slug: string;
  title: string;
}

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly STORAGE_KEY = 'eberron_favorites';
  readonly favorites = signal<FavoriteItem[]>(this.loadFavorites());

  constructor() {
    effect(() => {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.favorites()));
    });
  }

  isFavorite(slug: string): boolean {
    return this.favorites().some((item) => item.slug === slug);
  }

  toggleFavorite(item: FavoriteItem): void {
    this.favorites.update((current) => {
      const exists = current.some((f) => f.slug === item.slug);
      if (exists) {
        return current.filter((f) => f.slug !== item.slug);
      } else {
        return [...current, item];
      }
    });
  }

  private loadFavorites(): FavoriteItem[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }
}
