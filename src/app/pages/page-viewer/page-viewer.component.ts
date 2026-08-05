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
        <h2>Página no encontrada</h2>
        <p>No se encontraron registros sobre esta consulta en los archivos de la wiki.</p>
      </div>
    } @else {
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
          @for (block of pageData()?.blocks ?? []; track block.id) {
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
              @case ('related') {
                <app-related-block [block]="$any(block)" />
              }
              @case ('map') {
                <app-map-block [block]="$any(block)" />
              }
            }
          }
        </div>
      </article>
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
}
