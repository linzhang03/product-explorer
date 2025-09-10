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
templateUrl: "admin-product-form.component.html",
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
            catchError(() => of(null)));
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
        });} else {
        // new: give a default stock if inStock true (API will coerce)
            payload.stock = v.inStock ? 10 : 0;
            this.api.create(payload).subscribe({
                next: () => { this.message.set('Created successfully.'); done(); this.router.navigate(['/products']); },
                error: (err) => { this.message.set(err?.error?.message || 'Create failed'); done(); }
            });
        }
    }
}