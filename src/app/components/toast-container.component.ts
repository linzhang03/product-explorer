import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastStore } from '../toast.store';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-area">
      <div class="toast" *ngFor="let t of store.toasts()">{{t.message}}</div>
    </div>
  `,
  styles: [`
    .toast-area {
      position: fixed; left: 50%; transform: translateX(-50%);
      bottom: 90px; display: grid; gap: 8px; z-index: 50;
    }
    .toast {
      background: #111827; color: #fff; padding: 10px 14px;
      border-radius: 10px; box-shadow: var(--shadow);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastContainerComponent {
  store = inject(ToastStore);
}
