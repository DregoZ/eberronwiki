import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SearchService } from '../../core/services/search.service';
import { SearchIndexEntry } from '../../core/models/search-index-entry.model';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  template: `
    <div class="search-container">
      <div class="search-input-wrapper">
        <mat-icon class="search-icon">search</mat-icon>
        <input
          type="text"
          placeholder="Buscar en el lore de Eberron..."
          [(ngModel)]="query"
          (input)="onSearchInput()"
          (focus)="isOpen.set(true)"
        />
        @if (query) {
          <button class="clear-btn" (click)="clearSearch()">
            <mat-icon>close</mat-icon>
          </button>
        }
      </div>

      @if (isOpen() && results().length > 0) {
        <div class="search-results-dropdown">
          @for (item of results(); track item.slug) {
            <div class="result-item" (click)="selectResult(item)">
              <div class="result-title">
                <mat-icon>article</mat-icon>
                <span>{{ item.title }}</span>
              </div>
              <p class="result-summary">{{ item.summary }}</p>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .search-container {
      position: relative;
      width: 100%;
    }

    .search-input-wrapper {
      display: flex;
      align-items: center;
      background: var(--bg-card, #fff);
      border: 1px solid var(--border-color, #ccc);
      border-radius: 20px;
      padding: 0.35rem 0.8rem;
      transition: border-color 0.2s, box-shadow 0.2s;

      &:focus-within {
        border-color: var(--primary-color, #8b1e0f);
        box-shadow: 0 0 0 3px rgba(139, 30, 15, 0.15);
      }

      input {
        border: none;
        outline: none;
        background: transparent;
        width: 100%;
        margin-left: 0.5rem;
        font-size: 0.95rem;
        color: var(--text-color, #333);
      }

      .search-icon {
        color: var(--text-muted, #888);
      }

      .clear-btn {
        border: none;
        background: transparent;
        cursor: pointer;
        color: var(--text-muted, #888);
        display: flex;
        align-items: center;
      }
    }

    .search-results-dropdown {
      position: absolute;
      top: 105%;
      left: 0;
      right: 0;
      background: var(--bg-card, #fff);
      border: 1px solid var(--border-color, #ddd);
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      max-height: 380px;
      overflow-y: auto;
      z-index: 1000;
    }

    .result-item {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border-color, #eee);
      cursor: pointer;
      transition: background-color 0.15s;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background: rgba(139, 30, 15, 0.05);
      }

      .result-title {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-weight: 600;
        color: var(--primary-color, #8b1e0f);

        mat-icon {
          font-size: 1.1rem;
          width: 1.1rem;
          height: 1.1rem;
        }
      }

      .result-summary {
        margin: 0.25rem 0 0 1.5rem;
        font-size: 0.85rem;
        color: var(--text-muted, #666);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }
  `]
})
export class SearchBarComponent {
  private searchService = inject(SearchService);
  private router = inject(Router);

  query = '';
  readonly results = signal<SearchIndexEntry[]>([]);
  readonly isOpen = signal<boolean>(false);

  async onSearchInput(): Promise<void> {
    if (this.query.trim().length === 0) {
      this.results.set([]);
      this.isOpen.set(false);
      return;
    }

    const res = await this.searchService.search(this.query);
    this.results.set(res);
    this.isOpen.set(true);
  }

  selectResult(item: SearchIndexEntry): void {
    this.router.navigateByUrl('/wiki/' + item.slug);
    this.clearSearch();
  }

  clearSearch(): void {
    this.query = '';
    this.results.set([]);
    this.isOpen.set(false);
  }
}
