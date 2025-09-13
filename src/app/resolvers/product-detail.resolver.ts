import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, catchError, of } from 'rxjs';
import { ProductService } from '../product.service';
import { ProductWithRelated } from '../models';


@Injectable({ providedIn: 'root' })
export class ProductDetailResolver implements Resolve<ProductWithRelated | null> {
    constructor(private api: ProductService, private router: Router) {}
    resolve(route: ActivatedRouteSnapshot): Observable<ProductWithRelated | null> {
            const id = Number(route.paramMap.get('id'));
            return this.api.detail(id).pipe(
            catchError(() => {
            this.router.navigate(['/not-found']);
            return of(null);
            })
        );
    }
}