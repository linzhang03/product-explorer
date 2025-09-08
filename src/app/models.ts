export interface Product {
id: number;
name: string;
category: string;
price: number;
stock: number;
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