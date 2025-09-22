import { Injectable, effect, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'auth.admin';
  private admin = signal<boolean>(false);

  constructor() {
    // Rehydrate from localStorage if available
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(this.storageKey) : null;
      if (raw != null) this.admin.set(raw === '1' || raw === 'true');
    } catch {}

    // Persist changes
    effect(() => {
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(this.storageKey, this.admin() ? '1' : '0');
        }
      } catch {}
    });
  }

  isAdmin(): boolean {
    return this.admin();
  }

  loginAsAdmin(): void {
    this.admin.set(true);
  }

  logout(): void {
    this.admin.set(false);
  }
}
