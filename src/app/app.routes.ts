import { Routes } from '@angular/router';
import { AdminGuard } from './admin.guard';
import { LoginPageComponent } from './pages/login-page.component';
import { NotFoundComponent } from './not-found.component';

export const routes: Routes = [
    { path: 'products', data: { preload: true },
      canActivate: [AdminGuard],
     loadChildren: () => import('./products/products.routes').then(m => m.PRODUCTS_ROUTES) 
    },
    // --- Admin feature (lazy, guarded) ---
    {
        path: 'admin',
        canActivate: [AdminGuard],
        loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
    },

    { path: 'not-found', canActivate: [AdminGuard], component: NotFoundComponent },
    { path: 'login', component: LoginPageComponent },
    { path: '**', redirectTo: 'login' }
];
