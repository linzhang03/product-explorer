import { Component } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';


const P = (id:number)=>({ id, sku:'S'+id, name:'N'+id, category:'C', price:1, stock:1 });


@Component({ selector: 'host-comp', template: `<app-product-list [items]="items"></app-product-list>`, standalone: true, imports: [ProductListComponent, HttpClientTestingModule, RouterTestingModule] })
class Host {}


describe('ProductListComponent trackBy & OnPush', () => {
let fixture: ComponentFixture<Host>;


beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    (fixture.componentInstance as any).items = [P(1), P(2)];
    fixture.detectChanges();
});


it('reuses DOM nodes with trackBy', () => {
    const firstBefore = fixture.nativeElement.querySelectorAll('.card')[0];
    // assign a new array with same ids
    (fixture.componentInstance as any).items = [P(1), P(2)];
    fixture.detectChanges();
    const firstAfter = fixture.nativeElement.querySelectorAll('.card')[0];
    expect(firstAfter).toBe(firstBefore); // reused
});


it('uses OnPush change detection', () => {
    // sanity: the component decorator sets OnPush; verifying metadata indirectly
    const cmpDef: any = (ProductListComponent as any).ɵcmp;
    expect(!!cmpDef.onPush).toBeTrue();
});
});