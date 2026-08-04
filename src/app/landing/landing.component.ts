import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="hero-container">
      <div class="overlay"></div>
      <div class="hero-content">
        <mat-icon class="hero-icon">auto_stories</mat-icon>
        <h1 class="hero-title">El Manifiesto de Convergencia aqsdasdadasdasd</h1>
        <p class="hero-subtitle">¡Explora la historia de Khorvaire y los secretos de la campaña!</p>

        <div class="cta-actions">
          <a mat-raised-button color="primary" routerLink="/wiki/eberron" class="explore-btn">
            <mat-icon>explore</mat-icon>
            Explorar la Wiki
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .hero-container {
        position: relative;
        height: 100vh;
        width: 100vw;

        display: flex;
        justify-content: center;
        align-items: center;

        background:
          linear-gradient(rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.25)),
          url('/assets/img/landing/cyre.jpg');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;

        overflow: hidden;
      }

      .overlay {
        position: absolute;
        inset: 0;

        background: linear-gradient(rgba(10, 8, 6, 0.55), rgba(10, 8, 6, 0.75));

        z-index: 1;
      }

      .hero-content {
        position: relative;
        z-index: 2;
        text-align: center;
        // max-width: 650px;
        padding: 2rem;

        .hero-icon {
          font-size: 4rem;
          width: 4rem;
          height: 4rem;
          color: var(--accent-color, #c9933b);
          margin-bottom: 1rem;
        }

        .hero-title {
          font-family: 'Cinzel', serif, system-ui;
          font-size: 3.5rem;
          font-weight: 700;
          margin: 0 0 1rem 0;
          color: #f7e8d0;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
        }

        .hero-subtitle {
          font-size: 1.2rem;
          line-height: 1.6;
          color: #d1c2ab;
          margin-bottom: 2.5rem;
        }

        .explore-btn {
          padding: 0.75rem 2rem;
          font-size: 1.1rem;
          background-color: var(--primary-color, #8b1e0f);
          color: #fff;
          border-radius: 30px;

          mat-icon {
            margin-right: 0.5rem;
          }
        }
      }
    `,
  ],
})
export class LandingComponent {}
