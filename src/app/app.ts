import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CartWidgetComponent } from "./components/cart-widget.component";
import { ToastContainerComponent } from "./components/toast-container.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CartWidgetComponent, ToastContainerComponent],
  template: `<h1>Hello, product-explorer</h1>
    <router-outlet />
    <app-cart-widget></app-cart-widget>
    <app-toast-container></app-toast-container>`,
  standalone: true,
  styleUrl: './app.scss'
})
export class App {
  //protected readonly title = signal('product-explorer');
}
