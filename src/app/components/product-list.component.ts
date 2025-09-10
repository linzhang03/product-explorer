import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../models';
import { CartStore } from '../cart.store';


@Component({
selector: 'app-product-list',
standalone: true,
imports: [CommonModule, RouterModule],
templateUrl: "product-list.component.html",
changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
    private cart = inject(CartStore);

    @Input() items: Product[] = [];

    trackById = (_: number, p: Product) => p.id;

    add(p: Product) { this.cart.addOptimistic(p, 1); }
}