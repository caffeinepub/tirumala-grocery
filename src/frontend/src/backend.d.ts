import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Product {
    id: bigint;
    name: string;
    description: string;
    imageUrl: string;
    category: string;
    price: bigint;
}
export interface backendInterface {
    addCategory(name: string): Promise<void>;
    addProduct(name: string, description: string, price: bigint, category: string, imageUrl: string): Promise<Product>;
    addToCart(productId: bigint): Promise<void>;
    clearCart(): Promise<void>;
    deleteCategory(name: string): Promise<void>;
    deleteProduct(id: bigint): Promise<void>;
    getAllCategories(): Promise<Array<string>>;
    getAllProducts(): Promise<Array<Product>>;
    getCart(): Promise<Array<Product>>;
    getProduct(id: bigint): Promise<Product>;
    removeFromCart(productId: bigint): Promise<void>;
    updateProduct(id: bigint, name: string, description: string, price: bigint, category: string, imageUrl: string): Promise<Product>;
}
