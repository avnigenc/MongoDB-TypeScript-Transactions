import { Product } from './Product';

export class OrderedProduct {
  private readonly product: Product;

  private readonly quantity: number;

  constructor(_product: Product, _quantity: number) {
    this.product = _product;
    this.quantity = _quantity;
  }

  get Product(): Product {
    return this.product;
  }

  get Quantity(): number {
    return this.quantity;
  }
}
