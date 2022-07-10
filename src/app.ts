import 'reflect-metadata';
import { ServicesInitializer } from './Setup/ServicesInitializer';
import { ServicesContainer } from './Ioc/ServiceContainer';
import { OrdersService } from './Orders/OrdersService';
import { OrderedProduct } from './Products/OrderedProduct';
import { Product } from './Products/Product';
import { TestDbInitializer } from './Setup/TestDbInitializer';
import { Model } from 'mongoose';
import { Guid } from './Utils/Guid';
import { setLogLevel, LogLevels } from '@typegoose/typegoose';

const Main = async () => {
    setLogLevel(LogLevels.DEBUG);

    await new ServicesInitializer().InitServices();
    await new TestDbInitializer().InitTestDb();

    await PerformDemoOrder();
}

const PerformDemoOrder = async () => {
    const ordersService = ServicesContainer.GetService<OrdersService>(OrdersService.name);
    const productsCollection = ServicesContainer.GetService<Model<Product>>(Product.name);

    const productsForOrder: Product[] = await productsCollection.find({ InStockAmount: { $gt: 0 } });
    const orderProducts: OrderedProduct[] = [];

    productsForOrder.map((product: Product) => orderProducts.push(new OrderedProduct(product, 1)));

    await ordersService.CreateOrder(Guid.NewGuid(), orderProducts);
}

Main().catch(console.error);
