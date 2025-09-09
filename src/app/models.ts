export interface Product {
    id: number;
    sku: string;
    name: string;
    category: string;
    price: number;
    stock: number; // >0 => in stock
    tags?: string[];
    lumens?: number; // for Lighting
}


export interface Paged<T> {
    total: number;
    page: number;
    pageSize: number;
    items: T[];
}


export interface ProductWithRelated {
product: Product;
related: Product[];
}