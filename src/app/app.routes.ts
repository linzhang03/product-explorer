import { Routes } from '@angular/router';
import { ProductsPageComponent } from './pages/products-page.component';
import { ProductDetailPageComponent } from './pages/product-detail-page.component';
import { AdminProductFormComponent } from './pages/admin-product-form.component';

export const routes: Routes = [
    { path: '', redirectTo: 'products', pathMatch: 'full' },
    { path: 'products', component: ProductsPageComponent },
    { path: 'products/:id', component: ProductDetailPageComponent },
    // Challenge 2 routes
    { path: 'admin/products/new', component: AdminProductFormComponent },
    { path: 'admin/products/:id/edit', component: AdminProductFormComponent },
    { path: '**', redirectTo: 'products' }
];
