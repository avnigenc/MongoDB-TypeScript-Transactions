// eslint-disable-next-line max-classes-per-file
import { Model } from 'mongoose';
import { Service } from 'typedi';
import { ICommand } from '../Commands/ICommand';
import { Order } from './Order';
import { ICommandProcessor } from '../Commands/ICommandProcessor';
import { Transaction } from '../Transactions/Transaction';
import { OrderedProduct } from '../Products/OrderedProduct';
import { ServicesContainer } from '../Ioc/ServiceContainer';

export class CreateOrderCommand implements ICommand {
  constructor(customerId: string, productsAndAmounts: OrderedProduct[]) {
    this.CustomerId = customerId;
    this.Products = productsAndAmounts;
  }

  public CustomerId: string;

  public Products: OrderedProduct[];

  public TransactionId?: string;
}

@Service()
export class CreateOrderCommandProcessor implements ICommandProcessor {
  private readonly ordersCollection: Model<Order>;

  private readonly name: string = CreateOrderCommand.name;

  constructor() {
    this.ordersCollection = ServicesContainer.GetService<Model<Order>>(Order.name);
  }

  get Name(): string {
    return this.name;
  }

  // eslint-disable-next-line class-methods-use-this
  public CanProcess(command: ICommand): command is CreateOrderCommand {
    return !!(command as CreateOrderCommand);
  }

  public async Process(command: ICommand, transaction: Transaction): Promise<void> {
    const processedCommand = command as CreateOrderCommand;

    if (processedCommand === null) throw new Error('Unsupported or empty command passed to processor');

    const order = {
      CustomerId: processedCommand.CustomerId,
      Products: processedCommand.Products,
      Transactions: [transaction.TransactionId],
    };

    await this.ordersCollection.create(order);
  }

  public async RollBack(command: ICommand, transaction: Transaction): Promise<void> {
    const processedCommand = command as CreateOrderCommand;

    if (processedCommand == null) throw new Error('Unsupported or empty command passed to processor');

    const insertedOrder = await this.ordersCollection
      .findOne({
        Transactions: { $in: [transaction.TransactionId] },
        ProductsAndQuantity: processedCommand.Products,
        CustomerId: processedCommand.CustomerId,
      });

    if (insertedOrder != null) {
      await this.ordersCollection.deleteOne({ OrderId: insertedOrder._id });
    }
  }
}
