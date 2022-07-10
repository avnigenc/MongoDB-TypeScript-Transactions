// eslint-disable-next-line max-classes-per-file
import { Model } from 'mongoose';
import { Service } from 'typedi';
import { CommandOperator } from '../Commands/CommandOperator';
import { ICommand } from '../Commands/ICommand';
import { Product } from './Product';
import { ICommandProcessor } from '../Commands/ICommandProcessor';
import { ServicesContainer } from '../Ioc/ServiceContainer';
import { Transaction } from '../Transactions/Transaction';

export class UpdateProductQuantityCommand implements ICommand {
  public Product: Product;

  public Operator: CommandOperator;

  public Value: number;

  constructor(product: Product, operator: CommandOperator, value: number) {
    this.Product = product;
    this.Operator = operator;
    this.Value = value;
  }
}

@Service()
export class UpdateProductQuantityCommandProcessor implements ICommandProcessor {
  private readonly productsCollection: Model<Product>;

  private readonly name: string = UpdateProductQuantityCommand.name;

  public constructor() {
    this.productsCollection = ServicesContainer.GetService<Model<Product>>(Product.name);
  }

  get Name(): string {
    return this.name;
  }

  // eslint-disable-next-line class-methods-use-this
  public CanProcess(command: ICommand): command is UpdateProductQuantityCommand {
    return !!(command as UpdateProductQuantityCommand);
  }

  public async Process(command: ICommand, transaction: Transaction): Promise<void> {
    const processedCommand = UpdateProductQuantityCommandProcessor.ValidateCommand(command);

    const updateDefinitions = {
      $inc: { InStockAmount: processedCommand.Value },
      $push: { Transactions: transaction.TransactionId },
    };

    const updatedProduct = await this.productsCollection
      .findOneAndUpdate(
        {
          ProductId: processedCommand.Product.ProductId,
        },
        updateDefinitions,
      );

    if (updatedProduct != null) {
      console.log(`Processed ProductID: ${updatedProduct._id}`);
    }
  }

  public async RollBack(command: ICommand, transaction: Transaction): Promise<void> {
    const processedCommand = UpdateProductQuantityCommandProcessor.ValidateCommand(command);

    const savedProduct = await this.productsCollection.findOne({
      ProductId: processedCommand.Product.ProductId,
    });

    // If the product is not found in the collection
    if (!savedProduct || savedProduct.Transactions == null || !savedProduct.Transactions.length) return;
    // If the product wasn't affected by the current transaction
    if (!savedProduct.Transactions.includes(transaction.TransactionId)) return;

    const updateDefinitions = {
      $inc: { InStockAmount: -processedCommand.Value },
      $pull: { Transactions: { $in: [transaction.TransactionId] } },
    };

    const updatedProduct = await this.productsCollection
      .findOneAndUpdate({
        ProductId: processedCommand.Product.ProductId,
      },
      updateDefinitions);

    if (updatedProduct != null) {
      console.log(`RollBacked ProductID: ${updatedProduct._id}`);
    }
  }

  private static ValidateCommand(command: ICommand): UpdateProductQuantityCommand {
    const validatedCommand = command as UpdateProductQuantityCommand;

    // Only update operations are allowed, since 'replace' operations can't be rolled back securely
    if (validatedCommand === null || validatedCommand.Operator !== CommandOperator.Add) {
      throw new Error('Unsupported command or command-operator passed to processor');
    }

    return validatedCommand;
  }
}
