import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h2>Mock Login</h2>
      <p>This is a mock page to enable admin routes.</p>
      <button class="btn primary" (click)="login()">Log in as Admin</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPageComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  login(): void {
    this.auth.loginAsAdmin();
    this.router.navigateByUrl('/admin');
  }
}
