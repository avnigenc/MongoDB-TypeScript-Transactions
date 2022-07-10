import { Model } from 'mongoose';
import { Service } from 'typedi';
import { Transaction } from './Transaction';
import { ICommandProcessor } from '../Commands/ICommandProcessor';
import { ICommand } from '../Commands/ICommand';
import { TransactionStatus } from './TransactionStatus';
import { ServicesContainer } from '../Ioc/ServiceContainer';

enum TransactionProcessAction {
  Commit,
  RollBack,
}

@Service()
export class TransactionsService {
  private readonly transactionCollection: Model<Transaction>;

  private readonly commandsProcessors: ICommandProcessor[];

  public constructor() {
    this.transactionCollection = ServicesContainer.GetService<Model<Transaction>>(Transaction.name);
    this.commandsProcessors = ServicesContainer.GetService<ICommandProcessor[]>('CommandProcessors');
  }

  async InitTransaction(transactionCommands: ICommand[]): Promise<Transaction> {
    if (transactionCommands == null || transactionCommands.length === 0) throw new Error('Commands cant be null or empty');

    const transaction = new Transaction();
    transaction.Commands = transactionCommands;

    await this.transactionCollection.create(transaction);

    return transaction;
  }

  async CommitTransaction(transaction: Transaction): Promise<void> {
    await this.ProcessTransaction(transaction, TransactionProcessAction.Commit);

    transaction.Status = TransactionStatus.Completed;

    await this.transactionCollection.findOneAndUpdate<Transaction>(
      { _id: transaction._id },
      transaction,
    );
  }

  async RollBackTransaction(transaction: Transaction): Promise<void> {
    await this.ProcessTransaction(transaction, TransactionProcessAction.RollBack);

    transaction.Status = TransactionStatus.RolledBack;

    await this.transactionCollection.findOneAndUpdate<Transaction>(
      { _id: transaction._id },
      transaction,
    );
  }

  private async ProcessTransaction(transaction: Transaction, action: TransactionProcessAction): Promise<void> {
    if (transaction._id == null || !transaction.Commands?.length) throw new Error('Only initialized transactions can be processed');

    // eslint-disable-next-line no-restricted-syntax
    for (const command of transaction.Commands) {
      const commandProcessor = this.commandsProcessors.find((p) => command.constructor.name === p.Name);

      if (commandProcessor == null) throw new Error('Corresponding command processor was not initialized');

      switch (action) {
        case TransactionProcessAction.Commit:
          // eslint-disable-next-line no-await-in-loop
          await commandProcessor.Process(command, transaction);
          break;
        case TransactionProcessAction.RollBack:
          // eslint-disable-next-line no-await-in-loop
          await commandProcessor.RollBack(command, transaction);
          break;
        default:
          throw new Error('Argument must be provided TransactionProcessAction');
      }
    }
  }
}
