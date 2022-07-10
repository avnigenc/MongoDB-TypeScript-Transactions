import { Model } from 'mongoose';
import { Transaction } from '../Transactions/Transaction';
import { Order } from '../Orders/Order';
import { Product } from '../Products/Product';
import { ServicesContainer } from '../Ioc/ServiceContainer';
import { Guid } from '../Utils/Guid';

export class TestDbInitializer {
    private readonly _transactionCollection: Model<Transaction>;
    private readonly _ordersCollection: Model<Order>;
    private readonly _productsCollection: Model<Product>;

    constructor() {
        this._transactionCollection = ServicesContainer.GetService(Transaction.name);
        this._ordersCollection = ServicesContainer.GetService(Order.name);
        this._productsCollection = ServicesContainer.GetService(Product.name);
    }

    async InitTestDb() {
        await this.ResetAllCollections();
        await this.InsertDemoProducts();
    }

    private async ResetAllCollections(): Promise<void> {
        await this._productsCollection.deleteMany();
        await this._ordersCollection.deleteMany();
        await this._transactionCollection.deleteMany();
    }

    async InsertDemoProducts(numberOfProducts: number = 5, initialQuantity: number = 10): Promise<void> {
        const sampleProducts: Product[] = [];

        for (let i = 0; i < numberOfProducts; i++) {
            const product = new Product();
            product.ProductId = Guid.NewGuid();
            product.Name= 'Sample Product ' + (i + 1);
            product.Description= 'Great product - Good value for money';
            product.InStockAmount= initialQuantity;
            sampleProducts.push(product);
        }

        await this._productsCollection.insertMany(sampleProducts);
    }
}
