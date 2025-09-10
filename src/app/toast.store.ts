import { Injectable, signal } from '@angular/core';

export interface Toast { id: number; message: string; ttl: number; }

@Injectable({ providedIn: 'root' })
export class ToastStore {
  private list = signal<Toast[]>([]);
  private id = 1;
  readonly toasts = this.list.asReadonly();

  show(message: string, ttlMs = 2500) {
    const toast: Toast = { id: this.id++, message, ttl: ttlMs };
    this.list.update(xs => [...xs, toast]);
    setTimeout(() => this.dismiss(toast.id), ttlMs);
  }

  dismiss(id: number) {
    this.list.update(xs => xs.filter(t => t.id !== id));
  }
}
