import { Routes } from '@angular/router';
import { ProductsPageComponent } from './pages/products-page.component';
import { ProductDetailPageComponent } from './pages/product-detail-page.component';
import { AdminGuard } from './admin.guard';
import { LoginPageComponent } from './pages/login-page.component';

export const routes: Routes = [
    { path: '', redirectTo: 'products', pathMatch: 'full' },
    { path: 'products', 
        component: ProductsPageComponent
    },
    { path: 'products/:id', 
        loadComponent: ()=>import('./pages/product-detail-page.component').then(m=>m.ProductDetailPageComponent) },

    // --- Admin feature (lazy, guarded) ---
    {
        path: 'admin',
        canActivate: [AdminGuard],
        loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
    },

    { path: 'login', component: LoginPageComponent },

    { path: '**', redirectTo: 'login' }
];
