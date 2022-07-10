import { Product } from './Product';

export class OrderedProduct {
    private readonly _product: Product;
    private readonly _quantity: number;

    constructor(product: Product, quantity: number) {
        this._product = product;
        this._quantity = quantity;
    }

    get Product(): Product {
        return this._product;
    }

    get Quantity(): number {
        return this._quantity;
    }
}
