import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { PageViewerComponent } from './pages/page-viewer/page-viewer.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  {
    path: 'wiki',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'eberron', pathMatch: 'full' },
      {
        path: '**',
        component: PageViewerComponent,
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
