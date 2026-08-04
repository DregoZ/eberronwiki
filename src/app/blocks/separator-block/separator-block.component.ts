import { Component, input } from '@angular/core';
import { SeparatorBlock } from '../../core/models/block.model';

@Component({
  selector: 'app-separator-block',
  standalone: true,
  template: `
    <div class="separator-block">
      <span class="diamond">◆</span>
    </div>
  `,
  styles: [`
    .separator-block {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 2rem 0;
      position: relative;

      &::before, &::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid var(--accent-color, #c9933b);
        opacity: 0.4;
      }

      .diamond {
        margin: 0 1rem;
        color: var(--accent-color, #c9933b);
        font-size: 0.8rem;
      }
    }
  `]
})
export class SeparatorBlockComponent {
  readonly block = input.required<SeparatorBlock>();
}
