import { Routes } from '@angular/router';

// Lazy admin feature routes (parent path '/admin' is defined in app.routes.ts)
export const ADMIN_ROUTES: Routes = [
  {
    path: 'products/new',
    loadComponent: () =>
      import('../pages/admin-product-form.component')
        .then(m => m.AdminProductFormComponent)
  },
  {
    path: 'products/:id/edit',
    loadComponent: () =>
      import('../pages/admin-product-form.component')
        .then(m => m.AdminProductFormComponent)
  },
  // default admin landing
  { path: '', pathMatch: 'full', redirectTo: 'products/new' }
];
