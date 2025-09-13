import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../product.service';
import { CartStore } from '../cart.store';


@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: "product-detail-page.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailPageComponent {
    private route = inject(ActivatedRoute);
    private api = inject(ProductService);
    private cart = inject(CartStore);

    product = signal<any | null>(null);
    related = signal<any[]>([]);
    loaded = signal(false);


    ngOnInit(){
        this.route.data.subscribe(d => {
        const pr = d['pr'];            // <-- value resolved by ProductDetailResolver
        if (pr) {
            console.log(JSON.stringify(pr));
            this.product.set(pr.product);
            this.related.set(pr.related);
        }
        this.loaded.set(true);
        });
    }

    add() { const p = this.product(); if (p) this.cart.addOptimistic(p, 1); }
}