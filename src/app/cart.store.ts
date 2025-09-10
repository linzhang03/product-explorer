import { Injectable, computed, effect, signal } from '@angular/core';
import { Product } from './models';
import { ProductService } from './product.service';
import { ToastStore } from './toast.store';

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  qty: number;
}

@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly storageKey = 'cart.v1';

  private itemsSig = signal<CartItem[]>([]);
  readonly items = computed(() => this.itemsSig());
  readonly count = computed(() => this.items().reduce((a, i) => a + i.qty, 0));
  readonly total = computed(() => this.items().reduce((a, i) => a + i.qty * i.price, 0));

  constructor(private api: ProductService, private toast: ToastStore) {
    // Rehydrate from localStorage
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) this.itemsSig.set(JSON.parse(raw));
    } catch {}

    // Persist to localStorage on change
    effect(() => {
      localStorage.setItem(this.storageKey, JSON.stringify(this.itemsSig()));
    });

    // Optional: sync from server on boot
    this.api.cartGet().subscribe({
      next: s => this.itemsSig.set((s.items ?? []) as CartItem[]),
      error: () => { /* ignore offline/server errors */ }
    });
  }

  // Merge-by-product rule (no duplicates): add increases quantity
  private mergeAdd(items: CartItem[], product: Product, qty: number): CartItem[] {
    const idx = items.findIndex(i => i.productId === product.id);
    if (idx === -1) {
      return [...items, { productId: product.id, name: product.name, price: product.price, qty }];
    }
    const next = items.slice();
    next[idx] = { ...next[idx], qty: next[idx].qty + qty };
    return next;
  }

  // Decrement quantity; remove row if <= 0
  private mergeRemove(items: CartItem[], productId: number, qty = 1): CartItem[] {
    const idx = items.findIndex(i => i.productId === productId);
    if (idx === -1) return items;
    const next = items.slice();
    const newQty = next[idx].qty - qty;
    if (newQty > 0) next[idx] = { ...next[idx], qty: newQty };
    else next.splice(idx, 1);
    return next;
  }

  addOptimistic(product: Product, qty = 1) {
    const prev = this.itemsSig();
    this.itemsSig.set(this.mergeAdd(prev, product, qty)); // optimistic UI

    this.api.cartAdd(product.id, qty).subscribe({
      next: () => { /* success: keep optimistic state */ },
      error: () => { this.itemsSig.set(prev); this.toast.show('Add to cart failed. Rolled back.'); }
    });
  }

  removeOptimistic(productId: number, qty = 1) {
    const prev = this.itemsSig();
    this.itemsSig.set(this.mergeRemove(prev, productId, qty)); // optimistic UI

    this.api.cartRemove(productId, qty).subscribe({
      next: () => { /* success */ },
      error: () => { this.itemsSig.set(prev); this.toast.show('Remove from cart failed. Rolled back.'); }
    });
  }
}
