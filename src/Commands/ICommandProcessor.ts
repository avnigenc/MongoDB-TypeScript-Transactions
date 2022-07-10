import { ICommand } from './ICommand';
import { Transaction } from '../Transactions/Transaction';

export interface ICommandProcessor {
  CanProcess(command: ICommand): boolean;

  Process(command: ICommand, transaction: Transaction): void;

  RollBack(command: ICommand, transaction: Transaction): void;

  get Name(): string;
}
