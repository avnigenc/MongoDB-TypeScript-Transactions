import { Model } from 'mongoose';
import { Transaction } from '../Transactions/Transaction';
import { Order } from '../Orders/Order';
import { Product } from '../Products/Product';
import { ServicesContainer } from '../Ioc/ServiceContainer';
import { Guid } from '../Utils/Guid';

export class TestDbInitializer {
  private readonly transactionCollection: Model<Transaction>;

  private readonly ordersCollection: Model<Order>;

  private readonly productsCollection: Model<Product>;

  constructor() {
    this.transactionCollection = ServicesContainer.GetService(Transaction.name);
    this.ordersCollection = ServicesContainer.GetService(Order.name);
    this.productsCollection = ServicesContainer.GetService(Product.name);
  }

  async InitTestDb() {
    await this.ResetAllCollections();
    await this.InsertDemoProducts();
  }

  private async ResetAllCollections(): Promise<void> {
    await this.productsCollection.deleteMany();
    await this.ordersCollection.deleteMany();
    await this.transactionCollection.deleteMany();
  }

  async InsertDemoProducts(numberOfProducts: number = 5, initialQuantity: number = 10): Promise<void> {
    const sampleProducts: Product[] = [];

    for (let i = 0; i < numberOfProducts; i++) {
      const product = new Product();
      product.ProductId = Guid.NewGuid();
      product.Name = `Sample Product ${i + 1}`;
      product.Description = 'Great product - Good value for money';
      product.InStockAmount = initialQuantity;
      sampleProducts.push(product);
    }

    await this.productsCollection.insertMany(sampleProducts);
  }
}
