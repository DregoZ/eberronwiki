import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UnlockableContentService {
  private readonly STORAGE_KEY = 'eberron_unlocked_conditions';
  readonly unlockedConditions = signal<Set<string>>(this.loadUnlocked());

  constructor() {
    effect(() => {
      const arr = Array.from(this.unlockedConditions());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(arr));
    });
  }

  isUnlocked(condition?: string | null): boolean {
    if (!condition) return true;
    return this.unlockedConditions().has(condition);
  }

  unlock(condition: string): void {
    this.unlockedConditions.update((set) => {
      const next = new Set(set);
      next.add(condition);
      return next;
    });
  }

  private loadUnlocked(): Set<string> {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set(['chapter-1']);
    } catch {
      return new Set(['chapter-1']);
    }
  }
}
