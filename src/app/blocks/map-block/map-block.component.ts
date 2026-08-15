import {
  Component,
  input,
  ElementRef,
  viewChild,
  AfterViewInit,
  OnDestroy,
  inject,
  signal,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MapBlock } from '../../core/models/block.model';
import { MatIconModule } from '@angular/material/icon';
import * as L from 'leaflet';

@Component({
  selector: 'app-map-block',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="map-wrapper" [class.fullscreen]="isFullscreen()">
      <div class="map-container">
        <div class="map-toolbar">
          <span class="map-title">
            <mat-icon>map</mat-icon>
            Mapa interactivo
          </span>
          <div class="map-actions">
            <button
              class="map-btn"
              (click)="toggleFullscreen()"
              [title]="isFullscreen() ? 'Salir de pantalla completa' : 'Pantalla completa'"
            >
              <mat-icon>{{ isFullscreen() ? 'fullscreen_exit' : 'fullscreen' }}</mat-icon>
            </button>
          </div>
        </div>
        <div #mapElement class="leaflet-map"></div>
        @if (isFullscreen()) {
          <button class="close-fullscreen-btn" (click)="exitFullscreen()" title="Cerrar">
            <mat-icon>close</mat-icon>
          </button>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .map-wrapper {
        margin: 2rem 0;

        &.fullscreen {
          position: fixed;
          inset: 0;
          z-index: 9999;
          margin: 0;
          display: flex;
          align-items: stretch;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(4px);
          animation: fadeIn 0.2s ease;

          .map-container {
            flex: 1;
            border-radius: 0;
            border: none;
            box-shadow: none;
            display: flex;
            flex-direction: column;
          }

          .leaflet-map {
            flex: 1;
            height: auto !important;
          }
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .map-container {
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        border: 2px solid var(--accent-color, #c9933b);
        display: flex;
        flex-direction: column;
      }

      .map-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem 0.85rem;
        background: var(--primary-color, #8b1e0f);
        color: #fff;
        gap: 0.5rem;

        .map-title {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          opacity: 0.95;

          mat-icon {
            font-size: 1.1rem;
            width: 1.1rem;
            height: 1.1rem;
          }
        }

        .map-actions {
          display: flex;
          gap: 0.4rem;
        }
      }

      .map-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.25);
        border-radius: 6px;
        color: #fff;
        cursor: pointer;
        padding: 0.25rem;
        transition:
          background 0.15s,
          transform 0.1s;

        mat-icon {
          font-size: 1.2rem;
          width: 1.2rem;
          height: 1.2rem;
        }

        &:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.05);
        }
      }

      .leaflet-map {
        height: 520px;
        width: 100%;
        background: #111;
      }

      @media (max-width: 991px) {
        .leaflet-map {
          height: 320px;
        }
      }

      .close-fullscreen-btn {
        position: absolute;
        top: 3.2rem;
        right: 1rem;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(139, 30, 15, 0.85);
        border: none;
        border-radius: 50%;
        color: #fff;
        cursor: pointer;
        width: 2.2rem;
        height: 2.2rem;
        transition:
          background 0.2s,
          transform 0.1s;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);

        mat-icon {
          font-size: 1.2rem;
          width: 1.2rem;
          height: 1.2rem;
        }

        &:hover {
          background: var(--primary-color, #8b1e0f);
          transform: scale(1.1);
        }
      }

      ::ng-deep .custom-map-pin {
        background: var(--primary-color, #8b1e0f);
        color: #fff;
        border: 2px solid #fff;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 11px;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
        transition:
          transform 0.2s,
          background-color 0.2s;

        &:hover {
          transform: scale(1.25);
          background: var(--accent-color, #c9933b);
        }
      }
    `,
  ],
})
export class MapBlockComponent implements AfterViewInit, OnDestroy {
  readonly block = input.required<MapBlock>();
  private router = inject(Router);

  private mapElement = viewChild.required<ElementRef<HTMLDivElement>>('mapElement');
  private map: L.Map | null = null;
  readonly isFullscreen = signal<boolean>(false);

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isFullscreen()) {
      this.exitFullscreen();
    }
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  toggleFullscreen(): void {
    this.isFullscreen.update((v) => !v);
    setTimeout(() => this.map?.invalidateSize(), 50);
  }

  exitFullscreen(): void {
    this.isFullscreen.set(false);
    setTimeout(() => this.map?.invalidateSize(), 50);
  }

  private initMap(): void {
    const mapData = this.block();
    const container = this.mapElement().nativeElement;

    this.map = L.map(container, {
      crs: L.CRS.Simple,
      minZoom: -3,
      maxZoom: 3,
      zoomControl: true,
      attributionControl: false,
    });

    // Load image first to get real dimensions and preserve aspect ratio
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;

      // Normalize: keep width at 1000, scale height proportionally
      const normW = 1000;
      const normH = Math.round((h / w) * 1000);

      const bounds: L.LatLngBoundsExpression = [
        [0, 0],
        [normH, normW],
      ];
      L.imageOverlay(mapData.image, bounds).addTo(this.map!);
      this.map!.fitBounds(bounds);

      // Click on map to get coordinates as percentages of the image dimensions
      this.map!.on('click', (e: L.LeafletMouseEvent) => {
        const x = (e.latlng.lng / normW) * 100;
        const y = ((normH - e.latlng.lat) / normH) * 100;
        console.log('Map click coordinates (percent):', { x: x.toFixed(1), y: y.toFixed(1) });
      });

      // Pins: x/y are percentages (0–100) of image width/height
      mapData.pins?.forEach((pin) => {
        const lat = normH - (pin.y / 100) * normH; // y=0 → top, y=100 → bottom
        const lng = (pin.x / 100) * normW; // x=0 → left, x=100 → right

        const icon = L.divIcon({
          className: 'custom-map-pin',
          html: `<span>${pin.label.charAt(0)}</span>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([lat, lng], { icon }).addTo(this.map!);
        marker.bindTooltip(`<strong>${pin.label}</strong>`, { direction: 'top' });

        if (pin.linkSlug) {
          marker.on('click', () => {
            this.router.navigateByUrl('/wiki/' + pin.linkSlug);
          });
        }
      });
    };

    img.onerror = () => {
      // Fallback to square if image fails to load
      const bounds: L.LatLngBoundsExpression = [
        [0, 0],
        [1000, 1000],
      ];
      L.imageOverlay(mapData.image, bounds).addTo(this.map!);
      this.map!.fitBounds(bounds);
    };

    img.src = mapData.image;
  }
}
