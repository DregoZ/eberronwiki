import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NavNode } from '../models/nav-node.model';
import { catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private http = inject(HttpClient);
  
  readonly navTree = signal<NavNode[]>([]);
  readonly isLoading = signal<boolean>(true);

  constructor() {
    this.loadNavTree();
  }

  private loadNavTree(): void {
    this.http.get<NavNode[]>('assets/content/nav.json').pipe(
      catchError((err) => {
        console.error('Failed to load nav.json:', err);
        return of([]);
      })
    ).subscribe((nodes) => {
      this.navTree.set(nodes);
      this.isLoading.set(false);
    });
  }
}
