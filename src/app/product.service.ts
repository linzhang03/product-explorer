import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';
import { Paged, Product, ProductWithRelated } from './models';


@Injectable({ providedIn: 'root' })
export class ProductService {
    private http = inject(HttpClient);
    private base = environment.apiUrl;


    list(opts: {
    q?: string; categories?: string[]; inStock?: boolean | null;
    sort?: 'price' | 'name' | 'id'; order?: 'asc' | 'desc';
    page?: number; pageSize?: number;
    }): Observable<Paged<Product>> {
        let params = new HttpParams();
        if (opts.q) params = params.set('q', opts.q);
        if (opts.categories?.length) params = params.set('category', opts.categories.join(','));
        if (opts.inStock != null) params = params.set('inStock', String(opts.inStock));
        if (opts.sort) params = params.set('sort', opts.sort);
        if (opts.order) params = params.set('order', opts.order);
        if (opts.page) params = params.set('page', String(opts.page));
        if (opts.pageSize) params = params.set('pageSize', String(opts.pageSize));
        return this.http.get<Paged<Product>>(`${this.base}/products`, { params });
    }


    categories(): Observable<string[]> {
      return this.http.get<string[]>(`${this.base}/categories`);
    }


    detail(id: number): Observable<ProductWithRelated> {
      return this.http.get<ProductWithRelated>(`${this.base}/products/${id}`);
    }
}