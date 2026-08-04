import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Fuse from 'fuse.js';
import { SearchIndexEntry } from '../models/search-index-entry.model';
import { NavigationService } from './navigation.service';
import { NavNode } from '../models/nav-node.model';
import { ContentService } from './content.service';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private http = inject(HttpClient);
  private navService = inject(NavigationService);
  private contentService = inject(ContentService);

  private fuse: Fuse<SearchIndexEntry> | null = null;
  private isInitializing = false;
  private entries: SearchIndexEntry[] = [];

  private async ensureIndexInitialized(): Promise<void> {
    if (this.fuse || this.isInitializing) return;
    this.isInitializing = true;

    const navNodes = this.navService.navTree();
    const slugs = this.extractSlugs(navNodes);

    const indexEntries: SearchIndexEntry[] = [];

    for (const slug of slugs) {
      try {
        const page = await this.contentService.getPage(slug).toPromise();
        if (page) {
          const summaryText = page.blocks
            .filter((b) => b.type === 'text' || b.type === 'info' || b.type === 'quote')
            .map((b: any) => b.content || b.text || '')
            .join(' ')
            .substring(0, 150);

          indexEntries.push({
            slug: page.slug,
            title: page.title,
            tags: page.tags || [],
            aliases: page.aliases || [],
            summary: summaryText,
          });
        }
      } catch (e) {
        // Ignore unreadable slugs
      }
    }

    this.entries = indexEntries;
    this.fuse = new Fuse(this.entries, {
      keys: ['title', 'aliases', 'tags', 'summary'],
      threshold: 0.4,
      ignoreLocation: true,
    });

    this.isInitializing = false;
  }

  private extractSlugs(nodes: NavNode[]): string[] {
    let slugs: string[] = [];
    for (const node of nodes) {
      if (node.slug) {
        slugs.push(node.slug);
      }
      if (node.children && node.children.length > 0) {
        slugs = slugs.concat(this.extractSlugs(node.children));
      }
    }
    return slugs;
  }

  async search(query: string): Promise<SearchIndexEntry[]> {
    if (!query || query.trim().length === 0) return [];
    await this.ensureIndexInitialized();

    if (!this.fuse) return [];
    const results = this.fuse.search(query);
    return results.map((r) => r.item);
  }
}
