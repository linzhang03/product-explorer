import { Routes } from '@angular/router';
import { ProductsPageComponent } from '../pages/products-page.component';
import { ProductDetailPageComponent } from '../pages/product-detail-page.component';
import { ProductDetailResolver } from '../resolvers/product-detail.resolver';

export const PRODUCTS_ROUTES: Routes = [
  { path: '', component: ProductsPageComponent },
  {
    path: ':id',
    component: ProductDetailPageComponent,
    resolve: { pr: ProductDetailResolver }
  }
];
