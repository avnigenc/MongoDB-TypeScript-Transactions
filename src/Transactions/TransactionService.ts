import { Types, Model } from 'mongoose';
import { Transaction } from './Transaction';
import { ICommandProcessor } from '../Commands/ICommandProcessor';
import { ICommand } from '../Commands/ICommand';
import { TransactionStatus } from './TransactionStatus';
import { Service } from 'typedi';
import { ServicesContainer } from '../Ioc/ServiceContainer';
import { Guid } from '../Utils/Guid';

@Service()
export class TransactionsService {
    private readonly _transactionCollection: Model<Transaction>;

    private readonly _commandsProcessors: ICommandProcessor[];

    public constructor() {
        this._transactionCollection = ServicesContainer.GetService<Model<Transaction>>(Transaction.name);
        this._commandsProcessors = ServicesContainer.GetService<ICommandProcessor[]>('CommandProcessors');
    }

    async InitTransaction(transactionCommands: ICommand[]): Promise<Transaction> {
        if (transactionCommands == null || transactionCommands.length == 0)
            throw new Error('Commands cant be null or empty');

        const transaction = new Transaction();
        transaction._id= new Types.ObjectId();
        transaction.Commands= transactionCommands;
        transaction.TimeStamp= Date.now();
        transaction.TransactionId= Guid.NewGuid();

        await this._transactionCollection.create(transaction);

        return transaction;
    }

     async CommitTransaction(transaction: Transaction): Promise<void> {
        await this.ProcessTransaction(transaction, TransactionProcessAction.Commit);

        transaction.Status = TransactionStatus.Completed;

        await this._transactionCollection.findOneAndUpdate<Transaction>(
    {_id: transaction._id},
            transaction
        );
    }

    async RollBackTransaction(transaction: Transaction): Promise<void> {
        await this.ProcessTransaction(transaction, TransactionProcessAction.RollBack);

        transaction.Status = TransactionStatus.RolledBack;

        await this._transactionCollection.find<Transaction>(
            {_id: transaction._id},
            transaction
        );
    }

    private async ProcessTransaction(transaction: Transaction, action: TransactionProcessAction): Promise<void> {
        if (transaction._id == null || !transaction.Commands?.length)
            throw new Error('Only initialized transactions can be processed');

        for (const command of transaction.Commands) {

            const commandProcessor = await this._commandsProcessors.find(p => command.constructor.name === p.Name);

            if (commandProcessor == null)
                throw new Error('Corresponding command processor was not initialized');

            switch (action)
            {
                case TransactionProcessAction.Commit:
                    await commandProcessor.Process(command, transaction);
                    break;
                case TransactionProcessAction.RollBack:
                    await commandProcessor.RollBack(command, transaction);
                    break;
                default:
                    throw new Error('Argument must be provided TransactionProcessAction');
            }
        }
    }
}

enum TransactionProcessAction {
    Commit,
    RollBack
}
