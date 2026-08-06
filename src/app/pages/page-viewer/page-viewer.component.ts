import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ContentService } from '../../core/services/content.service';
import { FavoritesService } from '../../core/services/favorites.service';

import { TextBlockComponent } from '../../blocks/text-block/text-block.component';
import { BulletBlockComponent } from '../../blocks/bullet-block/bullet-block';
import { ImageBlockComponent } from '../../blocks/image-block/image-block.component';
import { GalleryComponent } from '../../blocks/gallery/gallery.component';
import { QuoteBlockComponent } from '../../blocks/quote-block/quote-block.component';
import { InfoBlockComponent } from '../../blocks/info-block/info-block.component';
import { TableBlockComponent } from '../../blocks/table-block/table-block.component';
import { SeparatorBlockComponent } from '../../blocks/separator-block/separator-block.component';
import { RelatedBlockComponent } from '../../blocks/related-block/related-block.component';
import { MapBlockComponent } from '../../blocks/map-block/map-block.component';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import {
  TextBlock,
  BulletBlock,
  ImageBlock,
  QuoteBlock,
  InfoBlock,
  TableBlock,
  SeparatorBlock,
  RelatedBlock,
  MapBlock,
} from '../../core/models/block.model';

@Component({
  selector: 'app-page-viewer',
  standalone: true,
  imports: [
    CommonModule,
    TextBlockComponent,
    BulletBlockComponent,
    ImageBlockComponent,
    GalleryComponent,
  
    QuoteBlockComponent,
    InfoBlockComponent,
    TableBlockComponent,
    SeparatorBlockComponent,
    RelatedBlockComponent,
    MapBlockComponent,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  template: `
    @if (isLoading()) {
      <div class="loading-state">
        <mat-spinner diameter="48"></mat-spinner>
        <p>Cargando archivo de la biblioteca de Eberron...</p>
      </div>
    } @else if (error() || !pageData()) {
      <div class="error-state">
        <mat-icon class="error-icon">menu_book</mat-icon>
        <h2>¡En construcción!</h2>
        <p>La información que buscas está en otro castillo.</p>
        <img src="/assets/img/obras.jpg" alt="¡En construcción!" class="error-image" />
      </div>
    } @else {
      <div
        class="page-layout"
        [class.has-left-toc]="tocItems().length > 0"
        [class.has-right-sidebar]="relatedBlocks().length > 0"
      >
        @if (tocItems().length > 0) {
          <aside class="toc-sidebar">
            <div class="toc-container">
              <div class="toc-header">
                <mat-icon class="toc-icon">toc</mat-icon>
                <span>En esta página</span>
              </div>
              <nav class="toc-nav">
                @for (item of tocItems(); track item.id) {
                  <a
                    [href]="'#' + item.id"
                    class="toc-link"
                    (click)="scrollToHeading($event, item.id)"
                  >
                    {{ item.title }}
                  </a>
                }
              </nav>
            </div>
          </aside>
        }

        <article class="page-content">
          <header class="page-header">
            <div class="title-row">
              <h1 class="page-title">{{ pageData()?.title }}</h1>
              <button
                mat-icon-button
                (click)="toggleFavorite()"
                class="fav-btn"
                [title]="isFav() ? 'Quitar de favoritos' : 'Añadir a favoritos'"
              >
                <mat-icon [class.is-fav]="isFav()">{{ isFav() ? 'star' : 'star_border' }}</mat-icon>
              </button>
            </div>

            @if (pageData()?.tags && pageData()!.tags!.length > 0) {
              <div class="tags-row">
                @for (tag of pageData()!.tags; track tag) {
                  <span class="tag-chip">#{{ tag }}</span>
                }
              </div>
            }
          </header>

          <div class="blocks-list">
            @for (block of nonRelatedBlocks(); track block.id) {
              @switch (block.type) {
                @case ('text') {
                  <app-text-block [block]="$any(block)" />
                }
                @case ('bullet') {
                  <app-bullet-block [block]="$any(block)" />
                }
                @case ('image') {
                  <app-image-block [block]="$any(block)" />
                }
                @case ('quote') {
                  <app-quote-block [block]="$any(block)" />
                }
                @case ('info') {
                  <app-info-block [block]="$any(block)" />
                }
                @case ('table') {
                  <app-table-block [block]="$any(block)" />
                }
                @case ('separator') {
                  <app-separator-block [block]="$any(block)" />
                }
                @case ('map') {
                  <app-map-block [block]="$any(block)" />
                }
                @case ('gallery') {
                  <app-gallery [block]="$any(block)" />
                }
              }
            }
          </div>
        </article>

        @if (relatedBlocks().length > 0) {
          <aside class="right-sidebar">
            <div class="sidebar-related-container">
              @for (block of relatedBlocks(); track block.id) {
                <app-related-block [block]="$any(block)" />
              }
            </div>
          </aside>
        }
      </div>
    }
  `,
  styles: [
    `
      .loading-state,
      .error-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4rem 1rem;
        text-align: center;
        color: var(--text-muted, #666);
      }

      .error-icon {
        font-size: 3.5rem;
        width: 3.5rem;
        height: 3.5rem;
        color: var(--primary-color, #8b1e0f);
        margin-bottom: 1rem;
      }

      .error-image {
        max-width: 300px;
        width: 100%;
        height: auto;
        margin-top: 1rem;
      }

      .page-layout {
        display: grid;
        grid-template-columns: 1fr;
        gap: 2rem;
        align-items: start;

        @media (min-width: 992px) {
          &.has-left-toc.has-right-sidebar {
            grid-template-columns: 220px minmax(0, 1fr) 260px;
          }

          &.has-left-toc:not(.has-right-sidebar) {
            grid-template-columns: 220px minmax(0, 1fr);
          }

          &.has-right-sidebar:not(.has-left-toc) {
            grid-template-columns: minmax(0, 1fr) 260px;
          }
        }
      }

      .page-content {
        min-width: 0;
      }

      .toc-sidebar,
      .right-sidebar {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;

        @media (min-width: 992px) {
          position: sticky;
          top: 5rem;
        }
      }

      .toc-container {
        background: var(--bg-card, rgba(0, 0, 0, 0.02));
        border: 1px solid var(--border-color, #e0e0e0);
        border-radius: 8px;
        padding: 1rem 1.25rem;
      }

      .toc-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 700;
        font-size: 0.95rem;
        color: var(--primary-color, #8b1e0f);
        margin-bottom: 0.75rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--border-color, #e0e0e0);

        .toc-icon {
          font-size: 1.2rem;
          width: 1.2rem;
          height: 1.2rem;
        }
      }

      .toc-nav {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }

      .toc-link {
        font-size: 0.9rem;
        color: var(--text-muted, #555);
        text-decoration: none;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        transition: all 0.2s ease;
        line-height: 1.4;

        &:hover {
          color: var(--primary-color, #8b1e0f);
          background: rgba(139, 30, 15, 0.06);
          padding-left: 0.75rem;
        }
      }

      .page-footer-related {
        margin-top: 3rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
      }

      .page-header {
        margin-bottom: 2rem;
        border-bottom: 2px solid var(--accent-color, #c9933b);
        padding-bottom: 1rem;

        .title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .page-title {
          font-family: 'Cinzel', serif, system-ui;
          font-size: 2.4rem;
          font-weight: 700;
          margin: 0;
          color: var(--primary-color, #8b1e0f);
        }

        .fav-btn {
          color: var(--accent-color, #c9933b);
          .is-fav {
            color: #ffb300;
          }
        }

        .tags-row {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }

        .tag-chip {
          font-size: 0.8rem;
          padding: 0.2rem 0.6rem;
          background: var(--tag-bg, rgba(139, 30, 15, 0.08));
          color: var(--primary-color, #8b1e0f);
          border-radius: 12px;
          font-weight: 500;
        }
      }

      .blocks-list {
        display: flex;
        flex-direction: column;
      }
    `,
  ],
})
export class PageViewerComponent {
  private route = inject(ActivatedRoute);
  private contentService = inject(ContentService);
  private favoritesService = inject(FavoritesService);

  readonly currentSlug = toSignal(
    this.route.url.pipe(
      map(() => {
        // Reconstruct complete path from wildcard route
        const rawPath = this.route.snapshot.url.map((s) => s.path).join('/');
        return decodeURIComponent(rawPath);
      }),
    ),
    { initialValue: '' },
  );

  readonly resource = computed(() => {
    const slug = this.currentSlug() || 'eberron';
    return this.contentService.getPageResource(slug);
  });

  readonly pageData = computed(() => this.resource().value());
  readonly isLoading = computed(() => this.resource().isLoading());
  readonly error = computed(() => this.resource().error());

  readonly nonRelatedBlocks = computed(() => {
    const blocks = this.pageData()?.blocks ?? [];
    return blocks.filter((b) => b.type !== 'related');
  });

  readonly relatedBlocks = computed(() => {
    const blocks = this.pageData()?.blocks ?? [];
    return blocks.filter((b): b is RelatedBlock => b.type === 'related');
  });

  readonly tocItems = computed(() => {
    const data = this.pageData();
    if (!data?.blocks) return [];
    return data.blocks
      .filter(
        (block): block is TextBlock | BulletBlock =>
          (block.type === 'text' || block.type === 'bullet') && !!block.title,
      )
      .map((block) => ({
        id: block.id || 'heading-' + block.title,
        title: block.title!,
      }));
  });

  readonly isFav = computed(() => {
    const slug = this.currentSlug() || 'eberron';
    return this.favoritesService.isFavorite(slug);
  });

  toggleFavorite(): void {
    const data = this.pageData();
    if (data) {
      this.favoritesService.toggleFavorite({
        slug: data.slug,
        title: data.title,
      });
    }
  }

  scrollToHeading(event: Event, elementId: string): void {
    event.preventDefault();
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
