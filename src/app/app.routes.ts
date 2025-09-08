import { Routes } from '@angular/router';
import { ProductsPageComponent } from './pages/products-page.component';
import { ProductDetailPageComponent } from './pages/product-detail-page.component';

export const routes: Routes = [
    { path: '', redirectTo: 'products', pathMatch: 'full' },
    { path: 'products', component: ProductsPageComponent },
    { path: 'products/:id', component: ProductDetailPageComponent },
    { path: '**', redirectTo: 'products' }
];
