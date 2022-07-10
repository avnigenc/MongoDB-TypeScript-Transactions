import { Service } from 'typedi';
import { ICommand } from '../Commands/ICommand';
import { ServicesContainer } from '../Ioc/ServiceContainer';
import { OrderedProduct } from '../Products/OrderedProduct';
import { CreateOrderCommand } from './CreateOrderCommand';
import { TransactionsService } from '../Transactions/TransactionService';
import { UpdateProductQuantityCommand } from '../Products/UpdateProductQuantityCommand';
import { CommandOperator } from '../Commands/CommandOperator';

@Service()
export class OrdersService {
  private readonly transactionsService: TransactionsService;

  constructor() {
    this.transactionsService = ServicesContainer.GetService<TransactionsService>(TransactionsService.name);
  }

  public async CreateOrder(customerId: string, productsAndAmounts: OrderedProduct[]): Promise<void> {
    const createOrderTransactionCommands: ICommand[] = [];

    createOrderTransactionCommands.push(new CreateOrderCommand(customerId, productsAndAmounts));
    productsAndAmounts.map((t) => createOrderTransactionCommands.push(new UpdateProductQuantityCommand(t.Product, CommandOperator.Add, -t.Quantity)));

    const createOrderTransaction = await this.transactionsService.InitTransaction(createOrderTransactionCommands);

    try {
      await this.transactionsService.CommitTransaction(createOrderTransaction);
    } catch {
      await this.transactionsService.RollBackTransaction(createOrderTransaction);
    }
  }
}
