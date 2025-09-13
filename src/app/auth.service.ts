import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private admin = signal<boolean>(false);

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
