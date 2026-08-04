import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, map } from 'rxjs';
import { PageContent } from '../models/page.model';

export interface ResourceResult<T> {
  value: ReturnType<typeof signal<T | undefined>>;
  isLoading: ReturnType<typeof signal<boolean>>;
  error: ReturnType<typeof signal<any>>;
}

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  private http = inject(HttpClient);
  private cache = new Map<string, PageContent>();

  getPageResource(slug: string) {
    const value = signal<PageContent | undefined>(this.cache.get(slug));
    const isLoading = signal<boolean>(!this.cache.has(slug));
    const error = signal<any>(null);

    if (!this.cache.has(slug) && slug) {
      // Normalize slug to path
      const cleanSlug = decodeURIComponent(slug).replace(/^\/+|\/+$/g, '');
      const path = `assets/content/${cleanSlug}/info.json`;

      this.http
        .get<PageContent>(path)
        .pipe(
          catchError((err) => {
            console.error(`Error loading page content for ${path}:`, err);
            error.set(err);
            isLoading.set(false);
            return of(null);
          }),
        )
        .subscribe((data) => {
          if (data) {
            this.cache.set(slug, data);
            value.set(data);
          }
          isLoading.set(false);
        });
    }

    return { value, isLoading, error };
  }

  getPage(slug: string): Observable<PageContent | null> {
    const cleanSlug = decodeURIComponent(slug).replace(/^\/+|\/+$/g, '');
    /*   return this.http
      .get<PageContent>(`assets/content/${cleanSlug}/info.json`)
      .pipe(catchError(() => of(null))); */

    return this.http.get<PageContent>(`assets/content/${cleanSlug}/info.json`).pipe(
      catchError(() => this.http.get<PageContent>(`assets/content/${cleanSlug}.json`)),
      catchError(() => of(null)),
    );
  }
}
