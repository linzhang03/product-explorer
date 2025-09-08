import { AsyncPipe, CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, map, of, Subject, switchMap, tap } from 'rxjs';
import { ProductFiltersComponent } from '../components/product-filters.component';
import { ProductListComponent } from '../components/product-list.component';
import { ProductService } from '../product.service';


@Component({
    selector: 'app-products-page',
    standalone: true,
    imports: [CommonModule, RouterModule, ProductFiltersComponent, ProductListComponent],
    templateUrl: "products-page.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsPageComponent {
private api = inject(ProductService);
private router = inject(Router);
private route = inject(ActivatedRoute);


// Signals for view state
items = signal([] as any[]);
total = signal(0);
page = signal(1);
pageSize = signal(12);
loading = signal(false);
error = signal<string | null>(null);
categories = signal<string[]>([]);


private filter$ = new Subject<any>();


constructor(){
// Load categories once
this.api.categories().subscribe(c => this.categories.set(c));


// Initialize from URL query params
const qp = this.route.snapshot.queryParamMap;
const init = {
q: qp.get('q') ?? '',
categories: (qp.get('category') ?? '').split(',').filter(Boolean),
inStock: qp.get('inStock') === null ? null : qp.get('inStock') === 'true',
sort: (qp.get('sort') as any) ?? 'id',
order: (qp.get('order') as any) ?? 'asc',
page: Number(qp.get('page') ?? '1')
};
this.page.set(init.page);


// push initial filters
this.filter$.next(init);


// Debounce + cancel in-flight requests
this.filter$
.pipe(
    tap(value=>console.log("filter is change: " + value)),
    debounceTime(300),
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    switchMap(filters => {
    this.loading.set(true);
    this.error.set(null);
    // persist to URL
    this.router.navigate([], { queryParams: this.toQueryParams(filters), queryParamsHandling: '' });
    return this.api.list({ ...filters, page: this.page(), pageSize: this.pageSize() })
    .pipe(
        tap(()=>console.log("api is called")),
        catchError(err => {
        this.error.set('Failed to load products');
        return of({ total: 0, page: 1, pageSize: this.pageSize(), items: [] });
        })
    );
    })
)
.subscribe(res => {
    this.items.set(res.items);
    this.total.set(res.total);
    this.loading.set(false);
});
}

toQueryParams(f: any){
    const qp: any = {};
    if (f.q) qp.q = f.q;
    if (f.categories?.length) qp.category = f.categories.join(',');
    if (f.inStock != null) qp.inStock = String(f.inStock);
    if (f.sort) qp.sort = f.sort;
    if (f.order) qp.order = f.order;
    if (this.page()) qp.page = this.page();
    return qp;
}


onFilterChanged(f: any){
    console.log("f is changed: " + f);
    this.page.set(1); // reset page on filter change
    this.filter$.next(f);
}


nextPage(){
if (this.page() < this.totalPages()){
this.page.update(x => x + 1);
this.filter$.next(this.routeToFilter());
}
}


prevPage(){
if (this.page() > 1){
this.page.update(x => x - 1);
this.filter$.next(this.routeToFilter());
}
}


totalPages(){
return Math.max(1, Math.ceil(this.total() / this.pageSize()));
}


private routeToFilter(){
const qp = this.route.snapshot.queryParamMap;
return {
q: qp.get('q') ?? '',
categories: (qp.get('category') ?? '').split(',').filter(Boolean),
inStock: qp.get('inStock') === null ? null : qp.get('inStock') === 'true',
sort: (qp.get('sort') as any) ?? 'id',
order: (qp.get('order') as any) ?? 'asc'
};
}
}