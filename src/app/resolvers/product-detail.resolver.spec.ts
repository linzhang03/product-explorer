import { TestBed } from '@angular/core/testing';
import { ProductDetailResolver } from '../resolvers/product-detail.resolver';
import { ProductService } from '../product.service';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';


describe('ProductDetailResolver', () => {
let resolver: ProductDetailResolver;
let api: jasmine.SpyObj<ProductService>;
let router: jasmine.SpyObj<Router>;


beforeEach(() => {
    api = jasmine.createSpyObj('ProductService', ['detail']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({ providers: [ ProductDetailResolver, { provide: ProductService, useValue: api }, { provide: Router, useValue: router } ] });
    resolver = TestBed.inject(ProductDetailResolver);
});


it('resolves data on success', (done) => {
    api.detail.and.returnValue(of({ product: { id:1, sku:'S', name:'N', category:'C', price:1, stock:1 }, related: [] } as any));
    const route: any = { paramMap: new Map([['id','1']]), snapshot: {} };
    resolver.resolve(route).subscribe(v => { expect(v).toBeTruthy(); done(); });
});


it('redirects on error', (done) => {
    api.detail.and.returnValue(throwError(() => new Error('404')));
    const route: any = { paramMap: new Map([['id','999']]), snapshot: {} };
    resolver.resolve(route).subscribe(v => {
    expect(router.navigate).toHaveBeenCalledWith(['/not-found']);
    expect(v).toBeNull();
    done();
    });
});
});