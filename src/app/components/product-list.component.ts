import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../models';


@Component({
selector: 'app-product-list',
standalone: true,
imports: [CommonModule, RouterModule],
templateUrl: "product-list.component.html",
changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
    @Input() items: Product[] = [];
    trackById = (_: number, p: Product) => p.id;
}