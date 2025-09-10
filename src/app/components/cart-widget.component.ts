import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartStore } from '../cart.store';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-cart-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: "cart-widget.component.html",
  styleUrl: './cart-widget.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartWidgetComponent {
  store = inject(CartStore);
  api = inject(ProductService);
  rate = 0;

  setRate(ev: Event) {
    const v = Number((ev.target as HTMLInputElement).value);
    this.rate = v;
    this.api.cartSetFailureRate(v).subscribe();
  }
}
