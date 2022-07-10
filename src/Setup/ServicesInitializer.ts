import { MongoUriBuilderConfig } from 'mongo-uri-builder';
import { ServicesContainer } from '../Ioc/ServiceContainer';
import { TransactionsService } from '../Transactions/TransactionService';
import { OrdersService } from '../Orders/OrdersService';
import { MongoDatabaseProvider } from '../Mongo/MongoDatabaseProvider';
import { Order } from '../Orders/Order';
import { Product } from '../Products/Product';
import { Transaction } from '../Transactions/Transaction';
import { ICommandProcessor } from '../Commands/ICommandProcessor';
import { CreateOrderCommandProcessor } from '../Orders/CreateOrderCommand';
import { UpdateProductQuantityCommandProcessor } from '../Products/UpdateProductQuantityCommand';

interface IConfig {
  Mongo: Partial<MongoUriBuilderConfig>;
}

export class ServicesInitializer {
  public async InitServices(): Promise<void> {
    const Config: IConfig = {
      Mongo: {
        database: 'test',
      },
    };

    const mongodbProvider = new MongoDatabaseProvider(Config.Mongo);
    await mongodbProvider.Init();

    // @ts-ignore
    ServicesContainer.RegisterCollection(Order.name, await mongodbProvider.GetMongoCollection(Order), Order);
    // @ts-ignore
    ServicesContainer.RegisterCollection(Product.name, await mongodbProvider.GetMongoCollection(Product), Product);
    // @ts-ignore
    ServicesContainer.RegisterCollection(Transaction.name, await mongodbProvider.GetMongoCollection(Transaction), Transaction);

    const commandsProcessors: ICommandProcessor[] = [];
    commandsProcessors.push(new CreateOrderCommandProcessor());
    commandsProcessors.push(new UpdateProductQuantityCommandProcessor());

    ServicesContainer.RegisterCommandProcessors(commandsProcessors);

    ServicesContainer.RegisterService<TransactionsService>(TransactionsService.name, new TransactionsService());
    ServicesContainer.RegisterService<OrdersService>(OrdersService.name, new OrdersService());
  }
}
