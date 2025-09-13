import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule],
  template: `<div class="container"><h2>404 — Not Found</h2>
   <div><a class="btn" [routerLink]="['/products']">Cancel</a></div>
   </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundComponent {}
