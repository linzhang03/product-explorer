import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
selector: 'app-product-filters',
standalone: true,
imports: [CommonModule],
templateUrl: "product-filters.component.html",
changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductFiltersComponent {

@Input() categories: string[] = [];


q = signal('');
selectedCategories = signal<string[]>([]);
inStock = signal<'true'|'false'|'any'>('any');
sort = signal<'id'|'name'|'price'>('id');
order = signal<'asc'|'desc'>('asc');
page = signal(1);


@Output() changed = new EventEmitter<{
    q: string;
    categories: string[];
    inStock: boolean | null;
    sort: 'id'|'name'|'price';
    order: 'asc'|'desc';
    page: number;
}>();


ngOnInit(){ this.emit(); }


ngOnChanges(){ 
    console.log("On change is called");
    this.emit(); 
}


onCategoriesChange(ev: Event) {
    const sel = ev.target as HTMLSelectElement;
    const values = Array.from(sel.selectedOptions).map(o => o.value);
    this.selectedCategories.set(values);
    this.emit();
}

onSortChange(ev: Event){
    const sel = ev.target as HTMLSelectElement;
    this.sort.set(sel.value as 'id'|'name'|'price');
    this.emit();
}

onOrderChange(ev: Event){
    const sel = ev.target as HTMLSelectElement;
    this.order.set(sel.value as 'asc'|'desc');
    this.emit();
}

onInStockChange(ev: Event){
    const sel = ev.target as HTMLSelectElement;
    this.inStock.set(this.parseBool(sel.value));
    this.emit();
}


parseBool(v: string): 'true'|'false'|'any' { return (v as any); }


// Consumers call this after debounced input as well
emit(){
    this.changed.emit({
    q: this.q(),
    categories: this.selectedCategories(),
    inStock: this.inStock() === 'any' ? null : this.inStock() === 'true',
    sort: this.sort(),
    order: this.order(),
    page: this.page()
    });
    }
}
