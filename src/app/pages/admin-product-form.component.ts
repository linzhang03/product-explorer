import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ProductService } from '../product.service';
import { debounceTime, map, of, switchMap, take, catchError } from 'rxjs';


@Component({
selector: 'app-admin-product-form',
standalone: true,
imports: [CommonModule, RouterModule, ReactiveFormsModule],
template: `
<div class="container">
<div class="page-header">
<h1>{{ isEdit() ? 'Edit Product' : 'Create Product' }}</h1>
<span class="subtle">Reactive Form • Dynamic Fields • Async SKU Validation</span>
</div>


<form [formGroup]="form" (ngSubmit)="save()" style="display:grid; gap:12px; max-width:720px;">
<div class="card" style="padding:16px; display:grid; gap:12px;">
<label>
<div>Name</div>
<input formControlName="name" placeholder="Product name" />
<small *ngIf="fc('name').touched && fc('name').invalid" style="color:#b91c1c">
Name is required (min 3).
</small>
</label>

<label>
<div>Category</div>
<select formControlName="category">
<option value="">— Choose —</option>
<option *ngFor="let c of categories()" [value]="c">{{c}}</option>
</select>
<small *ngIf="fc('category').touched && fc('category').invalid" style="color:#b91c1c">Category is required.</small>
</label>


<label *ngIf="form.value.category === 'Lighting'">
<div>Lumens</div>
<input type="number" formControlName="lumens" placeholder="e.g., 600" />
<small *ngIf="fc('lumens').touched && fc('lumens').invalid" style="color:#b91c1c">Lumens required &gt; 0.</small>
</label>


<div class="row" style="gap:12px;">
<label style="flex:1">
<div>Price</div>
<input type="number" step="0.01" formControlName="price" placeholder="0.00" />
<small *ngIf="fc('price').touched && fc('price').invalid" style="color:#b91c1c">Price &gt; 0 required.</small>
</label>
<label class="row" style="gap:8px; align-items:center; margin-top:20px;">
<input type="checkbox" formControlName="inStock" /> <span>In Stock</span>
</label>
</div>

<label>
<div>SKU</div>
<input formControlName="sku" placeholder="Unique SKU" />
<small *ngIf="fc('sku').pending">Checking…</small>
<small *ngIf="fc('sku').touched && fc('sku').hasError('required')" style="color:#b91c1c">SKU is required.</small>
<small *ngIf="fc('sku').touched && fc('sku').hasError('skuTaken')" style="color:#b91c1c">SKU is already taken.</small>
</label>


<div>
<div class="row" style="justify-content:space-between; align-items:center;">
<strong>Tags</strong>
<button type="button" class="btn" (click)="addTag()">+ Add Tag</button>
</div>
<div style="display:grid; gap:8px; margin-top:8px;">
<div class="row" *ngFor="let ctrl of tags.controls; let i = index" style="gap:8px;">
<input [formControl]="ctrl" placeholder="tag" style="flex:1" />
<button type="button" class="btn" (click)="removeTag(i)">Remove</button>
</div>
</div>
</div>
</div>


<div class="row" style="gap:12px;">
<button class="btn primary" type="submit" [disabled]="form.invalid || form.pending || saving()">{{ isEdit() ? 'Update' : 'Create' }}</button>
<a class="btn" [routerLink]="['/products']">Cancel</a>
<span class="spacer"></span>
<span *ngIf="message()" class="subtle">{{message()}}</span>
</div>
</form>
</div>
`,
changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminProductFormComponent {
    private fb = inject(FormBuilder);
    private api = inject(ProductService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);


    categories = signal<string[]>([]);
    isEdit = signal(false);
    currentId = signal<number | null>(null);
    saving = signal(false);
    message = signal<string | null>(null);


    form = this.fb.group({
    id: this.fb.control<number | null>(null),
    name: this.fb.control<string>('', { validators: [Validators.required, Validators.minLength(3)] }),
    category: this.fb.control<string>('', { validators: [Validators.required] }),
    price: this.fb.control<number>(0, { validators: [Validators.required, Validators.min(0.01)] }),
    inStock: this.fb.control<boolean>(true),
    sku: this.fb.control<string>('', { validators: [Validators.required], asyncValidators: [this.uniqueSku()], updateOn: 'change' }),
    tags: this.fb.array<FormControl<string>>([]),
    lumens: this.fb.control<number | null>(null)
    });


    get tags(): FormArray<FormControl<string>> { return this.form.controls.tags; }
    fc<K extends keyof typeof this.form.controls>(key: K) { return this.form.controls[key]; }

    constructor(){
        // load categories
        this.api.categories().subscribe(c => this.categories.set(c));


        // toggle lumens validators based on category
        this.form.controls.category.valueChanges.subscribe(cat => {
        const ctrl = this.form.controls.lumens;
        if (cat === 'Lighting') {
        ctrl.addValidators([Validators.required, Validators.min(1)]);
        } else {
        ctrl.clearValidators();
        ctrl.setValue(null);
        }
        ctrl.updateValueAndValidity({ emitEvent: false });
    });


    // if editing, fetch and patch
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
        this.isEdit.set(true);
        const id = Number(idParam);
        this.currentId.set(id);
        this.api.detail(id).subscribe(({ product }) => {
        // patch values
        this.form.patchValue({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        inStock: (product.stock || 0) > 0,
        sku: product.sku,
        lumens: product.category === 'Lighting' ? (product.lumens ?? null) : null
        });
        // tags
        (product.tags || []).forEach(t => this.tags.push(this.fb.control<string>(t, { nonNullable: true })));
        });
        }
    }

    addTag(){ this.tags.push(this.fb.control<string>('', { nonNullable: true })); }
    removeTag(i: number){ this.tags.removeAt(i); }


    uniqueSku(){
        return (control: AbstractControl) => {
        const value = String(control.value || '').trim();
        if (!value) return of(null);
        return of(value).pipe(
        debounceTime(350),
        switchMap(v => this.api.skuExists(v)),
        map(res => {
        const id = this.currentId();
        if (res.exists && res.id !== id) return { skuTaken: true } as ValidationErrors;
        return null;
        }),
        take(1),
        catchError(() => of(null))
        );
        };
    }

    save(){
        this.message.set(null);
        if (this.form.invalid || this.form.pending) return;
        const v = this.form.getRawValue();
        const payload: any = {
        name: v.name,
        category: v.category,
        price: v.price,
        inStock: !!v.inStock,
        sku: v.sku,
        tags: (v.tags || []).filter(Boolean),
        lumens: v.category === 'Lighting' ? v.lumens : undefined
    };

    this.saving.set(true);
    const done = () => this.saving.set(false);

    if (this.isEdit()) {
        const id = this.currentId()!;
        this.api.update(id, payload).subscribe({
        next: () => { this.message.set('Updated successfully.'); done(); this.router.navigate(['/products']); },
        error: (err) => { this.message.set(err?.error?.message || 'Update failed'); done(); }
        });
        } else {
        // new: give a default stock if inStock true (API will coerce)
        payload.stock = v.inStock ? 10 : 0;
        this.api.create(payload).subscribe({
        next: () => { this.message.set('Created successfully.'); done(); this.router.navigate(['/products']); },
        error: (err) => { this.message.set(err?.error?.message || 'Create failed'); done(); }
        });
        }
    }
}